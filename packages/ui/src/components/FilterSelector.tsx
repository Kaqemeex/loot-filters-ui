import {
    Edit,
    FileCopy,
    IosShare,
    Update,
    UpdateDisabled,
} from '@mui/icons-material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { BackgroundSelector } from '../components/BackgroundSelector'
import {
    DEFAULT_FILTER_CONFIGURATION,
    Filter,
    FilterConfigurationSpec,
    FilterId,
} from '../parsing/UiTypesSpec'
import { useAlertStore } from '../store/alerts'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useFilterStore } from '../store/filterStore'
import { useOboardingStore } from '../store/onboarding'
import { colors } from '../styles/MuiTheme'
import { countConfigChanges } from '../utils/configUtils'
import { downloadFile } from '../utils/file'
import { generateId } from '../utils/idgen'
import { createLink } from '../utils/link'
import { loadFilterFromUrl } from '../utils/loaderv2'
import { renderFilter } from '../utils/render'
import { Option, UISelect } from './inputs/UISelect'
import { SmartTooltip } from './SmartTooltip'

import ImportRuneliteGif from '../images/import_runelite.gif'

const updateAvailableFn = (
    activeFilter?: Filter | null,
    updatedFilter?: Filter | null
) => {
    try {
        return (
            updatedFilter?.rs2fHash !== undefined &&
            activeFilter?.rs2fHash !== updatedFilter?.rs2fHash
        )
    } catch (e) {
        console.log('error', e)
        return false
    }
}

const isAutoUpdate = (filterUrl?: string): boolean =>
    filterUrl != null &&
    filterUrl != undefined &&
    (filterUrl?.startsWith(
        'https://raw.githubusercontent.com/riktenx/filterscape'
    ) ||
        filterUrl?.startsWith(
            'https://raw.githubusercontent.com/typical-whack/loot-filters-modules'
        ))

const UpdateAvailableDialog: React.FC<{
    open: boolean
    filterName: string
    filterUrl?: string
    onClose: () => void
    onUpdate: () => void
}> = ({ open, filterName, filterUrl, onClose, onUpdate }) => {
    let updateText = (
        <span>
            A new version of the filter is available. Would you like to update?
        </span>
    )

    const autoUpdate = isAutoUpdate(filterUrl)

    const [timeoutDone, setTimeoutDone] = useState(false)

    if (autoUpdate) {
        updateText = (
            <span>
                This filter is supported by the loot-filters plugin or
                filterscape site maintainers. To keep it compatible with the
                site it is being automatically updated.
                <br />
                <br />
                After the update re-import the filter to RuneLite to apply the
                changes.
            </span>
        )
        setTimeout(() => {
            setTimeoutDone(true)
        }, 3000)
    }

    return (
        // Do not set onClose to prevent closing with escape key & clicking away
        // We want to force the user to click the button to close the dialog
        <Dialog open={open}>
            <DialogTitle sx={{ textAlign: 'center' }}>
                Update Available for {filterName}
            </DialogTitle>
            <DialogContent>
                <Typography
                    sx={{ textAlign: 'center', color: colors.rsLightestBrown }}
                >
                    {updateText}
                </Typography>
            </DialogContent>
            <DialogActions
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                {autoUpdate && !timeoutDone && (
                    <Typography>
                        Update in progress...
                        <CircularProgress size={16} />
                    </Typography>
                )}
                {autoUpdate && timeoutDone && (
                    <Button variant="outlined" onClick={onUpdate}>
                        I will ReImport to RuneLite
                    </Button>
                )}

                {!autoUpdate && (
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Button
                            sx={{
                                borderColor: colors.rsLightestBrown,
                                color: colors.rsLightestBrown,
                            }}
                            variant="outlined"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{
                                color: colors.rsYellow,
                                borderColor: colors.rsYellow,
                            }}
                            variant="outlined"
                            onClick={onUpdate}
                        >
                            Update
                        </Button>
                    </div>
                )}
            </DialogActions>
        </Dialog>
    )
}

export const FilterSelector: React.FC<{ reloadOnChange?: boolean }> = ({
    reloadOnChange,
}) => {
    const navigate = useNavigate()

    const { disableExportDialog, setDisableExportDialog } = useOboardingStore()

    const { filters, removeFilter, setActiveFilter, updateFilter } =
        useFilterStore()

    const { setFilterConfiguration, removeFilterConfiguration } =
        useFilterConfigStore()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [exportDialogOpen, setExportDialogOpen] = useState(false)

    const activeFilter = useMemo(
        () => Object.values(filters).find((filter) => filter.active),
        [filters]
    )

    const activeFilterConfig = FilterConfigurationSpec.optional().parse(
        useFilterConfigStore(
            (state) =>
                activeFilter && state.filterConfigurations?.[activeFilter?.id]
        )
    )
    const [updatedFilter, setUpdatedFilter] = useState<Filter | null>(null)

    const handleFilterChange = useCallback(
        (newValue: Option<FilterId> | null) => {
            if (newValue) {
                setUpdatedFilter(null)
                setActiveFilter(newValue.value)
                if (reloadOnChange) {
                    window.location.reload()
                }
            }
        },
        [setActiveFilter]
    )
    const handleDeleteFilter = useCallback(() => {
        if (activeFilter) {
            removeFilter(activeFilter.id)
            removeFilterConfiguration(activeFilter.id)
        }
    }, [activeFilter, setActiveFilter, removeFilter, removeFilterConfiguration])

    const filterOptions: Option<FilterId>[] = Object.values(filters).map(
        (filter) => ({
            label: filter.name,
            value: filter.id,
        })
    )

    const selectedFilter = activeFilter
        ? {
              label: activeFilter.name,
              value: activeFilter.id,
          }
        : null

    const addAlert = useAlertStore((state) => state.addAlert)

    const updateAvailable = useMemo(() => {
        const result = updateAvailableFn(activeFilter, updatedFilter)
        return result
    }, [activeFilter, updatedFilter])

    useEffect(() => {
        if (
            activeFilter != null &&
            activeFilter.source != null &&
            updatedFilter == null
        ) {
            loadFilterFromUrl(activeFilter.source)
                .then((newFilter) => {
                    setUpdatedFilter(newFilter)
                })
                .catch((e) => {
                    addAlert({
                        children: `Failed to check for updates to filter: ${e.message}`,
                        severity: 'error',
                    })
                })
        }
    }, [activeFilter])

    const [filterMenuAnchor, setFilterMenuAnchor] =
        useState<HTMLElement | null>(null)

    const copyToClipboardButton = (
        <SmartTooltip
            enabledTitle="Copy filter to clipboard"
            disabledTitle="No filter selected"
            enabled={activeFilter != null}
        >
            <Button
                variant="outlined"
                sx={{
                    color: colors.rsHerbGreen,
                    borderColor: colors.rsHerbGreen,
                    backgroundColor: colors.rsDarkBrown,
                }}
                disabled={!activeFilter}
                onClick={() => {
                    if (!activeFilter) {
                        return
                    }
                    const renderedFilter = renderFilter(
                        activeFilter,
                        activeFilterConfig
                    )
                    navigator.clipboard
                        .writeText(renderedFilter)
                        .then(() => {
                            if (disableExportDialog) {
                                addAlert({
                                    children:
                                        'Filter copied to clipboard, import it to RuneLite via the Loot Filters plugin panel.',
                                    severity: 'success',
                                })
                            } else {
                                setExportDialogOpen(true)
                            }
                        })
                        .catch(() => {
                            addAlert({
                                children: 'Failed to copy filter to clipboard',
                                severity: 'error',
                            })
                        })
                }}
            >
                <ContentCopyIcon
                    sx={{ fontSize: '20px', paddingRight: '5px' }}
                />
                Export to RuneLite
            </Button>
        </SmartTooltip>
    )

    const updateFilterFn = () => {
        if (!activeFilter) {
            return
        }
        if (updatedFilter != null) {
            const updatedAt = new Date().toISOString()

            updateFilter({
                ...updatedFilter,
                id: activeFilter.id,
                name: activeFilter.name,
                importedOn: activeFilter.importedOn,
                updatedOn: updatedAt,
                active: true,
                description: updatedFilter?.description,
            })
            setUpdatedFilter(null)

            addAlert({
                children: 'Filter updated',
                severity: 'success',
            })
        }
    }

    const updateFilterButton = (
        <SmartTooltip
            enabledTitle="Update filter"
            disabledTitle="No updates available"
            enabled={updateAvailable}
        >
            <IconButton disabled={!updateAvailable} onClick={updateFilterFn}>
                {!updateAvailable && (
                    <UpdateDisabled style={{ color: 'grey' }} />
                )}
                {updateAvailable && (
                    <Update
                        style={{
                            color: colors.rsOrange,
                        }}
                    />
                )}
            </IconButton>
        </SmartTooltip>
    )

    const shareFilterButton = (
        <SmartTooltip
            enabledTitle="Share filter link"
            disabledTitle="Filters without a source URL cannot be shared"
            enabled={activeFilter?.source != null}
        >
            <span>
                <Button
                    variant="outlined"
                    disabled={!activeFilter || !activeFilter.source}
                    onClick={() => {
                        if (!activeFilter) {
                            return
                        }

                        if (activeFilter.source === null) {
                            addAlert({
                                children:
                                    'Filters without a source URL cannot be shared',
                                severity: 'error',
                            })
                            return
                        }

                        createLink(activeFilter, activeFilterConfig)
                            .then((link) => {
                                return navigator.clipboard
                                    .writeText(link)
                                    .then(() => {
                                        addAlert({
                                            children:
                                                'Filter link copied to clipboard',
                                            severity: 'success',
                                        })
                                    })
                            })
                            .catch((error) => {
                                console.error(error)
                                addAlert({
                                    children: `Failed to copy filter link to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                    severity: 'error',
                                })
                            })
                    }}
                >
                    <IosShare
                        style={{
                            fontSize: '20px',
                            paddingRight: '5px',
                            color: activeFilter?.source
                                ? colors.rsOrange
                                : colors.rsGrey,
                        }}
                    />
                    Share
                </Button>
            </span>
        </SmartTooltip>
    )

    const menuButton = (
        <IconButton onClick={(e) => setFilterMenuAnchor(e.currentTarget)}>
            <MoreVertIcon
                style={{
                    color: colors.rsDarkOrange,
                }}
            />
        </IconButton>
    )

    const menu = (
        <Menu
            open={filterMenuAnchor != null}
            onClose={() => setFilterMenuAnchor(null)}
            anchorEl={filterMenuAnchor}
        >
            <SmartTooltip
                enabledTitle="Edit filter"
                disabledTitle="No filter selected"
                enabled={activeFilter != null}
                tooltipSide="right"
            >
                <MenuItem
                    disabled={!activeFilter}
                    onClick={() => {
                        navigate(`/editor/${activeFilter!!.id}`)
                    }}
                >
                    <ListItemIcon>
                        <Edit />
                    </ListItemIcon>
                    <ListItemText>Edit Filter</ListItemText>
                </MenuItem>
            </SmartTooltip>
            <SmartTooltip
                enabledTitle="Download filter"
                disabledTitle="No filter selected"
                enabled={activeFilter != null}
                tooltipSide="right"
            >
                <MenuItem
                    disabled={!activeFilter}
                    onClick={() => {
                        if (!activeFilter) {
                            return
                        }
                        const renderedFilter = renderFilter(
                            activeFilter,
                            activeFilterConfig
                        )
                        const fileName = `${activeFilter.name}.rs2f`
                        const file = new File([renderedFilter], fileName, {
                            type: 'text/plain',
                        })
                        downloadFile(file)
                    }}
                >
                    <ListItemIcon>
                        <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Download</ListItemText>
                </MenuItem>
            </SmartTooltip>
            <SmartTooltip
                enabledTitle="Duplicate filter with current settings"
                disabledTitle="No filter selected"
                enabled={activeFilter != null}
                tooltipSide="right"
            >
                <MenuItem
                    disabled={!activeFilter}
                    onClick={() => {
                        if (!activeFilter) {
                            return
                        }

                        const newId = generateId()

                        setFilterConfiguration(
                            newId,
                            activeFilterConfig || DEFAULT_FILTER_CONFIGURATION
                        )

                        updateFilter({
                            ...activeFilter,
                            id: newId,
                            name: `${activeFilter.name} (copy)`,
                        })

                        setActiveFilter(newId)
                        addAlert({
                            children: 'Filter duplicated',
                            severity: 'success',
                        })
                    }}
                >
                    <ListItemIcon>
                        <FileCopy fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Duplicate</ListItemText>
                </MenuItem>
            </SmartTooltip>
            <SmartTooltip
                enabledTitle="Delete filter"
                disabledTitle="No filter selected"
                enabled={activeFilter != null}
                tooltipSide="right"
            >
                <MenuItem
                    disabled={!activeFilter}
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    <ListItemIcon>
                        <DeleteIcon
                            style={{ color: colors.rsRed }}
                            fontSize="small"
                        />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </SmartTooltip>
        </Menu>
    )

    if (Object.keys(filters).length === 0) {
        return <Navigate to="/new-filter" />
    }

    return (
        <>
            <Stack spacing={2}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        marginLeft: 'auto',
                    }}
                >
                    <FormControl
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                        }}
                        size="small"
                    >
                        <UISelect<FilterId>
                            sx={{ width: '300px' }}
                            options={filterOptions}
                            value={selectedFilter}
                            onChange={handleFilterChange}
                            label="Select a filter"
                            disabled={Object.keys(filters).length === 0}
                            multiple={false}
                        />
                    </FormControl>

                    {copyToClipboardButton}
                    {!isAutoUpdate(activeFilter?.source) && updateFilterButton}
                    {shareFilterButton}
                    {menuButton}
                    {menu}
                    <UpdateAvailableDialog
                        open={updateAvailable}
                        filterName={activeFilter?.name ?? ''}
                        filterUrl={activeFilter?.source ?? ''}
                        onClose={() => {
                            setUpdatedFilter(null)
                        }}
                        onUpdate={() => {
                            updateFilterFn()
                            setUpdatedFilter(null)
                        }}
                    />
                    <div style={{ marginLeft: 'auto' }}>
                        <SearchBar />
                    </div>
                    <BackgroundSelector />
                </Box>
            </Stack>
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Filter?</DialogTitle>
                <DialogContent>
                    <Typography
                        sx={{
                            fontSize: '3rem',
                            color: colors.rsLightestBrown,
                        }}
                    >
                        Filter {activeFilter?.name} has{' '}
                        <span style={{ color: colors.rsYellow }}>
                            {countConfigChanges(
                                (activeFilterConfig as any) ?? {}
                            )}
                        </span>{' '}
                        configuration changes.
                    </Typography>
                    <DialogContentText
                        sx={{
                            fontSize: '2rem',
                            color: colors.rsRed,
                        }}
                    >
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outlined"
                        style={{ color: colors.rsRed }}
                        onClick={handleDeleteFilter}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
            >
                <DialogTitle>
                    The filter has been copied to the clipboard.
                </DialogTitle>
                <DialogContent>
                    <Typography color={colors.rsLightestBrown}>
                        Navigate to the Loot Filters plugin panel in RuneLite
                        and click the "Import from clipboard" button:
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img src={ImportRuneliteGif} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setExportDialogOpen(false)}
                    >
                        OK
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setDisableExportDialog(true)
                            setExportDialogOpen(false)
                        }}
                    >
                        Don't show this again
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
