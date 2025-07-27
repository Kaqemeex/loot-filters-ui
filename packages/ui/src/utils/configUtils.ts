import {
    FilterConfiguration,
    ListDiff,
    StyleConfigSpec,
} from '@loot-filters/core'

const countChanges = (config: any): number => {
    if (config === undefined || config === null) {
        return 0
    }

    if (Array.isArray(config)) {
        return config.length === 0 ? 0 : 1
    }

    if (typeof config === 'object') {
        const keys = Object.keys(config)
        if (keys.includes('added') && keys.includes('removed')) {
            const listDiff = config as ListDiff
            return countChanges(listDiff.added) + countChanges(listDiff.removed)
        }

        return Object.keys(StyleConfigSpec.shape).reduce((acc, key) => {
            return acc + countChanges(config[key])
        }, 0)
    }

    return 1
}

export const countConfigChanges = (
    config: FilterConfiguration,
    moduleMacronames: string[] = []
): number => {
    return Object.keys(config.inputConfigs ?? {})
        .filter((macroName) => {
            if (moduleMacronames.length === 0) {
                return true
            } else {
                return moduleMacronames.includes(macroName)
            }
        })
        .map((macroName) => {
            const inputConfig = config.inputConfigs?.[macroName]
            const count = countChanges(inputConfig)
            return count
        })
        .reduce((acc, count) => {
            return acc + count
        }, 0)
}
