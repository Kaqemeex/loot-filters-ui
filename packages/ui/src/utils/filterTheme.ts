import yaml from 'yaml'
import { Filter_ThemeSpec, FilterConfiguration } from '@loot-filters/models'
import { generateId } from './idgen'

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
