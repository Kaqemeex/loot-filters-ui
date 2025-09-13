import { z } from 'zod'
import { FilterVersionSettingsSchema } from './filter-version-settings'
import { MacroBindingSchema } from './precompiled-rs2f'
import { timestampSchema } from './types'

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
