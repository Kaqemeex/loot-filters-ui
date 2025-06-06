import { ExpandMore } from '@mui/icons-material'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Badge,
    Box,
    Checkbox,
    Grid2,
    SxProps,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    FilterConfiguration,
    Module,
    StyleConfig,
    StyleConfigSpec,
    StyleInput,
    Theme,
} from '../../parsing/UiTypesSpec'
import { useAlertStore } from '../../store/alerts'
import { useSettingsCopyStore } from '../../store/settingsCopyStore'
import { colors } from '../../styles/MuiTheme'
import {
    FontType,
    fontTypes,
    labelFromFontType,
    labelFromTextAccent,
    TextAccent,
} from '../../types/Rs2fEnum'
import { EventShield } from '../EventShield'
import { InfoLink } from '../InfoDialog'
import { ItemLabelPreview, ItemMenuPreview } from '../Previews'
import { CommonSoundEffects } from '../info/CommonSoundEffects'
import { ColorPickerInput } from './ColorPicker'
import { CopyInputSettings } from './CopyInputSettings'
import { UISelect } from './UISelect'

const Column: React.FC<{
    children: React.ReactNode[] | React.ReactNode
}> = ({ children }) => {
    return (
        <Grid2 size={11}>
            {Array.isArray(children)
                ? children.map((child, index) => (
                      <React.Fragment key={index}>{child}</React.Fragment>
                  ))
                : children}
        </Grid2>
    )
}

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Grid2 container size={11} sx={{ mb: 1 }}>
            {children}
        </Grid2>
    )
}

const HeaderCol: React.FC<{ text: string }> = ({ text }) => {
    return (
        <Grid2
            size={1}
            rowSpacing={0}
            container
            style={{ alignSelf: 'center' }}
        >
            <Typography variant="h4">{text}</Typography>
        </Grid2>
    )
}

const Label: React.FC<{ label: string; sx?: SxProps }> = ({ label, sx }) => {
    return (
        <Grid2
            size={2}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: '100%',
                ...sx,
            }}
        >
            <Typography
                style={{
                    fontFamily: 'RuneScape',
                    fontSize: '24px',
                    marginRight: 2,
                    lineHeight: 1,
                }}
            >
                {label}
            </Typography>
        </Grid2>
    )
}

const inferSoundType = (value: any): 'none' | 'soundeffect' | 'fromfile' => {
    switch (typeof value) {
        case 'number':
            return 'soundeffect'
        case 'string':
            return 'fromfile'
        default:
            return 'none'
    }
}

export const DisplayConfigurationInput: React.FC<{
    config: FilterConfiguration
    theme?: Theme
    onChange: (style: StyleConfig) => void
    readonly: boolean
    module: Module
    input: StyleInput
}> = ({ config, theme, onChange, readonly, module, input }) => {
    const [searchParams] = useSearchParams()
    const { addAlert } = useAlertStore()
    const { copiedInput, pasteableConfig, setSettingsCopy } =
        useSettingsCopyStore()

    const [expanded, setExpanded] = useState(
        searchParams.get('expanded') === 'true'
    )

    const spec = StyleConfigSpec.optional().default({})

    const themeConfig = spec.parse(
        theme?.config?.inputConfigs?.[input.macroName]
    )
    const styleConfig = spec.parse(config?.inputConfigs?.[input.macroName])

    const [iconType, setIconType] = useState<
        'none' | 'current' | 'file' | 'sprite' | 'itemId'
    >(
        styleConfig?.icon?.type ??
            themeConfig?.icon?.type ??
            input.default?.icon?.type ??
            'none'
    )

    const [soundType, setSoundType] = useState<
        'none' | 'soundeffect' | 'fromfile'
    >(
        inferSoundType(
            styleConfig?.sound ?? themeConfig?.sound ?? input.default?.sound
        )
    )

    const isHidden =
        styleConfig?.hidden ?? themeConfig?.hidden ?? input.default?.hidden
    let displayMode = 1
    if (isHidden === false) {
        displayMode = 2
    } else if (isHidden === true) {
        displayMode = 3
    }

    // if the filter is specifying to explicitly show or hide, then they cannot
    // 'unset' the value
    const hasExplicitDisplayMode =
        input.default?.hidden === true || input.default?.hidden === false

    // Helper to wrap an input with a badge if changed from default
    const inputWithBadge = (child: React.ReactNode, configField: string) => {
        // Get values for the field from user, theme, and default
        const userValue = (styleConfig as any)?.[configField]
        const themeValue = (themeConfig as any)?.[configField] // TODO: handle theme config
        const filterValue = (input.default as any)?.[configField]
        // Determine which value is active
        let isChanged = false
        let badgeColor: 'success' | 'warning' | undefined = undefined
        if (userValue !== undefined) {
            isChanged = true
            badgeColor = 'success' // user-set (green)
        } else if (filterValue !== undefined) {
            isChanged = true
            badgeColor = 'warning' // filter-set (yellow)
        }
        return isChanged && badgeColor ? (
            <Tooltip
                title={
                    badgeColor === 'success'
                        ? 'Changed by you'
                        : 'Set by filter/theme'
                }
            >
                <Badge color={badgeColor} variant="dot">
                    {child}
                </Badge>
            </Tooltip>
        ) : (
            child
        )
    }

    // Now wrap all inputs with inputWithBadge
    const displayModeInput = inputWithBadge(
        <EventShield>
            <UISelect<number>
                sx={{
                    minWidth: '7rem',
                    maxHeight: '3rem',
                }}
                value={{
                    label:
                        displayMode === 1
                            ? 'Default'
                            : displayMode === 2
                              ? 'Show'
                              : 'Hide',
                    value: displayMode,
                }}
                disabled={readonly || input.disableDisplayMode}
                label="Display Mode"
                disableClearable={true}
                options={[
                    ...(!hasExplicitDisplayMode
                        ? [{ label: 'Default', value: 1 }]
                        : []),
                    { label: 'Show', value: 2 },
                    { label: 'Hide', value: 3 },
                ]}
                multiple={false}
                freeSolo={false}
                onChange={(newValue) => {
                    switch (newValue?.value) {
                        case 1:
                            onChange({ hidden: undefined })
                            break
                        case 2:
                            onChange({ hidden: false })
                            break
                        case 3:
                            onChange({ hidden: true })
                            break
                    }
                }}
            />
        </EventShield>,
        'hidden'
    )

    const displayLootbeamInput = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showLootbeam ??
                themeConfig?.showLootbeam ??
                input.default?.showLootbeam ??
                false
            }
            onChange={(e) => onChange({ showLootbeam: e.target.checked })}
        />
    )

    const lootbeamColorInput = (
        <ColorPickerInput
            disabled={
                !(
                    styleConfig.showLootbeam ??
                    themeConfig?.showLootbeam ??
                    input.default?.showLootbeam
                ) || readonly
            }
            configField="lootbeamColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
        />
    )

    const valueComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showValue ??
                themeConfig?.showValue ??
                input.default?.showValue ??
                false
            }
            onChange={(e) => onChange({ showValue: e.target.checked })}
        />
    )

    const despawnComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showDespawn ??
                themeConfig?.showDespawn ??
                input.default?.showDespawn ??
                false
            }
            onChange={(e) => onChange({ showDespawn: e.target.checked })}
        />
    )

    const notifyComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.notify ??
                themeConfig?.notify ??
                input.default?.notify ??
                false
            }
            onChange={(e) => onChange({ notify: e.target.checked })}
        />
    )

    const highlightTileComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.highlightTile ??
                themeConfig?.highlightTile ??
                input.default?.highlightTile ??
                false
            }
            onChange={(e) => onChange({ highlightTile: e.target.checked })}
        />
    )
    const hilightTileFillColorInput = (
        <ColorPickerInput
            configField="tileFillColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
            disabled={
                !(
                    styleConfig.highlightTile ??
                    themeConfig?.highlightTile ??
                    input.default?.highlightTile
                ) || readonly
            }
        />
    )

    const hilightTileStrokeColorInput = (
        <ColorPickerInput
            configField="tileStrokeColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
            disabled={
                !(
                    styleConfig.highlightTile ??
                    themeConfig?.highlightTile ??
                    input.default?.highlightTile
                ) || readonly
            }
        />
    )

    const soundOpts = [
        { label: 'Sound Effect', value: 'soundeffect' },
        { label: 'From File', value: 'fromfile' },
    ]

    const soundTypeSelect = (
        <UISelect<string>
            sx={{
                width: '12rem',
            }}
            disabled={readonly}
            options={soundOpts}
            multiple={false}
            freeSolo={false}
            value={soundOpts.find((opt) => opt.value === soundType) ?? null}
            onChange={(newValue) => {
                switch (newValue?.value) {
                    case 'soundeffect':
                        setSoundType('soundeffect')
                        onChange({ sound: 0 })
                        break
                    case 'fromfile':
                        setSoundType('fromfile')
                        onChange({ sound: 'example.wav' })
                        break
                    default:
                        setSoundType('none')
                        onChange({ sound: undefined })
                        break
                }
            }}
        />
    )

    const soundEffectInput = (
        <TextField
            type="number"
            sx={{ minWidth: '12rem' }}
            disabled={readonly}
            size="small"
            placeholder="Effect ID"
            value={
                styleConfig?.sound ??
                themeConfig?.sound ??
                input.default?.sound ??
                0
            }
            onChange={(e) => onChange({ sound: parseInt(e.target.value) || 0 })}
        />
    )

    const soundFile =
        styleConfig?.sound ?? themeConfig?.sound ?? input.default?.sound ?? ''

    const soundFileInput = (
        <TextField
            sx={{ minWidth: '12rem' }}
            disabled={readonly}
            placeholder="Filename"
            value={soundFile}
            onChange={(e) => onChange({ sound: e.target.value })}
        />
    )

    const soundFileHelpText =
        typeof soundFile === 'string' && soundFile.endsWith('.wav') ? (
            <Typography
                variant="caption"
                color={colors.rsDarkOrange}
                sx={{
                    textWrap: 'nowrap',
                    lineHeight: 1.0,
                }}
            >
                Place your sound files (must be .wav) in
                <br />
                .runelite/loot-filters/sounds
            </Typography>
        ) : (
            <Typography
                variant="caption"
                color={colors.rsLightRed}
                sx={{
                    textWrap: 'nowrap',
                    lineHeight: 1.0,
                }}
            >
                Sound file must be a WAV (ends in .wav)
            </Typography>
        )

    const textColorInput = (
        <ColorPickerInput
            configField="textColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            disabled={readonly}
            onChange={onChange}
        />
    )

    const backgroundColorInput = (
        <ColorPickerInput
            configField="backgroundColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
        />
    )

    const borderColorInput = (
        <ColorPickerInput
            configField="borderColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
        />
    )

    const textAccentColorInput = (
        <ColorPickerInput
            configField="textAccentColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
        />
    )

    const menuColorInput = (
        <ColorPickerInput
            configField="menuTextColor"
            config={styleConfig}
            themeConfig={themeConfig}
            input={input}
            onChange={onChange}
        />
    )

    const menuSortInput = (
        <TextField
            sx={{
                minWidth: '10rem',
                ml: 1,
            }}
            placeholder={
                styleConfig?.menuSort === undefined
                    ? 'Enter a number'
                    : undefined
            }
            type="number"
            value={
                styleConfig?.menuSort !== undefined ? styleConfig.menuSort : ''
            }
            onChange={(e) =>
                onChange({
                    menuSort:
                        e.target.value.length > 0
                            ? parseInt(e.target.value)
                            : undefined,
                })
            }
            disabled={readonly}
        />
    )

    const fontTypeInput = (
        <UISelect<number>
            sx={{
                width: '15rem',
                marginLeft: 1,
            }}
            disabled={readonly}
            options={fontTypes.map((fontType) => ({
                label: labelFromFontType(fontType),
                value: fontType,
            }))}
            multiple={false}
            freeSolo={false}
            value={
                styleConfig?.fontType !== undefined ||
                themeConfig?.fontType !== undefined ||
                input.default?.fontType !== undefined
                    ? {
                          label: labelFromFontType(
                              (styleConfig?.fontType as FontType) ??
                                  themeConfig?.fontType ??
                                  input.default?.fontType ??
                                  FontType.Small // fallback, but will never hit if all undefined
                          ),
                          value:
                              styleConfig?.fontType ??
                              themeConfig?.fontType ??
                              input.default?.fontType ??
                              1,
                      }
                    : null
            }
            onChange={(newValue) => {
                if (newValue === null) {
                    onChange({ fontType: undefined })
                } else {
                    onChange({
                        fontType: newValue.value as FontType,
                    })
                }
            }}
        />
    )

    const textAccentInput = (
        <UISelect<number>
            sx={{
                width: '15rem',
                marginLeft: 1,
            }}
            disabled={readonly}
            options={Object.values(TextAccent).map((textAccent) => ({
                label: labelFromTextAccent(textAccent),
                value: textAccent,
            }))}
            multiple={false}
            freeSolo={false}
            value={
                styleConfig?.textAccent !== undefined ||
                themeConfig?.textAccent !== undefined ||
                input.default?.textAccent !== undefined
                    ? {
                          label: labelFromTextAccent(
                              (styleConfig?.textAccent as TextAccent) ??
                                  themeConfig?.textAccent ??
                                  input.default?.textAccent ??
                                  TextAccent.Shadow // fallback
                          ),
                          value:
                              styleConfig?.textAccent ??
                              themeConfig?.textAccent ??
                              input.default?.textAccent ??
                              1,
                      }
                    : null
            }
            onChange={(newValue) => {
                if (newValue === null) {
                    onChange({ textAccent: undefined })
                } else {
                    onChange({
                        textAccent: newValue.value as TextAccent,
                    })
                }
            }}
        />
    )

    const iconOpts = [
        {
            label: 'Current Item',
            value: 'current',
        },
        {
            label: 'File',
            value: 'file',
        },
        {
            label: 'Sprite Id',
            value: 'sprite',
        },
        {
            label: 'Item Id',
            value: 'itemId',
        },
    ]

    const itemIconTypeSelect = (
        <UISelect<string>
            sx={{
                width: '15rem',
            }}
            disabled={readonly}
            options={iconOpts}
            multiple={false}
            freeSolo={false}
            value={iconOpts.find((opt) => opt.value === iconType) ?? null}
            onChange={(newValue) => {
                switch (newValue?.value) {
                    case 'current':
                        setIconType('current')
                        onChange({ icon: { type: 'current' } })
                        break
                    case 'file':
                        setIconType('file')
                        onChange({ icon: { type: 'file', path: undefined } })
                        break
                    case 'sprite':
                        setIconType('sprite')
                        onChange({
                            icon: {
                                type: 'sprite',
                                id: undefined,
                                index: undefined,
                            },
                        })
                        break
                    case 'itemId':
                        setIconType('itemId')
                        onChange({ icon: { type: 'itemId', id: undefined } })
                        break
                    default:
                        setIconType('none')
                        onChange({ icon: { type: 'none' } })
                        break
                }
            }}
        />
    )

    const iconItemIdInput = (
        <TextField
            sx={{ maxWidth: '6rem' }}
            size="small"
            placeholder="Item Id"
            type="number"
            value={
                styleConfig?.icon?.itemId ??
                themeConfig?.icon?.itemId ??
                input.default?.icon?.itemId ??
                0
            }
            onChange={(e) => {
                onChange({
                    icon: {
                        type: 'itemId',
                        itemId:
                            e.target.value.length > 0
                                ? parseInt(e.target.value)
                                : undefined,
                    },
                })
            }}
        />
    )

    const iconFileInput = (
        <TextField
            size="small"
            sx={{ minWidth: '10rem', maxWidth: '10rem' }}
            placeholder="Icon Path"
            onChange={(e) => {
                let path: string | undefined = e.target.value
                if (path.length === 0) {
                    path = undefined
                }
                onChange({ icon: { type: 'file', path } })
            }}
            value={
                styleConfig?.icon?.path ??
                themeConfig?.icon?.path ??
                input.default?.icon?.path ??
                ''
            }
        />
    )

    const iconSpriteInput = (
        <span style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <TextField
                size="small"
                sx={{ minWidth: '4rem' }}
                placeholder="Sprite Id"
                type="number"
                value={
                    styleConfig?.icon?.spriteId ??
                    themeConfig?.icon?.spriteId ??
                    input.default?.icon?.spriteId ??
                    0
                }
                onChange={(e) => {
                    onChange({
                        icon: {
                            ...(styleConfig?.icon || {}),
                            type: 'sprite',
                            spriteId:
                                e.target.value.length > 0
                                    ? parseInt(e.target.value)
                                    : undefined,
                        },
                    })
                }}
            />
            <TextField
                size="small"
                sx={{ minWidth: '5rem', pl: '1rem' }}
                placeholder="Sprite Index"
                type="number"
                onChange={(e) => {
                    onChange({
                        icon: {
                            ...(styleConfig?.icon || {}),
                            type: 'sprite',
                            spriteIndex:
                                e.target.value.length > 0
                                    ? parseInt(e.target.value)
                                    : undefined,
                        },
                    })
                }}
                value={
                    styleConfig?.icon?.spriteIndex ??
                    themeConfig?.icon?.spriteIndex ??
                    input.default?.icon?.spriteIndex ??
                    0
                }
            />
        </span>
    )

    return (
        <Accordion
            slotProps={{ transition: { unmountOnExit: true } }}
            expanded={expanded && !isHidden}
            onChange={() => setExpanded(!expanded)}
        >
            <AccordionSummary
                sx={{
                    backgroundColor: isHidden
                        ? colors.rsDarkBrown
                        : colors.rsLighterBrown,
                    minHeight: '5rem',
                }}
                expandIcon={!isHidden && <ExpandMore />}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {displayModeInput}
                    <Typography
                        style={{
                            fontFamily: 'RuneScape',
                            fontSize: '24px',
                            marginRight: 2,
                            lineHeight: 1,
                        }}
                    >
                        {input.label}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        marginLeft: 'auto',
                    }}
                >
                    {!isHidden && (
                        <ItemMenuPreview input={input} itemName={input.label} />
                    )}
                    <ItemLabelPreview input={input} itemName={input.label} />
                </Box>
                {!isHidden && (
                    <CopyInputSettings
                        input={input}
                        configToCopy={{
                            ...input.default,
                            ...styleConfig,
                        }}
                        onChange={onChange}
                    />
                )}
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    backgroundColor: colors.rsLighterBrown,
                }}
            >
                <Grid2 container columns={12} rowSpacing={4}>
                    <HeaderCol text="Overlay" />
                    <Column>
                        <Row>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Text Color',
                                        'textColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{textColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Font Type',
                                        'fontType'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={2}>{fontTypeInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Item Icon',
                                        'icon'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={2}>{itemIconTypeSelect}</Grid2>
                        </Row>
                        <Row>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Background Color',
                                        'backgroundColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{backgroundColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Text Accent',
                                        'textAccent'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={4}>{textAccentInput}</Grid2>
                            <Grid2 size={3}>
                                {iconType === 'itemId' && iconItemIdInput}
                                {iconType === 'file' && iconFileInput}
                                {iconType === 'sprite' && iconSpriteInput}
                            </Grid2>
                        </Row>
                        <Row>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Border Color',
                                        'borderColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{borderColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Text Accent Color',
                                        'textAccentColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{textAccentColorInput}</Grid2>
                            <Grid2 size={3} />
                            <Grid2 size={3}>
                                {iconType === 'file' && (
                                    <Typography
                                        variant="caption"
                                        color={colors.rsDarkOrange}
                                        sx={{ lineHeight: 1.0 }}
                                    >
                                        Icon files must live in the folder
                                        <br />
                                        .runelite/loot-filters/icons
                                    </Typography>
                                )}
                                {iconType === 'itemId' && (
                                    <div>
                                        <Typography
                                            component="div"
                                            variant="caption"
                                            color={colors.rsDarkOrange}
                                        >
                                            Item Id
                                        </Typography>
                                        <Typography
                                            component="div"
                                            style={{ marginTop: '-0.5rem' }}
                                            variant="caption"
                                            color={colors.rsDarkOrange}
                                        >
                                            You can use{' '}
                                            <a
                                                style={{
                                                    color: colors.rsDarkYellow,
                                                }}
                                                target="_blank"
                                                href="https://chisel.weirdgloop.org/moid/"
                                            >
                                                this tool
                                            </a>{' '}
                                            to browse items by ID.
                                        </Typography>
                                    </div>
                                )}
                                {iconType === 'sprite' && (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color={colors.rsDarkOrange}
                                                sx={{ lineHeight: 1.0 }}
                                            >
                                                Sprite Id
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    lineHeight: 1.0,
                                                    marginLeft: '7rem',
                                                }}
                                                variant="caption"
                                                color={colors.rsDarkOrange}
                                            >
                                                Sprite Index
                                            </Typography>
                                        </div>
                                        <Typography
                                            variant="caption"
                                            color={colors.rsDarkOrange}
                                        >
                                            You can use{' '}
                                            <a
                                                style={{
                                                    color: colors.rsDarkYellow,
                                                }}
                                                target="_blank"
                                                href="https://abextm.github.io/cache2/#/viewer/sprite/"
                                            >
                                                this tool
                                            </a>{' '}
                                            to browse sprites.
                                        </Typography>
                                    </div>
                                )}
                            </Grid2>
                        </Row>
                    </Column>
                    <HeaderCol text="Menu" />
                    <Column>
                        <Grid2 container size={11}>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Menu Color',
                                        'menuTextColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{menuColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Menu Sort',
                                        'menuSort'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{menuSortInput}</Grid2>
                        </Grid2>
                    </Column>
                    <HeaderCol text="General" />
                    <Grid2 rowSpacing={0} container size={10}>
                        <Row>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Lootbeam',
                                        'showLootbeam'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{displayLootbeamInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Highlight Tile',
                                        'highlightTile'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{highlightTileComponent}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Show Item Value',
                                        'showValue'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{valueComponent}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Drop Sound',
                                        'sound'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{soundTypeSelect}</Grid2>
                        </Row>
                        <Row>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Lootbeam Color',
                                        'lootbeamColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{lootbeamColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Tile Fill',
                                        'tileFillColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{hilightTileFillColorInput}</Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Show Despawn Timer',
                                        'showDespawn'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{despawnComponent}</Grid2>
                            <Grid2 size={2} />
                            <Grid2 size={1}>
                                {soundType === 'soundeffect' &&
                                    soundEffectInput}
                                {soundType === 'fromfile' && soundFileInput}
                            </Grid2>
                        </Row>
                        <Row>
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                            <Label
                                label={
                                    inputWithBadge(
                                        'Tile Stroke',
                                        'tileStrokeColor'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>
                                {hilightTileStrokeColorInput}
                            </Grid2>
                            <Label
                                label={
                                    inputWithBadge(
                                        'Notify on Drop',
                                        'notify'
                                    ) as unknown as string
                                }
                            />
                            <Grid2 size={1}>{notifyComponent}</Grid2>
                            <Grid2 size={2} />
                            {soundType === 'soundeffect' && (
                                <Grid2 size={1}>
                                    <Typography
                                        variant="caption"
                                        color={colors.rsDarkOrange}
                                        sx={{
                                            textWrap: 'nowrap',
                                            lineHeight: 1.0,
                                        }}
                                    >
                                        Sound Effect ID
                                        <br />
                                        <InfoLink
                                            content={<CommonSoundEffects />}
                                        >
                                            <Typography
                                                sx={{
                                                    color: colors.rsDarkYellow,
                                                    textDecoration: 'underline',
                                                }}
                                                variant="caption"
                                            >
                                                hear common effects
                                            </Typography>
                                        </InfoLink>
                                        {', or '}
                                        <a
                                            target="_blank"
                                            style={{
                                                color: colors.rsDarkYellow,
                                            }}
                                            href="https://oldschool.runescape.wiki/w/List_of_sound_IDs"
                                        >
                                            browse the wiki
                                        </a>
                                    </Typography>
                                </Grid2>
                            )}
                            {soundType === 'fromfile' && (
                                <Grid2 size={1}>{soundFileHelpText}</Grid2>
                            )}
                        </Row>
                        <Row>
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                        </Row>
                    </Grid2>
                </Grid2>
            </AccordionDetails>
        </Accordion>
    )
}
