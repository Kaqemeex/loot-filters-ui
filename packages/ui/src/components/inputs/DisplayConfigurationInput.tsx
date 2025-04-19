import { ExpandMore } from '@mui/icons-material'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    Grid2,
    SxProps,
    TextField,
    Typography,
} from '@mui/material'
import React, { useState } from 'react'
import {
    FilterConfiguration,
    Module,
    StyleConfig,
    StyleConfigSpec,
    StyleInput,
} from '../../parsing/UiTypesSpec'
import { useSiteConfigStore } from '../../store/siteConfig'
import { colors } from '../../styles/MuiTheme'
import {
    FontType,
    fontTypes,
    labelFromFontType,
    labelFromTextAccent,
    TextAccent,
} from '../../types/Rs2fEnum'
import { ItemLabelPreview, ItemMenuPreview } from '../Previews'
import { ColorPickerInput } from './ColorPicker'
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
        <Grid2 container size={11}>
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

export const DisplayConfigurationInput: React.FC<{
    config: FilterConfiguration
    onChange: (style: StyleConfig) => void
    readonly: boolean
    module: Module
    input: StyleInput
}> = ({ config, onChange, readonly, module, input }) => {
    const { siteConfig } = useSiteConfigStore()
    const [expanded, setExpanded] = useState(siteConfig.devMode)

    const styleConfig = StyleConfigSpec.optional()
        .default({})
        .parse(config?.inputConfigs?.[input.macroName])

    const displayLootbeamInput = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showLootbeam ?? input.default?.showLootbeam ?? false
            }
            onChange={(e) => onChange({ showLootbeam: e.target.checked })}
        />
    )

    const lootbeamColorInput = (
        <ColorPickerInput
            disabled={
                !(styleConfig.showLootbeam ?? input.default?.showLootbeam) ||
                readonly
            }
            configField="lootbeamColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )

    const valueComponent = (
        <Checkbox
            disabled={readonly}
            checked={styleConfig.showValue ?? input.default?.showValue ?? false}
            onChange={(e) => onChange({ showValue: e.target.checked })}
        />
    )

    const despawnComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.showDespawn ?? input.default?.showDespawn ?? false
            }
            onChange={(e) => onChange({ showDespawn: e.target.checked })}
        />
    )

    const notifyComponent = (
        <Checkbox
            disabled={readonly}
            checked={styleConfig.notify ?? input.default?.notify ?? false}
            onChange={(e) => onChange({ notify: e.target.checked })}
        />
    )

    const hideOverlayComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.hideOverlay ?? input.default?.hideOverlay ?? false
            }
            onChange={(e) => onChange({ hideOverlay: e.target.checked })}
        />
    )

    const highlightTileComponent = (
        <Checkbox
            disabled={readonly}
            checked={
                styleConfig.highlightTile ??
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
            input={input}
            onChange={onChange}
            disabled={
                !(styleConfig.highlightTile ?? input.default?.highlightTile) ||
                readonly
            }
        />
    )

    const hilightTileStrokeColorInput = (
        <ColorPickerInput
            configField="tileStrokeColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
            disabled={
                !(styleConfig.highlightTile ?? input.default?.highlightTile) ||
                readonly
            }
        />
    )

    const soundFileInput = (
        <TextField
            sx={{ minWidth: '10rem', marginBottom: '-25px' }}
            placeholder="Sound File or Id"
            value={styleConfig?.sound ?? input.default?.sound ?? ''}
            onChange={(e) => onChange({ sound: e.target.value })}
            disabled={readonly}
        />
    )

    const textColorInput = (
        <ColorPickerInput
            configField="textColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )

    const backgroundColorInput = (
        <ColorPickerInput
            configField="backgroundColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )

    const borderColorInput = (
        <ColorPickerInput
            configField="borderColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )

    const textAccentColorInput = (
        <ColorPickerInput
            configField="textAccentColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )

    const menuColorInput = (
        <ColorPickerInput
            configField="menuTextColor"
            config={styleConfig}
            input={input}
            onChange={onChange}
        />
    )
    const menuSortInput = (
        <TextField
            sx={{ minWidth: '10rem', marginBottom: '-25px' }}
            placeholder="priority"
            type="number"
            value={styleConfig?.menuSort ?? input.default?.menuSort ?? 0}
            onChange={(e) => onChange({ menuSort: parseInt(e.target.value) })}
            disabled={readonly}
        />
    )

    const fontTypeInput = (
        <UISelect<number>
            sx={{ width: '15rem', marginLeft: 1, marginBottom: 1 }}
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
        />
    )
    const textAccentInput = (
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
        />
    )

    return (
        <Accordion
            sx={{
                backgroundColor: colors.rsLightBrown,
            }}
            slotProps={{ transition: { unmountOnExit: true } }}
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
        >
            <AccordionSummary
                sx={{
                    backgroundColor: colors.rsLighterBrown,
                }}
                expandIcon={<ExpandMore />}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ItemLabelPreview input={input} itemName={input.label} />
                    <ItemMenuPreview input={input} itemName={input.label} />
                </Box>
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    backgroundColor: colors.rsLighterBrown,
                }}
            >
                <Grid2 container columns={12} rowSpacing={4}>
                    <HeaderCol text="Label" />
                    <Column>
                        <Row>
                            <Label label="Text Color" />
                            <Grid2 size={1}>{textColorInput}</Grid2>
                            <Label label="Font Type" />
                            <Grid2 size={2}>{fontTypeInput}</Grid2>
                        </Row>
                        <Row>
                            <Label label="Background Color" />
                            <Grid2 size={1}>{backgroundColorInput}</Grid2>
                            <Label label="Text Accent" />
                            <Grid2 size={1}>{textAccentInput}</Grid2>
                        </Row>
                        <Row>
                            <Label label="Border Color" />
                            <Grid2 size={1}>{borderColorInput}</Grid2>
                            <Label label="Text Accent Color" />
                            <Grid2 size={1}>{textAccentColorInput}</Grid2>
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
                    <Grid2 rowSpacing={0} container size={11}>
                        <Row>
                            <Label label="Lootbeam" />
                            <Grid2 size={1}>{displayLootbeamInput}</Grid2>
                            <Label label="Hilight Tile" />
                            <Grid2 size={1}>{highlightTileComponent}</Grid2>
                            <Label label="Show Item Value" />
                            <Grid2 size={1}>{valueComponent}</Grid2>
                            <Label
                                sx={{ justifyContent: 'flex-start' }}
                                label="Drop Sound"
                            />
                        </Row>
                        <Row>
                            <Label label="Lootbeam Color" />
                            <Grid2 size={1}>{lootbeamColorInput}</Grid2>
                            <Label label="Hilight Tile Fill Color" />
                            <Grid2 size={1}>{hilightTileFillColorInput}</Grid2>
                            <Label label="Show Despawn Timer" />
                            <Grid2 size={1}>{despawnComponent}</Grid2>
                            <Grid2 size={2}>{soundFileInput}</Grid2>
                        </Row>
                        <Row>
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                            <Label label="Hilight Tile Stroke" />
                            <Grid2 size={1}>
                                {hilightTileStrokeColorInput}
                            </Grid2>
                            <Label label="Notify on Drop" />
                            <Grid2 size={1}>{notifyComponent}</Grid2>
                        </Row>
                        <Row>
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                            <Grid2 size={2} />
                            <Grid2 size={1} />
                            <Label label="Hide Overlay" />
                            <Grid2 size={1}>{hideOverlayComponent}</Grid2>
                        </Row>
                    </Grid2>
                </Grid2>
            </AccordionDetails>
        </Accordion>
    )
}
