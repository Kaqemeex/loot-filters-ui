import { FilterEgg, FilterVersionEgg } from '@loot-filters/core'
import { useAuthStore } from '../auth/authStore'

const API_BASE_URLS: Record<string, string> = {
    LOCAL_UI: 'http://localhost:8787',
    PROD: 'null',
}

const buildApiBaseUrl = (): string => {
    const env = window.location.hostname === 'localhost' ? 'LOCAL_UI' : 'PROD'
    return API_BASE_URLS[env]
}

export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const { sessionId } = useAuthStore.getState()

    const url = `${buildApiBaseUrl()}${endpoint}`
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    // Add custom headers from options
    if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
                headers[key] = value
            }
        })
    }

    // Add Authorization header if we have a session ID
    if (sessionId) {
        headers.Authorization = `Bearer ${sessionId}`
    }

    const response = await fetch(url, {
        ...options,
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

    return response.json()
}

export const publicApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = `${buildApiBaseUrl()}${endpoint}`
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    // Add custom headers from options
    if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
                headers[key] = value
            }
        })
    }

    // No authorization header for public requests

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
}

export const getMyFilters = () => {
    return apiRequest('/filters/mine')
}

export const getPublicFilters = () => {
    return publicApiRequest('/filters/public')
}

export const getFilter = (filterId: string) => {
    return apiRequest(`/filters/${filterId}`)
}

export const getFilterVersions = (filterId: string) => {
    return apiRequest(`/filters/${filterId}/versions`)
}

export const createFilter = (filter: FilterEgg) => {
    return apiRequest('/filters/create', {
        method: 'POST',
        body: JSON.stringify(filter),
    })
}

export const deleteFilter = (filterId: string) => {
    return apiRequest(`/filters/${filterId}/delete`, {
        method: 'DELETE',
    })
}

export const createFilterVersion = (
    filterId: string,
    filterVersion: FilterVersionEgg
) => {
    return apiRequest(`/filters/${filterId}/create-version`, {
        method: 'POST',
        body: JSON.stringify(filterVersion),
    })
}

export const updateFilter = (
    filterId: string,
    updates: { name?: string; description?: string; public?: boolean }
) => {
    return apiRequest(`/filters/${filterId}/update`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    })
}

export const getFilterSettings = (filterId: string) => {
    return apiRequest(`/filters/${filterId}/settings`)
}

export const updateFilterSettings = (filterId: string, settings: any) => {
    return apiRequest(`/filters/${filterId}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(settings),
    })
}
