import { idbStorage } from '../store/idbStorage'

export const downloadFile = (file: File) => {
    const link = document.createElement('a')

    try {
        const href = URL.createObjectURL(file)
        link.setAttribute('href', href)
        link.setAttribute('download', file.name)
        document.body.appendChild(link)
        link.click()
    } catch (error) {
        console.error(`Failed to download file: ${file.name}`, error)
    } finally {
        document.body.removeChild(link)
    }
}

export const idbKeys = [
    'filter-store',
    'filter-configuration-store',
    'editor-content',
    'onboarding-complete',
    'background-image-selected',
    'feature-flags',
]

export const legacyLocalStorageKeys = [
    'modular-filter-storage',
    'modular-filter-storage-migrated',
]

export const allStorageKeys = [...idbKeys, ...legacyLocalStorageKeys]

export const localState = async (): Promise<Record<string, unknown>> => {
    const idbEntries = await Promise.all(
        idbKeys.map(async (key) => {
            const value = await idbStorage.getItem(key)
            return [key, value] as [string, unknown]
        })
    )

    const lsEntries = legacyLocalStorageKeys
        .map((key) => {
            const raw = localStorage.getItem(key)
            return [key, raw !== null ? JSON.parse(raw) : null] as [
                string,
                unknown,
            ]
        })
        .filter(([, v]) => v !== null)

    return Object.fromEntries(
        [...idbEntries, ...lsEntries].filter(([, v]) => v !== null)
    )
}

export const uploadState = async (state: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(state)) {
        if (idbKeys.includes(key)) {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value
            await idbStorage.setItem(
                key,
                parsed as Parameters<typeof idbStorage.setItem>[1]
            )
        } else if (legacyLocalStorageKeys.includes(key)) {
            const serialized =
                typeof value === 'string' ? value : JSON.stringify(value)
            localStorage.setItem(key, serialized)
        }
    }
}

export const clearAllState = async () => {
    await Promise.all(idbKeys.map((key) => idbStorage.removeItem(key)))
    legacyLocalStorageKeys.forEach((key) => localStorage.removeItem(key))
}
