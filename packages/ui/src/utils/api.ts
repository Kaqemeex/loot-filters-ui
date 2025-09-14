import {
    Api,
    ApiCallName,
    FilterConfigurationEgg,
    FilterConfigurationId,
    FilterConfigurationSchema,
    FilterEgg,
    FilterId,
    FilterIdSchema,
    FilterSchema,
    FilterVersionEgg,
    FilterVersionId,
    FilterVersionSchema,
    Resolve,
    UpdateFilter,
    UpdateFilterConfiguration,
    UpdateFilterVersionSettingsRequest,
} from '@loot-filters/core'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { useAuthStore } from '../auth/authStore'

export const API_BASE_URLS: Record<string, string> = {
    LOCAL_UI: 'http://localhost:8787',
    PROD: 'https://v2-api.kaqemeex.net',
}

const buildApiBaseUrl = (): string => {
    const env = window.location.hostname === 'localhost' ? 'LOCAL_UI' : 'PROD'
    const url = API_BASE_URLS[env]
    return url
}

const doApiRequest = async <T>(
    endpoint: string,
    body: any,
    publicRequest: boolean
): Promise<T> => {
    const { sessionId, checkAuth } = useAuthStore.getState()

    if (sessionId && !checkAuth()) {
        if (!publicRequest) {
            useAuthStore.getState().logout()
            throw new Error('Session expired')
        }
    }

    const url = `${buildApiBaseUrl()}${endpoint}`
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (sessionId) {
        headers.Authorization = `Bearer ${sessionId}`
    }

    console.log('Making API request:', { url, headers, body, sessionId })

    try {
        const requestBody = body !== undefined ? JSON.stringify(body) : '{}'
        const response = await fetch(url, {
            method: 'POST',
            body: requestBody,
            headers,
        })

        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - clear auth state if we had a session
                if (sessionId) {
                    useAuthStore.getState().logout()
                    throw new Error('Authentication failed')
                }
                throw new Error('Unauthorized')
            }
            throw new Error(`API request failed: ${response.statusText}`)
        }

        const json = await response.json()

        console.log('API response:', {
            call: endpoint,
            args: body,
            json,
            statusText: response.statusText,
        })
        return json
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

const apiRequest = async <K extends ApiCallName>(
    endpoint: string,
    body: any,
    schema: Api[K]['outputSchema']
): Promise<Resolve<Api[K]['outputSchema']>> => {
    const result = await doApiRequest(endpoint, body, false)
    if (schema) {
        return schema.parse(result) as Resolve<Api[K]['outputSchema']>
    } else {
        return result as Resolve<Api[K]['outputSchema']>
    }
}

const publicApiRequest = async <K extends ApiCallName>(
    endpoint: string,
    body: any,
    schema: Api[K]['outputSchema']
): Promise<Resolve<Api[K]['outputSchema']>> => {
    const result = await doApiRequest(endpoint, body, true)
    if (schema) {
        return schema.parse(result) as Resolve<Api[K]['outputSchema']>
    } else {
        return result as Resolve<Api[K]['outputSchema']>
    }
}

export type ApiCall<K extends ApiCallName> = (
    data: Resolve<Api[K]['inputSchema']>
) => Promise<Resolve<Api[K]['outputSchema']>>

const API_ROOT = `/api/v1`

type SuccessCallback<K extends ApiCallName> = (
    data: Resolve<Api[K]['outputSchema']>
) => void
type ErrorCallback = (error: any) => void

type HookResult<K extends ApiCallName> = {
    isLoading: boolean
    data: Resolve<Api[K]['outputSchema']> | null
    apiCall: (
        data: Resolve<Api[K]['inputSchema']>
    ) => Promise<Resolve<Api[K]['outputSchema']>>
}

const createApiHook = <K extends ApiCallName>(
    call: ApiCall<K>
): (() => HookResult<K>) => {
    return () => {
        const [isLoading, setIsLoading] = useState(false)
        const [data, setData] = useState<Resolve<
            Api[K]['outputSchema']
        > | null>(null)

        const [mostRecentArg, setMostRecentArg] = useState<Resolve<
            Api[K]['inputSchema']
        > | null>(null)
        const [mostRecentArgSet, setMostRecentArgSet] = useState(false)

        const apiCall = useCallback(
            async (data: Resolve<Api[K]['inputSchema']>) => {
                setIsLoading(true)
                setMostRecentArg(data)
                setMostRecentArgSet(true)
                const result = await call(data)
                setData(result)
                setIsLoading(false)
                return result
            },
            [
                call,
                setIsLoading,
                setMostRecentArg,
                setMostRecentArgSet,
                setData,
            ]
        )

        return { isLoading, data, apiCall }
    }
}

export const useCreateFilter = createApiHook<'createFilter'>(
    async (egg: FilterEgg) =>
        apiRequest<'createFilter'>(
            `${API_ROOT}/createFilter`,
            egg,
            FilterIdSchema
        )
)

export const useUpdateFilter = createApiHook<'updateFilter'>(
    async (updates: UpdateFilter) =>
        apiRequest<'updateFilter'>(
            `${API_ROOT}/updateFilter`,
            updates,
            FilterSchema
        )
)

export const useReadFilter = createApiHook<'readFilter'>(
    async (filterId: FilterId) =>
        apiRequest<'readFilter'>(
            `${API_ROOT}/readFilter`,
            filterId,
            FilterSchema
        )
)

export const useDeleteFilter = createApiHook<'deleteFilter'>(
    async (filterId: FilterId) =>
        apiRequest<'deleteFilter'>(
            `${API_ROOT}/deleteFilter`,
            filterId,
            undefined
        )
)

export const useListPublicFilters = createApiHook<'listPublicFilters'>(
    async () =>
        publicApiRequest<'listPublicFilters'>(
            `${API_ROOT}/listPublicFilters`,
            undefined,
            z.array(FilterSchema)
        )
)

export const useListMyFilters = createApiHook<'listMyFilters'>(async () => {
    return apiRequest<'listMyFilters'>(
        `${API_ROOT}/listMyFilters`,
        undefined,
        z.array(FilterSchema)
    )
})

export const useCreateFilterVersion = createApiHook<'createFilterVersion'>(
    async (filterVersion: FilterVersionEgg) =>
        apiRequest<'createFilterVersion'>(
            `${API_ROOT}/createFilterVersion`,
            filterVersion,
            FilterVersionSchema
        )
)

export const useReadFilterVersion = createApiHook<'readFilterVersion'>(
    async (filterVersionId: FilterVersionId) =>
        publicApiRequest<'readFilterVersion'>(
            `${API_ROOT}/readFilterVersion`,
            filterVersionId,
            FilterVersionSchema
        )
)

export const useUpdateSettingsOnFilterVersion =
    createApiHook<'updateSettingsOnFilterVersion'>(
        async (settings: UpdateFilterVersionSettingsRequest) =>
            apiRequest<'updateSettingsOnFilterVersion'>(
                `${API_ROOT}/updateSettingsOnFilterVersion`,
                settings,
                FilterVersionSchema
            )
    )

export const useDeleteFilterVersion = createApiHook<'deleteFilterVersion'>(
    async (filterVersionId: FilterVersionId) =>
        apiRequest<'deleteFilterVersion'>(
            `${API_ROOT}/deleteFilterVersion`,
            filterVersionId,
            undefined
        )
)

export const useListFilterVersions = createApiHook<'listFilterVersions'>(
    async (filterId: FilterId) =>
        publicApiRequest<'listFilterVersions'>(
            `${API_ROOT}/listFilterVersions`,
            filterId,
            z.array(FilterVersionSchema)
        )
)

export const useReadCurrentFilterVersionSettings =
    createApiHook<'readCurrentFilterVersionSettings'>(
        async (filterId: FilterId) =>
            publicApiRequest<'readCurrentFilterVersionSettings'>(
                `${API_ROOT}/readCurrentFilterVersionSettings`,
                filterId,
                FilterVersionSchema
            )
    )

// Filter Configuration API calls
export const useCreateFilterConfiguration =
    createApiHook<'createFilterConfiguration'>(
        async (egg: FilterConfigurationEgg) =>
            apiRequest<'createFilterConfiguration'>(
                `${API_ROOT}/createFilterConfiguration`,
                egg,
                FilterConfigurationSchema
            )
    )

export const useReadFilterConfiguration =
    createApiHook<'readFilterConfiguration'>(
        async (filterConfigurationId: FilterConfigurationId) =>
            publicApiRequest<'readFilterConfiguration'>(
                `${API_ROOT}/readFilterConfiguration`,
                filterConfigurationId,
                FilterConfigurationSchema
            )
    )

export const useUpdateFilterConfiguration =
    createApiHook<'updateFilterConfiguration'>(
        async (updates: UpdateFilterConfiguration) =>
            apiRequest<'updateFilterConfiguration'>(
                `${API_ROOT}/updateFilterConfiguration`,
                updates,
                FilterConfigurationSchema
            )
    )

export const useDeleteFilterConfiguration =
    createApiHook<'deleteFilterConfiguration'>(
        async (filterConfigurationId: FilterConfigurationId) =>
            apiRequest<'deleteFilterConfiguration'>(
                `${API_ROOT}/deleteFilterConfiguration`,
                filterConfigurationId,
                undefined
            )
    )

export const useListMyFilterConfigurations =
    createApiHook<'listMyFilterConfigurations'>(async () =>
        apiRequest<'listMyFilterConfigurations'>(
            `${API_ROOT}/listMyFilterConfigurations`,
            undefined,
            z.array(FilterConfigurationSchema)
        )
    )

export const useListPublicFilterConfigurations =
    createApiHook<'listPublicFilterConfigurations'>(async () =>
        publicApiRequest<'listPublicFilterConfigurations'>(
            `${API_ROOT}/listPublicFilterConfigurations`,
            undefined,
            z.array(FilterConfigurationSchema)
        )
    )

// just in case i forget to update the api calls
const apiCalls: Required<{
    [K in ApiCallName]: () => HookResult<K>
}> = {
    createFilter: useCreateFilter,
    updateFilter: useUpdateFilter,
    readFilter: useReadFilter,
    deleteFilter: useDeleteFilter,
    listPublicFilters: useListPublicFilters,
    listMyFilters: useListMyFilters,
    createFilterVersion: useCreateFilterVersion,
    readFilterVersion: useReadFilterVersion,
    updateSettingsOnFilterVersion: useUpdateSettingsOnFilterVersion,
    deleteFilterVersion: useDeleteFilterVersion,
    listFilterVersions: useListFilterVersions,
    readCurrentFilterVersionSettings: useReadCurrentFilterVersionSettings,
    createFilterConfiguration: useCreateFilterConfiguration,
    readFilterConfiguration: useReadFilterConfiguration,
    updateFilterConfiguration: useUpdateFilterConfiguration,
    deleteFilterConfiguration: useDeleteFilterConfiguration,
    listMyFilterConfigurations: useListMyFilterConfigurations,
    listPublicFilterConfigurations: useListPublicFilterConfigurations,
}
