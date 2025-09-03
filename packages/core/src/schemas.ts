import { z } from 'zod'

// Base schemas for common fields
export const timestampSchema = z.number().int().positive()
export const discordIdSchema = z.string().nonempty()

export const filterEggSchema = z.object({
    name: z.string().default('A Filter'),
    description: z.string().default('A Description'),
    public: z.boolean().default(false),
})
export type FilterEgg = z.infer<typeof filterEggSchema>

// Filter schemas
export const filterSchema = filterEggSchema.extend({
    filterId: z.string().nonempty(),
    ownerDiscordId: discordIdSchema,
    currentVersionId: z.string().uuid(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})
export type Filter = z.infer<typeof filterSchema>

export const filterVersionEggSchema = z.object({
    filterId: z.string().nonempty(),
    rawRs2f: z.string(),
    precompiledRs2f: z.string(),
    parsedMacros: z.string(),
})
export type FilterVersionEgg = z.infer<typeof filterVersionEggSchema>

export const filterVersionSchema = filterVersionEggSchema.extend({
    versionId: z.string().nonempty(),
    createdAt: timestampSchema,
})
export type FilterVersion = z.infer<typeof filterVersionSchema>

