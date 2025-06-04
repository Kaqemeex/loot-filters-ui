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

// Remove: import isEqual from 'lodash/isEqual'
// Add a simple shallowEqual function for primitives and shallow objects
function shallowEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object' || a === null || b === null) return false
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false
    }
    return true
}

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
    onChange: (style: StyleConfig) => void
    readonly: boolean
    module: Module
    input: StyleInput
}> = ({ config, onChange, readonly, module, input }) => {
    const [searchParams] = useSearchParams()
    const { addAlert } = useAlertStore()
    const { copiedInput, pasteableConfig, setSettingsCopy } =
        useSettingsCopyStore()
    const [expanded, setExpanded] = useState(
        searchParams.get('expanded') === 'true'
    )

    const styleConfig = StyleConfigSpec.optional()
        .default({})
        .parse(config?.inputConfigs?.[input.macroName])

    const [iconType, setIconType] = useState<
        'none' | 'current' | 'file' | 'sprite' | 'itemId'
    >(styleConfig?.icon?.type ?? input.default?.icon?.type ?? 'none')

    const [soundType, setSoundType] = useState<
        'none' | 'soundeffect' | 'fromfile'
    >(inferSoundType(styleConfig?.sound ?? input.default?.sound))

    const isHidden = styleConfig?.hidden ?? input.default?.hidden
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
        // Get current and default values for the field
        const userConfig = (config?.inputConfigs?.[input.macroName] ?? {})[
            configField
        ]
        const filterConfig = ((input.default ?? {}) as any)[configField]
        let isChanged: boolean
        if (
            typeof userConfig === 'object' &&
            typeof filterConfig === 'object'
        ) {
            isChanged = !shallowEqual(userConfig, filterConfig)
        } else {
            isChanged = userConfig !== filterConfig
        }
        // Determine badge color
        let badgeColor: 'success' | 'warning' | undefined = undefined
        if (isChanged) {
            if (userConfig !== undefined) {
                badgeColor = 'success' // user-set (green)
            } else if (filterConfig !== undefined) {
                badgeColor = 'warning' // filter-set (yellow)
            }
        }
        return badgeColor ? (
            <Tooltip
                title={
                    badgeColor === 'success'
                        ? 'Changed by you'
                        : 'Set by filter'
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

    const displayModeInput = inputWithBadge(
        <EventShield>
            <UISelect<number>
                sx={{ minWidth: '7rem', maxHeight: '3rem' }}
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

    const displayLootbeamInput = inputWithBadge(
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showLootbeam ?? input.default?.showLootbeam ?? false
            }
            onChange={(e) => onChange({ showLootbeam: e.target.checked })}
        />,
        'showLootbeam'
    )

    const lootbeamColorInput = inputWithBadge(
        <ColorPickerInput
            disabled={
                !(styleConfig.showLootbeam ?? input.default?.showLootbeam) ||
                readonly
            }
            configField="lootbeamColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />,
        'lootbeamColor'
    )

    const valueComponent = inputWithBadge(
        <Checkbox
            disabled={readonly}
            checked={styleConfig.showValue ?? input.default?.showValue ?? false}
            onChange={(e) => onChange({ showValue: e.target.checked })}
        />,
        'showValue'
    )

    const despawnComponent = inputWithBadge(
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showDespawn ?? input.default?.showDespawn ?? false
            }
            onChange={(e) => onChange({ showDespawn: e.target.checked })}
        />,
        'showDespawn'
    )

    const notifyComponent = inputWithBadge(
        <Checkbox
            disabled={readonly}
            checked={styleConfig.notify ?? input.default?.notify ?? false}
            onChange={(e) => onChange({ notify: e.target.checked })}
        />,
        'notify'
    )

    const highlightTileComponent = inputWithBadge(
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.highlightTile ??
                input.default?.highlightTile ??
                false
            }
            onChange={(e) => onChange({ highlightTile: e.target.checked })}
        />,
        'highlightTile'
    )

    const hilightTileFillColorInput = inputWithBadge(
        <ColorPickerInput
            configField="tileFillColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
            disabled={
                !(styleConfig.highlightTile ?? input.default?.highlightTile) ||
                readonly
            }
        />,
        'tileFillColor'
    )

    const hilightTileStrokeColorInput = inputWithBadge(
        <ColorPickerInput
            configField="tileStrokeColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
            disabled={
                !(styleConfig.highlightTile ?? input.default?.highlightTile) ||
                readonly
            }
        />,
        'tileStrokeColor'
    )

    const soundOpts = [
        { label: 'None', value: 'none' },
        { label: 'Sound Effect', value: 'soundeffect' },
        { label: 'From File', value: 'fromfile' },
    ]
    const soundTypeSelect = inputWithBadge(
        <UISelect<string>
            sx={{ width: '12rem' }}
            disabled={readonly}
            options={soundOpts}
            multiple={false}
            freeSolo={false}
            value={
                soundOpts.find((opt) => opt.value === soundType) || soundOpts[0]
            }
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
        />,
        'sound'
    )

    const soundEffectInput = inputWithBadge(
        <TextField
            type="number"
            sx={{ minWidth: '12rem' }}
            disabled={readonly}
            size="small"
            placeholder="Effect ID"
            value={styleConfig?.sound ?? input.default?.sound ?? 0}
            onChange={(e) => onChange({ sound: parseInt(e.target.value) || 0 })}
        />,
        'sound'
    )

    const soundFile = styleConfig?.sound ?? input.default?.sound ?? ''
    const soundFileInput = inputWithBadge(
        <TextField
            sx={{ minWidth: '12rem' }}
            disabled={readonly}
            placeholder="Filename"
            value={soundFile}
            onChange={(e) => onChange({ sound: e.target.value })}
        />,
        'sound'
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

    const textColorInput = inputWithBadge(
        <ColorPickerInput
            configField="textColor"
            config={styleConfig}
            input={input}
            disabled={readonly}
            onChange={onChange}
        />,
        'textColor'
    )

    const backgroundColorInput = inputWithBadge(
        <ColorPickerInput
            configField="backgroundColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />,
        'backgroundColor'
    )

    const borderColorInput = inputWithBadge(
        <ColorPickerInput
            configField="borderColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />,
        'borderColor'
    )

    const textAccentColorInput = inputWithBadge(
        <ColorPickerInput
            configField="textAccentColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />,
        'textAccentColor'
    )

    const menuColorInput = inputWithBadge(
        <ColorPickerInput
            configField="menuTextColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />,
        'menuTextColor'
    )
    const menuSortInput = inputWithBadge(
        <TextField
            sx={{ minWidth: '10rem', ml: 1 }}
            placeholder="priority"
            type="number"
            value={styleConfig?.menuSort ?? input.default?.menuSort ?? 0}
            onChange={(e) =>
                onChange({
                    menuSort:
                        e.target.value.length > 0
                            ? parseInt(e.target.value)
                            : undefined,
                })
            }
            disabled={readonly}
        />,
        'menuSort'
    )

    const fontTypeInput = inputWithBadge(
        <UISelect<number>
            sx={{ width: '15rem', marginLeft: 1 }}
            disabled={readonly}
            options={fontTypes.map((fontType) => ({
                label: labelFromFontType(fontType),
                value: fontType,
            }))}
            multiple={false}
            freeSolo={false}
            value={{
                label: labelFromFontType(
                    (styleConfig?.fontType as FontType) ??
                        input.default?.fontType ??
                        FontType.Small // Default to small
                ),
                value: styleConfig?.fontType ?? input.default?.fontType ?? 1,
            }}
            onChange={(newValue) => {
                if (newValue === null) {
                    onChange({ fontType: undefined })
                } else {
                    onChange({
                        fontType: newValue.value as FontType,
                    })
                }
            }}
        />,
        'fontType'
    )
    const textAccentInput = inputWithBadge(
        <UISelect<number>
            sx={{ width: '15rem', marginLeft: 1 }}
            disabled={readonly}
            options={Object.values(TextAccent).map((textAccent) => ({
                label: labelFromTextAccent(textAccent),
                value: textAccent,
            }))}
            multiple={false}
            freeSolo={false}
            value={{
                label: labelFromTextAccent(
                    (styleConfig?.textAccent as TextAccent) ??
                        input.default?.textAccent ??
                        TextAccent.Shadow // Default to shadow
                ),
                value:
                    styleConfig?.textAccent ?? input.default?.textAccent ?? 1, // Default to shadow
            }}
            onChange={(newValue) => {
                if (newValue === null) {
                    onChange({ textAccent: undefined })
                } else {
                    onChange({
                        textAccent: newValue.value as TextAccent,
                    })
                }
            }}
        />,
        'textAccent'
    )
    const iconOpts = [
        {
            label: 'None',
            value: 'none',
        },
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

    const itemIconTypeSelect = inputWithBadge(
        <UISelect<string>
            sx={{ width: '15rem' }}
            disabled={readonly}
            options={iconOpts}
            multiple={false}
            freeSolo={false}
            value={
                iconOpts.find((opt) => opt.value === iconType) || {
                    label: 'None',
                    value: 'none',
                }
            }
            onChange={(newValue) => {
                switch (newValue?.value) {
                    case 'none':
                        setIconType('none')
                        onChange({ icon: { type: 'none' } })
                        break
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
        />,
        'icon'
    )
    const iconItemIdInput = inputWithBadge(
        <TextField
            sx={{ maxWidth: '6rem' }}
            size="small"
            placeholder="Item Id"
            type="number"
            value={
                styleConfig?.icon?.itemId ?? input.default?.icon?.itemId ?? 0
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
        />,
        'icon'
    )
    const iconFileInput = inputWithBadge(
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
            value={styleConfig?.icon?.path ?? input.default?.icon?.path ?? ''}
        />,
        'icon'
    )
    const iconSpriteInput = inputWithBadge(
        <span style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <TextField
                size="small"
                sx={{ minWidth: '4rem' }}
                placeholder="Sprite Id"
                type="number"
                value={
                    styleConfig?.icon?.spriteId ??
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
                    input.default?.icon?.spriteIndex ??
                    0
                }
            />
        </span>,
        'icon'
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
                            <Label label="Text Color" />
                            <Grid2 size={1}>{textColorInput}</Grid2>
                            <Label label="Font Type" />
                            <Grid2 size={2}>{fontTypeInput}</Grid2>
                            <Label label="Item Icon" />
                            <Grid2 size={2}>{itemIconTypeSelect}</Grid2>
                        </Row>
                        <Row>
                            <Label label="Background Color" />
                            <Grid2 size={1}>{backgroundColorInput}</Grid2>
                            <Label label="Text Accent" />
                            <Grid2 size={4}>{textAccentInput}</Grid2>
                            <Grid2 size={3}>
                                {iconType === 'itemId' && iconItemIdInput}
                                {iconType === 'file' && iconFileInput}
                                {iconType === 'sprite' && iconSpriteInput}
                            </Grid2>
                        </Row>
                        <Row>
                            <Label label="Border Color" />
                            <Grid2 size={1}>{borderColorInput}</Grid2>
                            <Label label="Text Accent Color" />
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
                            <Label label="Menu Color" />
                            <Grid2 size={1}>{menuColorInput}</Grid2>
                            <Label label="Menu Sort" />
                            <Grid2 size={1}>{menuSortInput}</Grid2>
                        </Grid2>
                    </Column>
                    <HeaderCol text="General" />
                    <Grid2 rowSpacing={0} container size={10}>
                        <Row>
                            <Label label="Lootbeam" />
                            <Grid2 size={1}>{displayLootbeamInput}</Grid2>
                            <Label label="Highlight Tile" />
                            <Grid2 size={1}>{highlightTileComponent}</Grid2>
                            <Label label="Show Item Value" />
                            <Grid2 size={1}>{valueComponent}</Grid2>
                            <Label label="Drop Sound" />
                            <Grid2 size={1}>{soundTypeSelect}</Grid2>
                        </Row>
                        <Row>
                            <Label label="Lootbeam Color" />
                            <Grid2 size={1}>{lootbeamColorInput}</Grid2>
                            <Label label="Tile Fill" />
                            <Grid2 size={1}>{hilightTileFillColorInput}</Grid2>
                            <Label label="Show Despawn Timer" />
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
                            <Label label="Tile Stroke" />
                            <Grid2 size={1}>
                                {hilightTileStrokeColorInput}
                            </Grid2>
                            <Label label="Notify on Drop" />
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
