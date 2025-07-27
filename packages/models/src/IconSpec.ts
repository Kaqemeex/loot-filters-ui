import { z } from 'zod'

export const IconSpec = z
    .object({
        type: z.enum(['none', 'current', 'file', 'sprite', 'itemId']),
    })
    .catchall(z.any())

export type Icon = z.infer<typeof IconSpec>

export const IconNoneSpec = IconSpec.extend({
    type: z.literal('none'),
})
export type IconNone = z.infer<typeof IconNoneSpec>

export const IconCurrentSpec = IconSpec.extend({
    type: z.literal('current'),
})
export type IconCurrent = z.infer<typeof IconCurrentSpec>

export const IconFileSpec = IconSpec.extend({
    type: z.literal('file'),
    filePath: z.string().optional(),
})
export type IconFile = z.infer<typeof IconFileSpec>

export const IconSpriteSpec = IconSpec.extend({
    type: z.literal('sprite'),
    spriteId: z.number().optional(),
    spriteIndex: z.number().optional(),
})
export type IconSprite = z.infer<typeof IconSpriteSpec>

export const IconItemIdSpec = IconSpec.extend({
    type: z.literal('itemId'),
    itemId: z.number().optional(),
})
export type IconItemId = z.infer<typeof IconItemIdSpec>
