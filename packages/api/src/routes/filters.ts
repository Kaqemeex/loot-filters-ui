import { filterEggSchema, filterVersionEggSchema } from '@loot-filters/core'
import { eq } from 'drizzle-orm'
import { AutoRouterType, IRequest } from 'itty-router'
import { FILTERS_TABLE, filterVersions } from '../db/filters'
import {
    withAuthenticatedUser,
    withFilterOwner,
} from '../utils/withAuthenticatedUser'

type FilterInsert = typeof FILTERS_TABLE.$inferInsert

const createFilter = (router: AutoRouterType) => {
    router.post('/filters/create', withAuthenticatedUser, async (req, env) => {
        const parsedFilter = filterEggSchema.safeParse(
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
        withFilterOwner,
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
        withFilterOwner,
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

const createFilterVersion = (router: AutoRouterType) => {
    router.post(
        '/filters/:filterId/create-version',
        withFilterOwner,
        async (
            req: IRequest & { filter: typeof FILTERS_TABLE.$inferSelect },
            env
        ) => {
            const versionId = crypto.randomUUID()
            const egg = filterVersionEggSchema.parse(await req.json())
            const filterVersionObj: typeof filterVersions.$inferInsert = {
                ...egg,
                versionId,
                filterId: req.filter.filterId,
                createdAt: new Date(),
            }

            const createdFilterVersion = await env.DB.insert(filterVersions)
                .values(filterVersionObj)
                .returning()
                .get()

            return new Response(JSON.stringify(createdFilterVersion), {
                status: 200,
            })
        }
    )
}

export const configureFilterApis = (router: AutoRouterType) => {
    listPublicFilters(router)
    listMyFilters(router)
    createFilter(router)
    createFilterVersion(router)
    updateFilter(router)
    deleteFilter(router)
}
