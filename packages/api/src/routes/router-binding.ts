import { Api, ApiCallName, LootFiltersApi, Resolve } from '@loot-filters/core'
import { AutoRouterType, IRequest } from 'itty-router'
import { z } from 'zod'
import { Env } from '../env'
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
} from './filter-version-service'

type ApiCall<
    I extends z.ZodType | undefined,
    O extends z.ZodType | undefined,
> = {
    call: (req: IRequest, env: Env, data: Resolve<I>) => Promise<Resolve<O>>
    middleware: ((req: IRequest, env: Env) => Promise<Response | void>)[]
}

type ServerCalls = Required<{
    [K in ApiCallName]: ApiCall<Api[K]['inputSchema'], Api[K]['outputSchema']>
}>

const serverCalls: ServerCalls = {
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
                    const result = await call.call(req, env, undefined)
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

                    const result = await call.call(req, env, parseResult.data)

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
