import {
    Filter,
    FilterConfiguration,
    Input,
    ListDiff,
    StyleConfig,
} from './UiTypesSpec'
import { Icon, IconFile, IconSprite } from './IconSpec'
import { parseSiteMetadata } from './parse'

const RIKTENS_FILTER =
    'https://raw.githubusercontent.com/riktenx/filterscape/refs/heads/main/filter.rs2f'
const JOES_FILTER =
    'https://raw.githubusercontent.com/typical-whack/loot-filters-modules/refs/heads/main/filter.rs2f'

export const deriveConfig = (src: Filter, dst: Filter): FilterConfiguration => {
    return {
        inputConfigs: deriveInputConfigs(src, dst),
        enabledModules: {},
    }
}

export const deriveUrl = (filter: Filter): string | undefined => {
    const parsed = parseSiteMetadata(filter.rs2f)
    if (!!parsed.errors || !parsed.metadata?.source) {
        return guessUrl(filter)
    }

    return parsed.metadata.source
}

// the magic is here: by comparing two parsed copies of a filter, we can derive
// what the original configuration was based on what changed
//
// this is imperfect and will fail to restore some things but those can all be
// resolved with additional site metadata in the future:
// * themes
// * prefix/suffix
// * explicitly disabled modules
const deriveInputConfigs = (src: Filter, dst: Filter): Record<string, any> => {
    const configs: Record<string, any> = {}

    const inputs = src.modules.flatMap((m) => m.inputs)
    const dstInputs = dst.modules
        .flatMap((m) => m.inputs)
        .reduce<
            Record<string, Input>
        >((acc, v) => ({ ...acc, [v.macroName]: v }), {})

    for (const input of inputs) {
        const dstInput = dstInputs[input.macroName]
        if (!dstInput) {
            continue
        }

        switch (input.type) {
            case 'stringlist':
            case 'enumlist':
                const listDiff = deriveListDiff(input.default, dstInput.default)
                if (listDiff.added.length > 0 || listDiff.removed.length > 0) {
                    configs[input.macroName] = listDiff
                }
                break
            case 'style':
                const styleDiff = deriveStyleConfig(
                    input.default,
                    dstInput.default
                )
                if (Object.keys(styleDiff).length > 0) {
                    configs[input.macroName] = styleDiff
                }
                break
            case 'number':
            case 'boolean':
            case 'text':
                if (isSet(input.default, dstInput.default)) {
                    configs[input.macroName] = dstInput.default
                }
                break
        }
    }

    return configs
}

const deriveListDiff = (src: string[], dst: string[]): ListDiff => {
    return {
        added: dst.filter((v) => !src.includes(v)),
        removed: src.filter((v) => !dst.includes(v)),
    }
}

const deriveStyleConfig = (src: StyleConfig, dst: StyleConfig): StyleConfig => {
    const config: StyleConfig = {
        hidden: ifSet(src.hidden, dst.hidden),
        textColor: ifSet(src.textColor, dst.textColor),
        backgroundColor: ifSet(src.backgroundColor, dst.backgroundColor),
        borderColor: ifSet(src.borderColor, dst.borderColor),
        textAccent: ifSet(src.textAccent, dst.textAccent),
        textAccentColor: ifSet(src.textAccentColor, dst.textAccentColor),
        fontType: ifSet(src.fontType, dst.fontType),
        showLootbeam: ifSet(src.showLootbeam, dst.showLootbeam),
        lootbeamColor: ifSet(src.lootbeamColor, dst.lootbeamColor),
        showValue: ifSet(src.showValue, dst.showValue),
        showDespawn: ifSet(src.showDespawn, dst.showDespawn),
        notify: ifSet(src.notify, dst.notify),
        hideOverlay: ifSet(src.hideOverlay, dst.hideOverlay),
        highlightTile: ifSet(src.highlightTile, dst.highlightTile),
        menuTextColor: ifSet(src.menuTextColor, dst.menuTextColor),
        tileStrokeColor: ifSet(src.tileStrokeColor, dst.tileStrokeColor),
        tileFillColor: ifSet(src.tileFillColor, dst.tileFillColor),
        tileHighlightColor: ifSet(
            src.tileHighlightColor,
            dst.tileHighlightColor
        ),
        sound: ifSet(src.sound, dst.sound),
        menuSort: ifSet(src.menuSort, dst.menuSort),
        icon: ifSet(src.icon, dst.icon, cmpIcon),
    }

    for (const key of Object.keys(config)) {
        // @ts-ignore
        if (config[key] === undefined) {
            // @ts-ignore
            delete config[key]
        }
    }

    return config
}

// three distinct states of "diff":
//
// * src is unset but dst is (user added it)
// * both are set but different (user changed it)
// * "user removed it" is not derivable from a parsed filter since there's no
//   way to encode "unset this" in rs2f atm
const isSet = <T>(src: T, dst: T, cmp?: (i: T, j: T) => boolean): boolean => {
    if (!cmp) {
        cmp = (i, j) => i === j
    }

    return (
        (src === undefined && dst !== undefined) ||
        (src !== undefined && dst !== undefined && !cmp(src, dst))
    )
}

const ifSet = <T>(
    src: T,
    dst: T,
    cmp?: (i: T, j: T) => boolean
): T | undefined => (isSet(src, dst, cmp) ? dst : undefined)

const cmpIcon = (src: Icon | undefined, dst: Icon | undefined): boolean => {
    src = src as Icon
    dst = dst as Icon

    if (src.type !== dst.type) {
        return false
    }

    switch (src.type) {
        case 'file':
            return (src as IconFile).filePath === (dst as IconFile).filePath
        case 'sprite':
            return (
                (src as IconSprite).spriteId === (dst as IconSprite).spriteId &&
                (src as IconSprite).spriteIndex ===
                    (dst as IconSprite).spriteIndex
            )
        default:
            return true
    }
}

const guessUrl = (filter: Filter): string | undefined => {
    if (filter.name.includes('riktenx/filterscape')) {
        return RIKTENS_FILTER
    } else if (filter.name.includes("Joe's filter")) {
        return JOES_FILTER
    }
    return undefined
}
