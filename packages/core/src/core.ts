import { z } from 'zod'

export const timestampSchema = z.number().int().positive()
export const discordIdSchema = z.string().nonempty()

export const OwnedSchema = z.object({
    ownerDiscordId: discordIdSchema,
})
export type Owned = z.infer<typeof OwnedSchema>

export const OnwedUpdatableSchema = OwnedSchema.extend({
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
})

export type OnwedUpdatable = z.infer<typeof OnwedUpdatableSchema>
