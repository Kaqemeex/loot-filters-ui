import { Filter_ThemeSpec, FilterConfiguration, generateId } from '@loot-filters/core'
import yaml from 'yaml'

export const toThemeStructuredComment = (
    name: string,
    config: FilterConfiguration,
    subtitle?: string,
    description?: string
): string => {
    const theme = Filter_ThemeSpec.parse({
        name,
        subtitle,
        description,
        config: {
            enabledModules: config.enabledModules,
            inputConfigs: config.inputConfigs,
        },
    })

    return `/*@ define:theme:${generateId()}\n${yaml.stringify(theme)}*/\n`
}
