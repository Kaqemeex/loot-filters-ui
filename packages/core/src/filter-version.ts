import { z } from 'zod'
import { timestampSchema } from './types'
import { MacroBindingSchema } from './precompiled-rs2f'
import { FilterVersionSettingsSchema } from './filter-version-settings'

export const FilterVersionEggSchema = z.object({
    filterId: z.string().nonempty(),
    name: z.string().optional(),
    rawRs2f: z.string(),
    precompiledRs2f: z.string(),
    parsedMacros: z.array(MacroBindingSchema),
    settings: FilterVersionSettingsSchema,
})
export type FilterVersionEgg = z.infer<typeof FilterVersionEggSchema>

export const filterVersionSchema = FilterVersionEggSchema.extend({
    versionId: z.string().nonempty(),
    createdAt: timestampSchema,
})
export type FilterVersion = z.infer<typeof filterVersionSchema>
