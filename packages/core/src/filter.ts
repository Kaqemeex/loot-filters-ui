import { z } from 'zod'

import { discordIdSchema, timestampSchema } from './types'

export const FilterEggSchema = z.object({
    name: z.string().default('A Filter'),
    description: z.string().default('A Description'),
    public: z.boolean().default(false),
})
export type FilterEgg = z.infer<typeof FilterEggSchema>

export const UpdateFilterSchema = z.object({
    filterId: z.string().nonempty(),
    name: z.string().optional(),
    description: z.string().optional(),
    public: z.boolean().optional(),
    currentVersionId: z.string().optional(),
})

export type UpdateFilter = z.infer<typeof UpdateFilterSchema>

export const FilterSchema = FilterEggSchema.extend({
    filterId: z.string().nonempty(),
    ownerDiscordId: discordIdSchema,
    currentVersionId: z.string(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})
export type Filter = z.infer<typeof FilterSchema>
