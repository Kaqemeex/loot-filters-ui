import { ApiCallName, LootFiltersApi, Resolve } from '@loot-filters/core'
import { AutoRouterType, IRequest } from 'itty-router'
import { Env } from '../env'
import {
    createFilterConfiguration,
    deleteFilterConfiguration,
    listMyFilterConfigurations,
    listPublicFilterConfigurations,
    readFilterConfiguration,
    updateFilterConfiguration,
} from './filter-configuration'
import {
    createFilter,
    deleteFilter,
    listMyFilters,
    listPublicFilters,
    readFilter,
    updateFilter,
} from './filter-routes'
import {
    createFilterVersion,
    deleteFilterVersion,
    listFilterVersions,
    readCurrentFilterVersionSettings,
    readFilterVersion,
    updateSettingsOnFilterVersion,
} from './filter-version'

export type ApiCall<K extends keyof typeof LootFiltersApi> = {
    call: (
        req: IRequest,
        env: Env,
        data: Resolve<(typeof LootFiltersApi)[K]['inputSchema']>
    ) => Promise<Resolve<(typeof LootFiltersApi)[K]['outputSchema']>>
    middleware: ((req: IRequest, env: Env) => Promise<Response | void>)[]
}

const serverCalls: Required<{
    [K in ApiCallName]: ApiCall<K>
}> = {
    createFilter,
    readFilter,
    updateFilter,
    deleteFilter,
    listMyFilters,
    listPublicFilters,

    createFilterVersion,
    readFilterVersion,
    updateSettingsOnFilterVersion,
    deleteFilterVersion,
    listFilterVersions,
    readCurrentFilterVersionSettings,

    createFilterConfiguration,
    readFilterConfiguration,
    updateFilterConfiguration,
    deleteFilterConfiguration,
    listPublicFilterConfigurations,
    listMyFilterConfigurations,
} as const

export const bindApi = (router: AutoRouterType) => {
    for (const [path, call] of Object.entries(serverCalls)) {
        console.log(`Binding API /api/v1/${path}`)

        router.post(
            `/api/v1/${path}`,
            ...call.middleware,
            async (req, env: Env) => {
                const callName = path as keyof typeof LootFiltersApi
                const apiDef = LootFiltersApi[callName]

                if (apiDef.inputSchema === undefined) {
                    const result = await call.call(req, env, undefined as any)
                    return new Response(JSON.stringify(result), {
                        status: 200,
                    })
                } else {
                    const body = await req.json()
                    const parseResult = apiDef.inputSchema.safeParse(body)

                    if (!parseResult.success) {
                        return new Response(JSON.stringify(parseResult.error), {
                            status: 400,
                        })
                    }

                    const result = await call.call(
                        req,
                        env,
                        parseResult.data as any
                    )

                    const outputSchema = apiDef.outputSchema
                    if (
                        outputSchema === undefined ||
                        result === undefined ||
                        result === null
                    ) {
                        return new Response('{"ok": true}', { status: 200 })
                    }

                    return new Response(JSON.stringify(result), {
                        status: 200,
                    })
                }
            }
        )
    }
}
