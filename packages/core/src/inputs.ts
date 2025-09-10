import { z } from 'zod'

// Define raw_rs2f input type schema
export const RawRs2fInputSchema = z.object({
    type: z.literal('raw_rs2f'),
})

// Define number input type schema
export const NumberInputSchema = z.object({
    type: z.literal('number'),
})

// Define boolean input type schema
export const BooleanInputSchema = z.object({
    type: z.literal('boolean'),
})

export const ListItemTypesSchema = z.enum(['string', 'number'])
export type ListItemTypes = z.infer<typeof ListItemTypesSchema>

// Define list input type schema
export const ListInputSchema = z.object({
    type: z.literal('list'),
    itemTypes: ListItemTypesSchema,
    allowCustomItems: z.boolean().default(true),
})

// Union of supported input types
export const InputTypeSchema = z.discriminatedUnion('type', [
    RawRs2fInputSchema,
    NumberInputSchema,
    BooleanInputSchema,
    ListInputSchema,
])

export type InputType = z.infer<typeof InputTypeSchema>
export type RawRs2fInput = z.infer<typeof RawRs2fInputSchema>
export type NumberInput = z.infer<typeof NumberInputSchema>
export type BooleanInput = z.infer<typeof BooleanInputSchema>
export type ListInput = z.infer<typeof ListInputSchema>

// Helper function to get input type names for UI
export const getInputTypeNames = (): Array<{
    value: string
    label: string
}> => [
    { value: 'raw_rs2f', label: 'Raw RS2F' },
    { value: 'number', label: 'Number Input' },
    { value: 'boolean', label: 'Boolean Input' },
    { value: 'list', label: 'List Input' },
]
