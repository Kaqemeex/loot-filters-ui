import { z } from 'zod'
import { FilterEggSchema, FilterSchema, UpdateFilterSchema } from './filter'
import { FilterVersionEggSchema, FilterVersionSchema } from './filter-version'
import { FilterVersionSettingsSchema } from './filter-version-settings'

export const FilterIdSchema = z.object({
    filterId: z.string().nonempty(),
})
export type FilterId = z.infer<typeof FilterIdSchema>

export const FilterVersionIdSchema = z.object({
    filterId: z.string().nonempty(),
    versionId: z.string().nonempty(),
})
export type FilterVersionId = z.infer<typeof FilterVersionIdSchema>

type Schema = {
    inputSchema: z.ZodType | undefined
    outputSchema: z.ZodType | undefined
}

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
} as const

export type ApiCallName = keyof typeof LootFiltersApi
export type Api = typeof LootFiltersApi
