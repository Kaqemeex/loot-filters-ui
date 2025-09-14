import { z } from 'zod'
import {
    FilterEggSchema,
    FilterIdSchema,
    FilterSchema,
    UpdateFilterSchema,
} from './filter'
import {
    FilterConfigurationEggSchema,
    FilterConfigurationIdSchema,
    FilterConfigurationSchema,
    UpdateFilterConfigurationSchema,
} from './filter-configuration'
import {
    FilterVersionEggSchema,
    FilterVersionIdSchema,
    FilterVersionSchema,
} from './filter-version'
import { FilterVersionSettingsSchema } from './filter-version-settings'

export const UpdateFilterVersionSettingsRequestSchema = z.object({
    filterId: z.string().nonempty(),
    versionId: z.string().nonempty(),
    settings: FilterVersionSettingsSchema,
})
export type UpdateFilterVersionSettingsRequest = z.infer<
    typeof UpdateFilterVersionSettingsRequestSchema
>

export type Resolve<T> = T extends z.ZodType
    ? z.infer<T>
    : T extends undefined
      ? void
      : never
export const LootFiltersApi = {
    // Filters
    createFilter: {
        inputSchema: FilterEggSchema,
        outputSchema: FilterIdSchema,
    },
    updateFilter: {
        inputSchema: UpdateFilterSchema,
        outputSchema: FilterSchema,
    },
    readFilter: {
        inputSchema: FilterIdSchema,
        outputSchema: FilterSchema,
    },
    deleteFilter: {
        inputSchema: FilterIdSchema,
        outputSchema: undefined,
    },
    listPublicFilters: {
        inputSchema: undefined,
        outputSchema: z.array(FilterSchema),
    },
    listMyFilters: {
        inputSchema: undefined,
        outputSchema: z.array(FilterSchema),
    },

    // Filter Versions
    createFilterVersion: {
        inputSchema: FilterVersionEggSchema,
        outputSchema: FilterVersionSchema,
    },
    readFilterVersion: {
        inputSchema: FilterVersionIdSchema,
        outputSchema: FilterVersionSchema,
    },
    updateSettingsOnFilterVersion: {
        inputSchema: UpdateFilterVersionSettingsRequestSchema,
        outputSchema: FilterVersionSchema,
    },
    deleteFilterVersion: {
        inputSchema: FilterVersionIdSchema,
        outputSchema: undefined,
    },
    listFilterVersions: {
        inputSchema: FilterIdSchema,
        outputSchema: z.array(FilterVersionSchema),
    },
    readCurrentFilterVersionSettings: {
        inputSchema: FilterIdSchema,
        outputSchema: FilterVersionSchema,
    },

    // Filter Configurations
    createFilterConfiguration: {
        inputSchema: FilterConfigurationEggSchema,
        outputSchema: FilterConfigurationSchema,
    },
    readFilterConfiguration: {
        inputSchema: FilterConfigurationIdSchema,
        outputSchema: FilterConfigurationSchema,
    },
    updateFilterConfiguration: {
        inputSchema: UpdateFilterConfigurationSchema,
        outputSchema: FilterConfigurationSchema,
    },
    deleteFilterConfiguration: {
        inputSchema: FilterConfigurationIdSchema,
        outputSchema: undefined,
    },
    listPublicFilterConfigurations: {
        inputSchema: undefined,
        outputSchema: z.array(FilterConfigurationSchema),
    },
    listMyFilterConfigurations: {
        inputSchema: undefined,
        outputSchema: z.array(FilterConfigurationSchema),
    },
} as const

export type ApiCallName = keyof typeof LootFiltersApi
export type Api = typeof LootFiltersApi
