import {
    FilterVersionEgg,
    FilterVersionEggSchema,
    FilterVersionSettingsSchema,
} from '@loot-filters/core'
import { eq } from 'drizzle-orm'
import { AutoRouterType, IRequest } from 'itty-router'
import { FILTER_VERSIONS_TABLE } from '../db/filters'
import {
    withOwnedFilter,
    withOwnedFilterOrPublic,
} from '../utils/withAuthenticatedUser'

const createFilterVersion = (router: AutoRouterType) => {
    router.post(
        '/filters/:filterId/create-version',
        withOwnedFilter,
        async (
            req: IRequest & {
                filterVersion: FilterVersionEgg
            },
            env
        ) => {
            const versionId = crypto.randomUUID()
            const body = (await req.json()) as any
            const egg = FilterVersionEggSchema.parse(body)

            try {
                // Use the data already provided in the egg
                const rawRs2f = egg.rawRs2f || ''
                const precompiledRs2f = egg.precompiledRs2f || ''
                const parsedMacros = egg.parsedMacros || []
                const settings = egg.settings || {
                    sections: [],
                    macroInputMappings: {},
                }

                const filterVersionObj: typeof FILTER_VERSIONS_TABLE.$inferInsert =
                    {
                        versionId,
                        name:
                            egg.name ||
                            `Version ${new Date().toLocaleDateString()}`,
                        filterId: req.filter.filterId,
                        rawRs2f,
                        precompiledRs2f,
                        parsedMacros: JSON.stringify(parsedMacros),
                        settings: JSON.stringify(settings),
                        createdAt: new Date().getTime(),
                    }

                const createdFilterVersion = await env.DB.insert(
                    FILTER_VERSIONS_TABLE
                )
                    .values(filterVersionObj)
                    .returning()
                    .get()

                return new Response(JSON.stringify(createdFilterVersion), {
                    status: 200,
                })
            } catch (error) {
                console.error('Error creating filter version:', error)
                return new Response(
                    JSON.stringify({
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Failed to create filter version',
                    }),
                    { status: 500 }
                )
            }
        }
    )
}

const getFilterVersions = (router: AutoRouterType) => {
    router.get(
        '/filters/:filterId/versions',
        withOwnedFilterOrPublic,
        async (req, env) => {
            const { filterId } = req.params
            const versions = await env.DB.select()
                .from(FILTER_VERSIONS_TABLE)
                .where(eq(FILTER_VERSIONS_TABLE.filterId, filterId))
                .orderBy(FILTER_VERSIONS_TABLE.createdAt)

            return new Response(JSON.stringify(versions), { status: 200 })
        }
    )
}

const setFilterVersionSettings = (router: AutoRouterType) => {
    router.put(
        '/filters/:filterId/versions/:versionId/settings',
        withOwnedFilter,
        async (req, env) => {
            const { versionId } = req.params
            const settings = FilterVersionSettingsSchema.parse(await req.json())
            const updatedVersion = await env.DB.update(FILTER_VERSIONS_TABLE)
                .set({ settings: JSON.stringify(settings) })
                .where(eq(FILTER_VERSIONS_TABLE.versionId, versionId))
                .returning()
                .get()

            return new Response(JSON.stringify(updatedVersion), {
                status: 200,
            })
        }
    )
}

export const configureFilterVersionApis = (router: AutoRouterType) => {
    createFilterVersion(router)
    getFilterVersions(router)
    setFilterVersionSettings(router)
}
