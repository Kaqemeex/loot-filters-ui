import { z } from 'zod'
import { timestampSchema } from './core'
import { FilterVersionSettingsSchema } from './filter-version-settings'
import { MacroBindingSchema } from './precompiled-rs2f'

export const FilterVersionEggSchema = z.object({
    filterId: z.string().nonempty(),
    name: z.string().optional(),
    rawRs2f: z.string(),
    precompiledRs2f: z.string(),
    parsedMacros: z.array(MacroBindingSchema),
    settings: FilterVersionSettingsSchema,
    url: z.string().optional(),
})
export type FilterVersionEgg = z.infer<typeof FilterVersionEggSchema>

export const FilterVersionSchema = FilterVersionEggSchema.extend({
    versionId: z.string().nonempty(),
    createdAt: timestampSchema,
})
export type FilterVersion = z.infer<typeof FilterVersionSchema>

export const FilterVersionIdSchema = z.object({
    filterId: z.string().nonempty(),
    versionId: z.string().nonempty(),
})
export type FilterVersionId = z.infer<typeof FilterVersionIdSchema>
