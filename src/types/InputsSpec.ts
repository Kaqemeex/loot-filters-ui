import { StyleConfig } from '../components/inputs/StyleInputHelpers'

// Don't export this, just use FilterType
const filterTypes = {
    boolean: 'boolean',
    number: 'number',
    stringlist: 'stringlist',
    enumlist: 'enumlist',
    style: 'style',
    text: 'text',
} as const

// Types for fields that can change depending on the input type
export type Input =
    | NumberInput
    | BooleanInput
    | StringListInput
    | EnumListInput
    | StyleInput
    | TextInput
export type FilterType = keyof typeof filterTypes
export type InputDefault<I extends Input> = I extends NumberInput
    ? number
    : I extends BooleanInput
      ? boolean
      : I extends StringListInput
        ? string[] | ListOption[]
        : I extends EnumListInput
          ? string[]
          : I extends StyleInput
            ? Partial<StyleConfig>
            : I extends TextInput
              ? string
              : never

export type ListDiff = {
    added: string[]
    removed: string[]
}

export type InputConfig<I extends Input> =
    I extends Exclude<Input, StringListInput | EnumListInput | StyleInput>
        ? InputDefault<I>
        : I extends StringListInput | EnumListInput
          ? ListDiff
          : I extends StyleInput
            ? Partial<StyleConfig>
            : never

export type ModuleName = string
export type MacroName = string

interface FilterModuleInputBase<T extends FilterType> {
    type: T
    // The label of the input in the UI
    label: string
    // Used to group related inputs in the UI ie a style input with a related enum list
    group?: string
    // The name of the macro that will be updated in the rs2f text
    macroName: string
}

export interface FilterModuleInput<T extends FilterType>
    extends FilterModuleInputBase<T> {
    // This is overridden by child types
    default: never
}

export type BooleanInput = Omit<FilterModuleInput<'boolean'>, 'default'> & {
    default: boolean
}

export type NumberInput = {
    default: number
} & Omit<FilterModuleInput<'number'>, 'default'>

export type StringListInput = {
    default: string[] | ListOption[]
} & Omit<FilterModuleInput<'stringlist'>, 'default'>

export type ListOption = { label: string; value: string }
export type EnumListInput = {
    // always just values not labels avoids needing to redefine the enum
    default: string[]
    enum: string[] | ListOption[]
} & Omit<FilterModuleInput<'enumlist'>, 'default'>

/**
 * @see https://github.com/riktenx/loot-filters/blob/bec89ccfee8f85fab8c8b1dc9da49f972c2316fb/src/main/java/com/lootfilters/rule/FontType.java#L15
 */
export const TextAccent = {
    Shadow: 1,
    Outline: 2,
    None: 3,
    ShadowBold: 4,
} as const
export type TextAccent = (typeof TextAccent)[keyof typeof TextAccent]

export const textAccents = Object.values<TextAccent>(TextAccent)

export const labelFromTextAccent = (textAccent: TextAccent) => {
    switch (textAccent) {
        case TextAccent.Shadow:
            return 'Shadow'
        case TextAccent.Outline:
            return 'Outline'
        case TextAccent.None:
            return 'None'
        case TextAccent.ShadowBold:
            return 'Bold Shadow'
    }
}

export const fontFamilyFromFontType = (fontType?: FontType) => {
    switch (fontType) {
        case 1:
            return 'RuneScapeSmall'
        case 2:
            return 'RuneScape'
        case 3:
            return 'RuneScapeBold'
        default:
            return 'RuneScapeSmall'
    }
}

/**
 * @see https://github.com/riktenx/loot-filters/blob/bec89ccfee8f85fab8c8b1dc9da49f972c2316fb/src/main/java/com/lootfilters/rule/FontType.java#L15

 */
export const FontType = {
    Small: 1,
    Normal: 2,
    Bold: 3,
} as const
export type FontType = (typeof FontType)[keyof typeof FontType]

export const fontTypes = Object.values<FontType>(FontType)

export const labelFromFontType = (fontType: FontType) => {
    switch (fontType) {
        case FontType.Small:
            return 'Small'
        case FontType.Normal:
            return 'Normal'
        case FontType.Bold:
            return 'Bold'
    }
}

/**
 * @pattern ^#([0-9a-fA-F]{8})$
 *
 * All colors in loot-filters are encoded in the, #AARRGGBB hex format.
 */
export type ArgbHexColor = `#${string}`

export const styleConfigFields = [
    'textColor',
    'backgroundColor',
    'borderColor',
    'textAccent',
    'textAccentColor',
    'fontType',
    'showLootbeam',
    'lootbeamColor',
    'showValue',
    'showDespawn',
    'notify',
    'hideOverlay',
    'highlightTile',
    'menuTextColor',
    'tileStrokeColor',
    'tileFillColor',
    'tileHighlightColor',
    'sound',
]

export type StyleInput = Omit<FilterModuleInput<'style'>, 'default'> & {
    default: Partial<{
        textColor: ArgbHexColor
        backgroundColor: ArgbHexColor
        borderColor: ArgbHexColor
        textAccent: TextAccent
        textAccentColor: ArgbHexColor
        fontType: FontType
        showLootbeam: boolean
        lootbeamColor: ArgbHexColor
        showValue: boolean
        showDespawn: boolean
        notify: boolean
        hideOverlay: boolean
        highlightTile: boolean
        menuTextColor: ArgbHexColor
        tileStrokeColor: ArgbHexColor
        tileFillColor: ArgbHexColor
        tileHighlightColor: ArgbHexColor
        sound: string
    }>
    exampleItem?: string
}

export type TextInput = Omit<FilterModuleInput<'text'>, 'default'> & {
    default: string
}
