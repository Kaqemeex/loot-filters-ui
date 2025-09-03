import { z } from 'zod'

export const macroBinding = z.object({
    macroName: z.string(),
    value: z.string().optional(),
})
export type MacroBinding = z.infer<typeof macroBinding>

export const precompiledRs2fSchema = z.object({
    rawRs2f: z.string(),
    precompiledRs2f: z.string(),
    parsedMacros: z.record(z.string(), z.string()),
})
export type PrecompiledRs2f = z.infer<typeof precompiledRs2fSchema>

export const filterConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    prefixRs2f: precompiledRs2fSchema,
    suffixRs2f: precompiledRs2fSchema,
    description: z.string().optional(),
    macroBindings: z.array(macroBinding),
})
export type FilterConfig = z.infer<typeof filterConfigSchema>

export const themeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    layers: z.array(filterConfigSchema),
})
export type Theme = z.infer<typeof themeSchema>

export const groupSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    macros: z.array(z.string()),
})
export type Group = z.infer<typeof groupSchema>

export const moduleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    visible: z.boolean(),
    groups: z.array(groupSchema),
})
export type Module = z.infer<typeof moduleSchema>

export const filterSettingsSchema = z.object({
    modules: z.array(moduleSchema),
})
export type FilterSettings = z.infer<typeof filterSettingsSchema>
