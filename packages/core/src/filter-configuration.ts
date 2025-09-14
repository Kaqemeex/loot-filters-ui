import { z } from 'zod'
import { OnwedUpdatableSchema } from './core'

export const FilterConfigurationIdSchema = z.object({
    filterId: z.string(),
})
export type FilterConfigurationId = z.infer<typeof FilterConfigurationIdSchema>

export const FilterConfigurationEggSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    filterId: z.string(),
    // versionId: z.string(), // We force configurations to use 'current' version
    filterPrefixRs2f: z.string(),
    filterSuffixRs2f: z.string(),
    macroOverrides: z.record(z.string(), z.string()),
    public: z.boolean(),
})
export type FilterConfigurationEgg = z.infer<
    typeof FilterConfigurationEggSchema
>

export const FilterConfigurationSchema = OnwedUpdatableSchema.merge(
    FilterConfigurationEggSchema
).extend({
    id: z.string(),
    description: z.string().nullable().optional(),
})

export type FilterConfiguration = z.infer<typeof FilterConfigurationSchema>

export const UpdateFilterConfigurationSchema = z.object({
    id: z.string().nonempty(),
    name: z.string().optional(),
    description: z.string().optional(),
    filterId: z.string().optional(),
    filterPrefixRs2f: z.string().optional(),
    filterSuffixRs2f: z.string().optional(),
    macroOverrides: z.record(z.string(), z.string()).optional(),
    public: z.boolean().optional(),
})
export type UpdateFilterConfiguration = z.infer<
    typeof UpdateFilterConfigurationSchema
>
