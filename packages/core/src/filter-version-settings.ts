import { z } from 'zod'
import { InputTypeSchema } from './inputs'

/**
 * FilterSettings => how the filter is rendered to the user
 * A macro can be mapped to any number of groups. If not mapped it won't be rendered.
 *
 * FilterConfiguration => the set of (macro, value) tuples the user chose
 * That is explicitly not defined here. -- and will likely be re-named 'theme' or something.
 */

export const GroupSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    visible: z.boolean(),
    macros: z.array(z.string()),
})
export type Group = z.infer<typeof GroupSchema>

export const SectionSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    visible: z.boolean(),
    groups: z.array(GroupSchema),
})
export type Section = z.infer<typeof SectionSchema>

export const MacroInputMappingSchema = z.record(z.string(), InputTypeSchema)
export type MacroInputMapping = z.infer<typeof MacroInputMappingSchema>

export const FilterVersionSettingsSchema = z.object({
    sections: z.array(SectionSchema),
    macroInputMappings: MacroInputMappingSchema,
})
export type FilterVersionSettings = z.infer<typeof FilterVersionSettingsSchema>
