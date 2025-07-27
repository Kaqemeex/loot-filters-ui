import { z } from 'zod'
import { IconSpec } from './IconSpec'

export const Filter_ModuleSpec = z.object({
    name: z.string().nonempty(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    enabled: z.boolean().optional().default(true),
    hidden: z.boolean().optional().default(false),
})

export type Filter_Module = z.infer<typeof Filter_ModuleSpec>

export const Filter_GroupSpec = z.object({
    name: z.string().nonempty(),
    icon: IconSpec.optional(),
    description: z.string().optional(),
    expanded: z.boolean().optional(),
})

export type Filter_Group = z.infer<typeof Filter_GroupSpec>

export const Filter_InputSpec = z
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

export type Filter_Input = z.infer<typeof Filter_InputSpec>

export const Filter_ThemeSpec = z.object({
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

export type Filter_Theme = z.infer<typeof Filter_ThemeSpec>
