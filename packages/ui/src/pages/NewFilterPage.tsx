import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2,
    TextField,
    Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    DEFAULT_FILTER_CONFIGURATION,
    FilterSpec,
    Filter,
} from '../parsing/UiTypesSpec'
import { useAlertStore } from '../store/alerts'
import { useFilterStore } from '../store/filterStore'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useOboardingStore } from '../store/onboarding'
import { generateId } from '../utils/idgen'
import { createLink } from '../utils/link'
import { loadFilterFromUrl } from '../utils/loaderv2'
import { FilterFilePicker } from '../components/FilterFilePicker'
import { StornFilterVariantDialog } from '../components/StornFilterVariantDialog'
import { deriveConfig, deriveUrl } from '../parsing/deriveConfig'

interface ImportFilterDialogProps {
    open: boolean
    onClose: () => void
}

const FILTERSCAPE_FILTER =
    'https://raw.githubusercontent.com/riktenx/filterscape/refs/heads/main/filter.rs2f'
const JOES_FILTER =
    'https://raw.githubusercontent.com/typical-whack/loot-filters-modules/refs/heads/main/filter.rs2f'

export const NewFilterPage: React.FC = () => {
    const { addAlert } = useAlertStore()
    const [filterUrl, setFilterUrl] = useState('')
    const [importError, setImportError] = useState('')
    const { filters, updateFilter, setActiveFilter } = useFilterStore()
    const { setFilterConfiguration } = useFilterConfigStore()
    const navigate = useNavigate()

    const handleClose = () => {
        setFilterUrl('')
        setShowURLImportOptions(false)
        setLoading(false)
        navigate('/')
    }

    const [showAdvanced, setShowAdvanced] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showURLImportOptions, setShowURLImportOptions] = useState(false)
    const [stornVariantOpen, setStornVariantOpen] = useState(false)
    const { onboardingComplete, setOnboardingComplete } = useOboardingStore()

    const loadFilter = (url: string) => {
        setLoading(true)
        return loadFilterFromUrl(url)
            .then((newFilter) => {
                console.log(newFilter)
                if (newFilter) {
                    const matchingFiltersCount = Object.values(filters)
                        .filter((filter) => filter.source == newFilter.source)
                        .sort((oldFilter, newFilter) =>
                            oldFilter.importedOn.localeCompare(
                                newFilter.importedOn
                            )
                        ).length
                    if (matchingFiltersCount > 0) {
                        newFilter.name = `${newFilter.name} (${matchingFiltersCount})`
                    }
                    updateFilter(newFilter)
                    setActiveFilter(newFilter.id)
                    handleClose()
                }
            })
            .catch((error) => {
                addAlert({
                    children: error.message,
                    severity: 'error',
                })
            })
    }

    const restoreFilter = async (filter: Filter) => {
        setLoading(true)

        const url = deriveUrl(filter)
        if (!url) {
            addAlert({
                children: 'could not determine original filter',
                severity: 'error',
            })
            setLoading(false)
            return
        }

        const base = await loadFilterFromUrl(url)
        const config = deriveConfig(base, filter)

        setFilterConfiguration(base.id, config)
        updateFilter(base)
        setActiveFilter(base.id)

        addAlert({
            children: `restored "${base.name}"`,
            severity: 'success',
        })
        handleClose()
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Typography
                    fontSize="40px"
                    component="div"
                    sx={{ color: 'text.primary', mt: 2, mb: 2 }}
                >
                    Select a filter
                </Typography>
            </div>
            <Grid2
                container
                spacing={2}
                justifyContent="center"
                display={'flex'}
            >
                <Grid2 size={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontSize="36px"
                                component="div"
                            >
                                Rikten's Filter
                            </Typography>
                            <Typography variant="subtitle2">
                                by Rikten X
                            </Typography>
                            <Typography
                                variant="body2"
                                fontSize="24px"
                                sx={{
                                    color: 'text.secondary',
                                    minHeight: '4lh',
                                }}
                            >
                                An all-in-one filter for mains. Useful by
                                default, with limited styling/filtering options.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="main-action"
                                disabled={loading}
                                onClick={(e) => {
                                    e.preventDefault()
                                    loadFilter(FILTERSCAPE_FILTER)
                                }}
                            >
                                Select this filter
                            </Button>
                        </CardActions>
                    </Card>
                </Grid2>
                <Grid2 size={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontSize="36px"
                                component="div"
                            >
                                Joe's Filter
                            </Typography>
                            <Typography variant="subtitle2">by Joe</Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '24px',
                                    minHeight: '4lh',
                                }}
                            >
                                Offers an original color scheme with extensive
                                support for category-based styling/filtering,
                                for irons and mains.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="main-action"
                                onClick={(e) => {
                                    e.preventDefault()
                                    loadFilter(JOES_FILTER)
                                }}
                                disabled={loading}
                            >
                                Select this filter
                            </Button>
                        </CardActions>
                    </Card>
                </Grid2>
                <Grid2 size={3}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontSize="36px"
                                component="div"
                            >
                                Storn's Filter
                            </Typography>
                            <Typography variant="subtitle2">
                                by Storn42
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '24px',
                                    minHeight: '4lh',
                                }}
                            >
                                Iron man and main filters with multiple variants
                                to choose from.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="main-action"
                                disabled={loading}
                                onClick={() => setStornVariantOpen(true)}
                            >
                                Choose variant
                            </Button>
                        </CardActions>
                    </Card>
                </Grid2>
            </Grid2>
            <StornFilterVariantDialog
                open={stornVariantOpen}
                onClose={() => setStornVariantOpen(false)}
                onSelect={(url) => {
                    setStornVariantOpen(false)
                    loadFilter(url)
                }}
                loading={loading}
            />
            {!showAdvanced && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: 18,
                    }}
                >
                    <Button
                        sx={{ textTransform: 'none' }}
                        onClick={() => setShowAdvanced(true)}
                    >
                        Show advanced options ...
                    </Button>
                </div>
            )}
            {showAdvanced && (
                <Box>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography
                            fontSize="28px"
                            component="div"
                            sx={{ color: 'text.primary', mt: 2, mb: 2 }}
                        >
                            Advanced options
                        </Typography>
                    </div>
                    <Grid2
                        container
                        spacing={2}
                        justifyContent="center"
                        display={showURLImportOptions ? 'none' : 'flex'}
                    >
                        <Grid2 size={3}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        fontSize="28px"
                                    >
                                        From a URL
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '20px',
                                            minHeight: '3lh',
                                        }}
                                    >
                                        Import a filter from a GitHub URL.
                                        Documentation about writing and
                                        importing filters on the website can be
                                        found{' '}
                                        <a href="https://github.com/Kaqemeex/loot-filters-ui/tree/main/module-system-docs/modular-filters-book">
                                            on GitHub
                                        </a>
                                        .
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="main-action"
                                        onClick={(e) => {
                                            setShowURLImportOptions(true)
                                        }}
                                    >
                                        Import
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid2>
                        <Grid2 size={3}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        fontSize="28px"
                                    >
                                        Create in UI
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '20px',
                                            minHeight: '3lh',
                                        }}
                                    >
                                        Write your filter manually in a text
                                        editor on the website.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="main-action"
                                        onClick={(e) => {
                                            const id = generateId()
                                            updateFilter(
                                                FilterSpec.parse({
                                                    id: id,
                                                    name: 'My new filter',
                                                    rs2fHash: '',
                                                    modules: [], // TODO add a module
                                                    rs2f: '',
                                                })
                                            )
                                            navigate(
                                                `/editor/${id}?initialFile=filterRs2f`
                                            )
                                        }}
                                    >
                                        Get started
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid2>
                        <Grid2 size={3}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        fontSize="28px"
                                        color="red"
                                    >
                                        Restore deleted settings
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '20px',
                                            minHeight: '3lh',
                                        }}
                                    >
                                        If you lose your website settings for a
                                        filter, you can attempt to restore them
                                        from a downloaded copy here.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <FilterFilePicker
                                        onFilter={restoreFilter}
                                        onError={(error) => {
                                            addAlert({
                                                children: error.message,
                                                severity: 'error',
                                            })
                                        }}
                                    />
                                </CardActions>
                            </Card>
                        </Grid2>
                    </Grid2>
                    <Box
                        sx={{
                            display: showURLImportOptions ? 'flex' : 'none',
                            flexDirection: 'column',
                            gap: 2,
                            marginBottom: 2,
                        }}
                    >
                        <TextField
                            label="Filter URL"
                            value={filterUrl}
                            onChange={(e) => {
                                setFilterUrl(e.target.value)
                                setImportError('')
                            }}
                            error={importError !== ''}
                            helperText={importError}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <Button
                                disabled={filterUrl.length === 0}
                                variant="outlined"
                                color="primary"
                                onClick={(e) => {
                                    setLoading(true)
                                    if (!filterUrl) {
                                        setLoading(false)
                                        setImportError('No filter URL provided')
                                        return
                                    }
                                    createLink(
                                        filterUrl,
                                        DEFAULT_FILTER_CONFIGURATION
                                    ).then((link) => {
                                        window.location.href = link
                                    })
                                }}
                            >
                                Import
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setShowURLImportOptions(false)}
                            >
                                Back
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}
        </div>
    )
}
