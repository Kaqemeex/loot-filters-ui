import { z } from 'zod'
import { IconSpec } from './IconSpec'

export const ModuleSpec = z.object({
    name: z.string().nonempty(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    enabled: z.boolean().optional().default(true),
    hidden: z.boolean().optional().default(false),
})

export type Module = z.infer<typeof ModuleSpec>

export const GroupSpec = z.object({
    name: z.string().nonempty(),
    icon: IconSpec.optional(),
    description: z.string().optional(),
    expanded: z.boolean().optional(),
})

export type Group = z.infer<typeof GroupSpec>

export const InputSpec = z
    .object({
        type: z.enum([
            'boolean',
            'number',
            'stringlist',
            'enumlist',
            'style',
            'text',
        ]),
        label: z.string().nonempty(),
        group: z.string().optional(),
    })
    .catchall(z.any())

export type Input = z.infer<typeof InputSpec>

export const ThemeSpec = z.object({
    name: z.string().nonempty(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    config: z
        .object({
            enabledModules: z
                .record(z.string(), z.boolean())
                .optional()
                .default({}),
            inputConfigs: z.record(z.string(), z.any()).optional().default({}),
        })
        .optional(),
})

export type Theme = z.infer<typeof ThemeSpec>

export const SiteMetadataSpec = z.object({
    source: z.string().optional(),
})

export type SiteMetadata = z.infer<typeof SiteMetadataSpec>
