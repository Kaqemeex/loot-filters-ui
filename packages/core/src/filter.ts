import { z } from 'zod'

import { discordIdSchema, timestampSchema } from './types'

export const FilterEggSchema = z.object({
    name: z.string().default('A Filter'),
    description: z.string().default('A Description'),
    public: z.boolean().default(false),
})
export type FilterEgg = z.infer<typeof FilterEggSchema>

export const filterSchema = FilterEggSchema.extend({
    filterId: z.string().nonempty(),
    ownerDiscordId: discordIdSchema,
    currentVersionId: z.string().uuid(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})
export type Filter = z.infer<typeof filterSchema>
