import { Icon } from '../parsing/IconSpec'
import { parseModules } from '../parsing/parse'
import {
    Filter,
    FilterConfiguration,
    ListDiff,
    MacroName,
    Module,
    StyleConfig,
} from '../parsing/UiTypesSpec'
import { applyDiff, convertOptionsToStrings, EMPTY_DIFF } from './ListDiffUtils'
export const renderFilter = (
    filter: Filter,
    activeConfig: FilterConfiguration | undefined
): string => {
    const filterModules = filter.modules.filter((module) => {
        const enabledConfig = activeConfig?.enabledModules?.[module.id]
        return enabledConfig ?? module.enabled
    })

    const modules = [
        ...(parseModules(activeConfig?.prefixRs2f || '')?.modules || []),
        ...filterModules,
        ...(parseModules(activeConfig?.suffixRs2f || '')?.modules || []),
    ]

    let filterText = modules
        .map((m) => applyModule(m, activeConfig?.inputConfigs))
        .join('\n')

    filterText = filterText.replace(
        /meta\s*{([^}]*)}/,
        `meta { name = \"${filter.name}\";${
            filter.description
                ? ` description = \"${filter.description}\";`
                : ''
        } }`
    )

    return filterText
}

export const applyModule = (
    module: Module,
    config: { [key: MacroName]: any } | undefined
): string => {
    let updated = module.rs2f

    for (const input of module.inputs) {
        switch (input.type) {
            case 'boolean': {
                const bool = config?.[input.macroName] ?? input.default
                if (bool !== undefined) {
                    updated = updateMacro(
                        updated,
                        input.macroName,
                        bool.toString()
                    )
                }
                break
            }
            case 'number': {
                const value = config?.[input.macroName] ?? input.default
                if (value !== undefined) {
                    updated = updateMacro(
                        updated,
                        input.macroName,
                        value.toString()
                    )
                }
                break
            }
            case 'stringlist':
            case 'enumlist': {
                const configuredDiff = config?.[input.macroName] as ListDiff

                const list = convertOptionsToStrings(
                    applyDiff(input.default, configuredDiff ?? EMPTY_DIFF)
                )

                updated = updateMacro(
                    updated,
                    input.macroName,
                    renderStringList(list)
                )
                break
            }
            case 'style': {
                const style = config?.[input.macroName] as
                    | StyleConfig
                    | undefined
                const defaultStyle = input.default as StyleConfig
                const mergedStyle = {
                    ...(defaultStyle ?? {}),
                    ...(style ?? {}),
                }
                if (Object.keys(mergedStyle).length > 0) {
                    updated = updateMacro(
                        updated,
                        input.macroName,
                        renderStyle(mergedStyle as StyleConfig)
                    )
                }
                break
            }
            case 'text': {
                const text = (config?.[input.macroName] ?? input.default) as
                    | string
                    | undefined
                if (text !== undefined) {
                    updated = updateMacro(updated, input.macroName, `"${text}"`)
                }
                break
            }
        }
    }
    return updated
}

const renderStringList = (list: string[]): string =>
    `[${list.map(quote).join(',')}]`

const quote = (v: string): string => `"${v}"`

const renderStyle = (style: StyleConfig): string => {
    if (style.hidden) {
        return 'hidden = true;' // save space, nothing else matters
    }

    return [
        renderStyleBool('hidden', style.hidden), // may still be explicitly UN-hiding
        renderStyleColor('textColor', style.textColor),
        renderStyleColor('backgroundColor', style.backgroundColor),
        renderStyleColor('borderColor', style.borderColor),
        renderStyleColor('textAccentColor', style.textAccentColor),
        renderStyleColor('lootbeamColor', style.lootbeamColor),
        renderStyleColor('menuTextColor', style.menuTextColor),
        renderStyleColor('tileStrokeColor', style.tileStrokeColor),
        renderStyleColor('tileHighlightColor', style.tileHighlightColor),
        renderStyleInt('textAccent', style.textAccent),
        renderStyleInt('fontType', style.fontType),
        renderStyleBool('showLootbeam', style.showLootbeam),
        renderStyleBool('showValue', style.showValue),
        renderStyleBool('showDespawn', style.showDespawn),
        renderStyleBool('notify', style.notify),
        renderStyleBool('highlightTile', style.highlightTile),
        renderStyleString('sound', style.sound),
        renderStyleInt('menuSort', style.menuSort),
        renderStyleIcon(style.icon),
    ].join('')
}

const renderStyleColor = (name: string, color: string | undefined): string =>
    color !== undefined ? `${name} = "${color}";` : ''

const renderStyleInt = (name: string, int: number | undefined): string =>
    int !== undefined ? `${name} = ${int};` : ''

const renderStyleBool = (name: string, value: boolean | undefined): string =>
    value !== undefined ? `${name} = ${value};` : ''

const renderStyleIcon = (icon: Icon | undefined): string => {
    switch (icon?.type) {
        case 'sprite':
            return `icon = Sprite(${icon.spriteId ?? 0}, ${icon.spriteIndex ?? 0});`
        case 'file':
            return `icon = File("${icon.path}");`
        case 'itemId':
            return `icon = Item(${icon.itemId ?? 0});`
        case 'current':
            return 'icon = CurrentItem();'
        case 'none':
        default:
            return ''
    }
}

const renderStyleString = (
    name: string,
    value: string | number | undefined
): string => {
    if (typeof value === 'number') {
        return `${name} = ${value};`
    }
    return value !== undefined ? `${name} = "${value}";` : ''
}

const isTargetMacro = (line: string, target: string): boolean =>
    line.startsWith(`#define ${target} `) || line === `#define ${target}`

// This WILL handle multiline macros but it's not perfect, if you have
// whitespace after the trailing slash that will break it even though it's
// valid rs2f. Long-term we'll just have the full tokenizer on the site and
// this will be handled better.
const updateMacro = (
    filter: string,
    macro: string,
    replace: string
): string => {
    const replaced = []

    let inMultiline = false
    for (const line of filter.split('\n')) {
        if (isTargetMacro(line, macro)) {
            if (line.endsWith('\\')) {
                inMultiline = true
            } else {
                // it's a one-line define, replace it and we're done
                replaced.push(`#define ${macro} ${replace}`)
            }
        } else if (inMultiline) {
            if (!line.endsWith('\\')) {
                // we finished the multiline define, push our replace and carry on
                replaced.push(`#define ${macro} ${replace}`)
                inMultiline = false
            }
        } else {
            replaced.push(line)
        }
    }

    return replaced.join('\n')
}
