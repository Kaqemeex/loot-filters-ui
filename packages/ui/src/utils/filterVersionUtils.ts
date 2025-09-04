import { precompileFilter } from '@loot-filters/core'
import { createFilterVersion } from './api'

export interface CreateVersionOptions {
    filterId: string
    versionName: string
    rawRs2f: string
    settings?: any
}

export interface CreateVersionResult {
    success: boolean
    versionId?: string
    error?: string
}

/**
 * Creates a new filter version with precompiled RS2F content
 */
export const createFilterVersionWithPrecompiling = async (
    options: CreateVersionOptions
): Promise<CreateVersionResult> => {
    try {
        // Precompile the RS2F content
        const precompiledData = precompileFilter(options.rawRs2f)

        // Create the filter version with the precompiled data
        const newVersion = await createFilterVersion(options.filterId, {
            filterId: options.filterId,
            name: options.versionName,
            rawRs2f: options.rawRs2f,
            ...precompiledData,
            settings: options.settings || {
                sections: [],
                macroInputMappings: {},
            },
        })

        return {
            success: true,
            versionId: (newVersion as any)?.versionId,
        }
    } catch (error) {
        console.error('Failed to create filter version:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred',
        }
    }
}
