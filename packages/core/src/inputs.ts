import { z } from 'zod'

export const MacroInputMappingSchema = z.object({
    macroName: z.string(),
    inputType: z.enum(['raw_rs2f']),
})
export type MacroInputMapping = z.infer<typeof MacroInputMappingSchema>