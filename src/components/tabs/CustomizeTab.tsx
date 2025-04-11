import ExpandMore from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Badge,
    Box,
    Dialog,
    Divider,
    Grid2,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { groupBy } from 'underscore'
import { useUiStore } from '../../store/store'
import { colors, MuiRsTheme } from '../../styles/MuiTheme'

import {
    BooleanInput,
    EnumListInput,
    FilterType,
    Input,
    NumberInput,
    StringListInput,
    StyleInput,
    TextInput,
} from '../../types/InputsSpec'
import {
    FilterId,
    UiFilterModule,
    UiModularFilter,
} from '../../types/ModularFilterSpec'

import SettingsIcon from '@mui/icons-material/Settings'
import { isConfigEmpty } from '../../utils/configUtils'
import { generateId } from '../../utils/idgen'
import { BooleanInputComponent } from '../inputs/BooleanInputComponent'
import { DisplayConfigurationInput } from '../inputs/DisplayConfigurationInput'
import { EnumInputComponent } from '../inputs/EnumInputComponent'
import { NumberInputComponent } from '../inputs/NumberInputComponent'
import { StringListInputComponent } from '../inputs/StringListInputComponent'
import { StyleConfig } from '../inputs/StyleInputHelpers'
import { TextInputComponent } from '../inputs/TextInputComponent'
import { Option, UISelect } from '../inputs/UISelect'
import { ItemLabelPreview } from '../Previews'
import { GitHubFlavoredMarkdown } from '../GitHubFlavoredMarkdown'

const InputComponent: React.FC<{
    activeFilterId: FilterId
    module: UiFilterModule
    input: Input
}> = ({ activeFilterId, module, input }) => {
    switch (input.type as FilterType) {
        case 'number':
            const numberInput = input as NumberInput
            return (
                <NumberInputComponent
                    activeFilterId={activeFilterId}
                    input={numberInput}
                    module={module}
                />
            )
        case 'boolean':
            return (
                <BooleanInputComponent
                    activeFilterId={activeFilterId}
                    module={module}
                    input={input as BooleanInput}
                />
            )
        case 'enumlist':
            const enumListInput = input as EnumListInput
            return (
                <EnumInputComponent
                    activeFilterId={activeFilterId}
                    module={module}
                    input={enumListInput}
                />
            )
        case 'stringlist':
            return (
                <StringListInputComponent
                    activeFilterId={activeFilterId}
                    module={module}
                    input={input as StringListInput}
                />
            )
        case 'style':
            return (
                <DisplayConfigurationInput
                    module={module}
                    input={input as StyleInput}
                />
            )
        case 'text':
            const textInput = input as TextInput
            return (
                <TextInputComponent
                    activeFilterId={activeFilterId}
                    module={module}
                    input={textInput}
                />
            )
        default:
            return (
                <Typography variant="h6" color="secondary">
                    Unsupported input type:{' '}
                    <span style={{ color: colors.rsOrange }}>{input.type}</span>
                </Typography>
            )
    }
}

const sizeOf = (input: Input) => {
    switch (input.type) {
        case 'number':
            return 4
        case 'boolean':
            return 2
        case 'style':
            return 16
        default:
            return 4
    }
}

const getPreviews = ({ module }: { module: UiFilterModule }) => {
    const styleInputs: StyleInput[] = module.inputs.filter(
        (input) => input.type === 'style'
    ) as StyleInput[]

    const activeFilterId = useUiStore(
        (state) =>
            Object.keys(state.importedModularFilters).find(
                (id) => state.importedModularFilters[id].active
            )!!
    )
    const configForModule = useUiStore(
        (state) => state.filterConfigurations?.[activeFilterId]?.inputConfigs
    )

    const visibleStyleInputs = styleInputs.filter((input) => {
        const config = configForModule?.[
            input.macroName
        ] as Partial<StyleConfig>
        return !(config?.hideOverlay ?? input.default?.hideOverlay ?? false)
    })

    return visibleStyleInputs.slice(0, 4).map((input) => {
        const macroName = (input as StyleInput).macroName
        return (
            <ItemLabelPreview
                key={macroName}
                itemName={input.label}
                input={input}
                module={module}
            />
        )
    })
}

const ModuleSection: React.FC<{
    activeFilterId: FilterId
    expanded: boolean
    setExpanded: (expanded: boolean) => void
    module: UiFilterModule
}> = ({ activeFilterId, expanded, setExpanded, module }) => {
    const { siteConfig } = useUiStore()
    const [showJson, setShowJson] = useState<'json' | 'configJson' | 'none'>(
        'none'
    )
    const activeConfig = useUiStore(
        (state) => state.filterConfigurations?.[activeFilterId]
    )
    const clearConfiguration = useUiStore((state) => state.clearConfiguration)
    const setEnabledModule = useUiStore((state) => state.setEnabledModule)

    let json: string | null = null
    let configJson: string | null = null

    if (siteConfig.devMode) {
        json = JSON.stringify(module, null, 2)
        configJson = JSON.stringify(activeConfig, null, 2)
    }

    const defaultGroupId = generateId()

    const groupedInputs = groupBy(
        module.inputs.map((input) => ({
            ...input,
            group: input.group ?? defaultGroupId,
        })),
        'group'
    )

    const moduleEnabledDefaultValue = module?.enabled ?? true
    const configuredEnableValue = useUiStore(
        (state) =>
            state.filterConfigurations?.[activeFilterId]?.enabledModules?.[
                module.id
            ]
    )
    const enabled = configuredEnableValue ?? moduleEnabledDefaultValue

    const showPreviews = useMediaQuery(MuiRsTheme.breakpoints.up('sm'))
    const previews = getPreviews({ module })

    const filterConfig =
        useUiStore(
            (state) =>
                state.filterConfigurations?.[activeFilterId]?.inputConfigs
        ) || {}

    const moduleMacronames = module.inputs.map((input) => {
        return input.macroName
    })

    const configCount = Object.keys(filterConfig)
        .filter((macroName) => moduleMacronames.includes(macroName))
        .filter((key) => !isConfigEmpty(filterConfig[key])).length

    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
    return (
        <>
            <Menu
                anchorEl={menuAnchor}
                open={!!menuAnchor}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem
                    onClick={() => {
                        clearConfiguration(
                            activeFilterId,
                            module.inputs
                                .map(
                                    (input) =>
                                        input.macroName as
                                            | string
                                            | {
                                                  includes: string
                                                  excludes: string
                                              }
                                )
                                .reduce<string[]>((acc, macroName) => {
                                    if (typeof macroName === 'string') {
                                        return [...acc, macroName]
                                    } else {
                                        return [
                                            ...acc,
                                            macroName.includes,
                                            macroName.excludes,
                                        ]
                                    }
                                }, [])
                        )
                    }}
                >
                    Reset Module
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setEnabledModule(activeFilterId, module.id, !enabled)
                    }}
                >
                    {enabled ? 'Disable Module' : 'Enable'}
                </MenuItem>
            </Menu>
            <Accordion
                slotProps={{ transition: { unmountOnExit: true } }}
                expanded={expanded && enabled}
                onChange={() => setExpanded(!expanded)}
                sx={{
                    '&::before': {
                        backgroundColor: colors.rsDarkBrown,
                    },
                    filter: !enabled ? 'grayscale(0.75)' : 'none',
                }}
            >
                <AccordionSummary
                    component="div"
                    expandIcon={<ExpandMore />}
                    sx={{
                        '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '16px',
                        },
                        flexDirection: 'row-reverse',
                        gap: '16px',
                    }}
                >
                    <Stack>
                        <Typography variant="h4" color="primary">
                            {module.name}
                        </Typography>
                        {module?.subtitle && (
                            <Typography
                                variant="h6"
                                component="span"
                                color="secondary"
                            >
                                {module?.subtitle}
                            </Typography>
                        )}
                    </Stack>
                    {showPreviews && (
                        <Stack
                            direction="row"
                            sx={{
                                flex: '1',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-end',
                                gap: '8px',
                                alignItems: 'center',
                            }}
                        >
                            {previews}
                        </Stack>
                    )}

                    <Tooltip
                        title={
                            configCount ? `${configCount} settings changed` : ''
                        }
                    >
                        <IconButton
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                                e.stopPropagation()
                                setMenuAnchor(e.currentTarget)
                            }}
                        >
                            <Badge badgeContent={configCount} color="secondary">
                                <SettingsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2} direction="column">
                        <Stack
                            sx={{ display: 'block' }}
                            direction="row"
                            justifyContent="flex-end"
                        >
                            <GitHubFlavoredMarkdown
                                gfmd={module.description ?? ''}
                            />
                        </Stack>
                        {siteConfig.devMode ? (
                            <Box display="flex" justifyContent="flex-end">
                                <ToggleButtonGroup
                                    value={showJson}
                                    onChange={(event, value) =>
                                        setShowJson(value)
                                    }
                                    exclusive
                                >
                                    <ToggleButton value="json">
                                        Show Module JSON
                                    </ToggleButton>
                                    <ToggleButton value="configJson">
                                        Show Config JSON
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        ) : null}
                        {showJson !== 'none' && !!showJson ? (
                            <Box
                                sx={{
                                    backgroundColor: 'background.paper',
                                    p: 2,
                                    borderRadius: 1,
                                }}
                            >
                                <pre
                                    style={{
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    {showJson === 'json'
                                        ? json
                                        : showJson === 'configJson'
                                          ? configJson
                                          : null}
                                </pre>
                            </Box>
                        ) : null}
                        {Object.entries(groupedInputs).map(
                            ([group, inputs], index) => {
                                return (
                                    <Grid2 key={index} container spacing={2}>
                                        <Grid2 size={12}>
                                            <Divider>
                                                {group !== defaultGroupId ? (
                                                    <Typography
                                                        variant="h6"
                                                        color="primary"
                                                    >
                                                        {group}
                                                    </Typography>
                                                ) : null}
                                            </Divider>
                                        </Grid2>
                                        {inputs
                                            .sort(
                                                (a: Input, b: Input) =>
                                                    sizeOf(a) - sizeOf(b)
                                            )
                                            .map((input, index) => {
                                                return (
                                                    <Grid2
                                                        key={index}
                                                        size={sizeOf(input)}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            color="primary"
                                                        >
                                                            {input.label}
                                                        </Typography>
                                                        <InputComponent
                                                            activeFilterId={
                                                                activeFilterId
                                                            }
                                                            module={module}
                                                            input={input}
                                                        />
                                                    </Grid2>
                                                )
                                            })}
                                    </Grid2>
                                )
                            }
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </>
    )
}

export const CustomizeTab: React.FC = () => {
    const { siteConfig } = useUiStore()
    const importedModularFilters = useUiStore(
        (state) => state.importedModularFilters
    )
    const [expandedModules, setExpandedModules] = useState<
        Record<string, boolean>
    >({})

    const activeFilter: UiModularFilter | undefined = useMemo(
        () =>
            Object.values(importedModularFilters).find(
                (filter) => filter.active
            ),
        [importedModularFilters]
    )

    const setAllExpanded = (expanded: boolean) => {
        if (!activeFilter) return
        const newExpandedModules: Record<string, boolean> = {}
        activeFilter.modules.forEach((module) => {
            newExpandedModules[module.name] = expanded
        })
        setExpandedModules(newExpandedModules)
    }

    React.useEffect(() => {
        const handleExpandAll = (event: CustomEvent) => {
            setAllExpanded(event.detail)
        }

        window.addEventListener('expandAll', handleExpandAll as EventListener)
        return () => {
            window.removeEventListener(
                'expandAll',
                handleExpandAll as EventListener
            )
        }
    }, [activeFilter])

    if (!activeFilter) {
        return (
            <Typography variant="h4" color="primary">
                No filter selected
            </Typography>
        )
    }

    console.log('rendering CustomizeTab', activeFilter.modules.length)

    return (
        <Stack>
            {activeFilter?.modules.map((module, index: number) => (
                <ModuleSection
                    key={index}
                    activeFilterId={activeFilter.id}
                    module={module}
                    expanded={
                        expandedModules[module.name] ??
                        (false || siteConfig.devMode)
                    }
                    setExpanded={(expanded) =>
                        setExpandedModules((prev) => ({
                            ...prev,
                            [module.name]: expanded,
                        }))
                    }
                />
            ))}
        </Stack>
    )
}
