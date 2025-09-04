import { FilterEggSchema } from '@loot-filters/core'
import { eq } from 'drizzle-orm'
import { AutoRouterType, IRequest } from 'itty-router'
import { FILTERS_TABLE, FILTER_VERSIONS_TABLE } from '../db/filters'
import {
    withAuthenticatedUser,
    withOwnedFilter,
    withOwnedFilterOrPublic,
} from '../utils/withAuthenticatedUser'

type FilterInsert = typeof FILTERS_TABLE.$inferInsert

const createFilter = (router: AutoRouterType) => {
    router.post('/filters/create', withAuthenticatedUser, async (req, env) => {
        const parsedFilter = FilterEggSchema.safeParse(
            JSON.parse(await req.text())
        )
        if (!parsedFilter.success) {
            return new Response(JSON.stringify(parsedFilter.error), {
                status: 400,
            })
        }

        const newFilter: FilterInsert = {
            ...parsedFilter.data,
            filterId: crypto.randomUUID(),
            ownerDiscordId: req.auth.discordId,
            currentVersionId: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        try {
            const createdFilter = await env.DB.insert(FILTERS_TABLE)
                .values(newFilter)
                .returning()
                .get()
            return new Response(JSON.stringify(createdFilter), { status: 200 })
        } catch (err) {
            console.error('Error creating filter', err)
            return new Response(JSON.stringify(err), { status: 500 })
        }
    })
}

const updateFilter = (router: AutoRouterType) => {
    router.patch(
        '/filters/:filterId/update',
        withOwnedFilter,
        async (
            req: IRequest & { filter: typeof FILTERS_TABLE.$inferSelect },
            env
        ) => {
            const body = (await req.json()) as {
                name?: string
                description?: string
                public?: boolean
            }
            const { name, description, public: isPublic } = body

            // Validate that at least one field is provided
            if (!name && !description && isPublic === undefined) {
                return new Response(
                    JSON.stringify({
                        error: 'At least one field must be provided',
                    }),
                    { status: 400 }
                )
            }

            const updateData: Partial<FilterInsert> = {}
            if (name !== undefined) updateData.name = name
            if (description !== undefined) updateData.description = description
            if (isPublic !== undefined) updateData.public = isPublic
            updateData.updatedAt = new Date()

            try {
                const updatedFilter = await env.DB.update(FILTERS_TABLE)
                    .set(updateData)
                    .where(eq(FILTERS_TABLE.filterId, req.filter.filterId))
                    .returning()
                    .get()

                return new Response(JSON.stringify(updatedFilter), {
                    status: 200,
                })
            } catch (err) {
                console.error('Error updating filter', err)
                return new Response(JSON.stringify(err), { status: 500 })
            }
        }
    )
}

const deleteFilter = (router: AutoRouterType) => {
    router.delete(
        '/filters/:filterId/delete',
        withOwnedFilter,
        async (
            req: IRequest & { filter: typeof FILTERS_TABLE.$inferSelect },
            env
        ) => {
            await env.DB.delete(FILTERS_TABLE).where(
                eq(FILTERS_TABLE.filterId, req.filter.filterId)
            )

            return new Response(JSON.stringify({ message: 'Filter deleted' }), {
                status: 200,
            })
        }
    )
}

const listMyFilters = (router: AutoRouterType) => {
    router.get('/filters/mine', withAuthenticatedUser, async (req, env) => {
        const filters = await env.DB.select()
            .from(FILTERS_TABLE)
            .where(eq(FILTERS_TABLE.ownerDiscordId, req.auth.discordId))
            .orderBy(FILTERS_TABLE.createdAt)

        return new Response(JSON.stringify(filters), { status: 200 })
    })
}

const listPublicFilters = (router: AutoRouterType) => {
    router.get('/filters/public', async (req, env) => {
        const filters = await env.DB.select()
            .from(FILTERS_TABLE)
            .where(eq(FILTERS_TABLE.public, true))
            .orderBy(FILTERS_TABLE.createdAt)

        return new Response(JSON.stringify(filters), { status: 200 })
    })
}

const getFilter = (router: AutoRouterType) => {
    router.get('/filters/:filterId', async (req, env) => {
        const { filterId } = req.params
        const filter = await env.DB.select()
            .from(FILTERS_TABLE)
            .where(eq(FILTERS_TABLE.filterId, filterId))
            .get()

        return new Response(JSON.stringify(filter), { status: 200 })
    })
}

const getFilterSettings = (router: AutoRouterType) => {
    router.get(
        '/filters/:filterId/settings',
        withOwnedFilterOrPublic,
        async (req, env) => {
            const { filterId } = req.params

            // Get the current version of the filter
            const currentVersion = await env.DB.select()
                .from(FILTER_VERSIONS_TABLE)
                .where(eq(FILTER_VERSIONS_TABLE.filterId, filterId))
                .orderBy(FILTER_VERSIONS_TABLE.createdAt)
                .get()

            if (!currentVersion) {
                return new Response(
                    JSON.stringify({ sections: [], macroInputMappings: {} }),
                    { status: 200 }
                )
            }

            try {
                const settings = JSON.parse(currentVersion.settings)
                return new Response(JSON.stringify(settings), { status: 200 })
            } catch (error) {
                console.error('Error parsing filter settings:', error)
                return new Response(
                    JSON.stringify({ sections: [], macroInputMappings: {} }),
                    { status: 200 }
                )
            }
        }
    )
}

const getFilterVersionSettings = (router: AutoRouterType) => {
    router.get(
        '/filters/:filterId/versions/:versionId/settings',
        withOwnedFilterOrPublic,
        async (req, env) => {
            const { versionId } = req.params

            const version = await env.DB.select()
                .from(FILTER_VERSIONS_TABLE)
                .where(eq(FILTER_VERSIONS_TABLE.versionId, versionId))
                .get()

            if (!version) {
                return new Response(
                    JSON.stringify({ error: 'Version not found' }),
                    { status: 404 }
                )
            }

            try {
                const settings = JSON.parse(version.settings)
                return new Response(JSON.stringify(settings), { status: 200 })
            } catch (error) {
                console.error('Error parsing filter version settings:', error)
                return new Response(
                    JSON.stringify({ sections: [], macroInputMappings: {} }),
                    { status: 200 }
                )
            }
        }
    )
}

const updateFilterSettings = (router: AutoRouterType) => {
    router.patch(
        '/filters/:filterId/settings',
        withOwnedFilter,
        async (req, env) => {
            const { filterId } = req.params
            const settings = await req.json()

            // Get the current version of the filter
            const currentVersion = await env.DB.select()
                .from(FILTER_VERSIONS_TABLE)
                .where(eq(FILTER_VERSIONS_TABLE.filterId, filterId))
                .orderBy(FILTER_VERSIONS_TABLE.createdAt)
                .get()

            if (!currentVersion) {
                return new Response(
                    JSON.stringify({ error: 'No filter version found' }),
                    { status: 404 }
                )
            }

            try {
                const updatedVersion = await env.DB.update(
                    FILTER_VERSIONS_TABLE
                )
                    .set({ settings: JSON.stringify(settings) })
                    .where(
                        eq(
                            FILTER_VERSIONS_TABLE.versionId,
                            currentVersion.versionId
                        )
                    )
                    .returning()
                    .get()

                return new Response(JSON.stringify(updatedVersion), {
                    status: 200,
                })
            } catch (error) {
                console.error('Error updating filter settings:', error)
                return new Response(
                    JSON.stringify({ error: 'Failed to update settings' }),
                    { status: 500 }
                )
            }
        }
    )
}

export const configureFilterApis = (router: AutoRouterType) => {
    listPublicFilters(router)
    listMyFilters(router)
    getFilter(router)
    getFilterSettings(router)
    getFilterVersionSettings(router)
    updateFilterSettings(router)
    createFilter(router)
    updateFilter(router)
    deleteFilter(router)
}
