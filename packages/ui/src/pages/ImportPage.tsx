import {
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CustomizeTab } from '../components/tabs/CustomizeTab'
import {
    DEFAULT_FILTER_CONFIGURATION,
    FilterConfiguration,
} from '../parsing/UiTypesSpec'
import { parseAsync as parse, ParseResult } from '../parsing/parse'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useFilterStore } from '../store/filterStore'
import { colors } from '../styles/MuiTheme'
import { parseComponent } from '../utils/link'

type SavedFilter = {
    rs2f: string
    expectedRs2fHash: string
    sourceUrl: string
}

type LoadFilterResponse = {
    filter: SavedFilter
    config: FilterConfiguration | null
}

export const ImportPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const importData = searchParams.get('importData')
    const filterId = searchParams.get('filterId')

    const { updateFilter } = useFilterStore()
    const { setActiveFilter } = useFilterStore()
    const { setFilterConfiguration } = useFilterConfigStore()
    const navigate = useNavigate()

    const [error, setError] = useState<Error | null>(null)

    const [loadingFilter, setLoadingFilter] = useState(false)
    const [parsedFilter, setParsedFilter] = useState<ParseResult | null>(null)

    const [filterUrl, setFilterUrl] = useState<string | null>(null)
    const [filterConfig, setFilterConfig] =
        useState<FilterConfiguration | null>(null)

    useEffect(() => {
        if (!importData && !filterId) {
            setError(new Error('No import data'))
            return
        }
        setLoadingFilter(true)

        if (importData) {
            parseComponent(importData)
                .then(({ filterUrl, config }) => {
                    setFilterUrl(filterUrl)
                    setFilterConfig(config)

                    return fetch(filterUrl)
                })
                .then((res) => {
                    return res.text()
                })
                .then((text: string) => {
                    return parse(text)
                })
                .then((parsed: ParseResult) => {
                    setParsedFilter(parsed)
                    setError(null)
                    setLoadingFilter(false)
                })
                .catch((err) => {
                    setParsedFilter(null)
                    setError(err)
                    setLoadingFilter(false)
                })
        }

        if (filterId) {
            fetch(`http://localhost:8787/filter/${filterId}`)
                .then((res) => res.json())
                .then(
                    ({
                        filter: { rs2f, sourceUrl },
                        config,
                    }: LoadFilterResponse) => {
                        setFilterUrl(sourceUrl)
                        setFilterConfig(config)
                        return parse(rs2f)
                    }
                )
                .then((parsed: ParseResult) => {
                    setParsedFilter(parsed)
                    setError(null)
                    setLoadingFilter(false)
                })
                .catch((err) => {
                    console.error(err)
                    setParsedFilter(null)
                    setError(err)
                    setLoadingFilter(false)
                })
        }
    }, [])

    const errorComponent = error ? (
        <div>
            <Typography color="error" variant="h6">
                Error loading filter
            </Typography>
            <Typography variant="body2" color={colors.rsLightestBrown}>
                {error.message}
            </Typography>
        </div>
    ) : null

    const loadingComponent = loadingFilter ? (
        <Typography color="primary" variant="h6">
            Loading... <CircularProgress />
        </Typography>
    ) : null

    const customizationCount = Object.keys(filterConfig ?? {}).length

    const filterComponent = parsedFilter ? (
        <>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Typography variant="h6" color={colors.rsLightestBrown}>
                    Importing Filter
                </Typography>
                <TextField
                    label="Filter Name"
                    value={parsedFilter.filter?.name}
                    helperText={
                        parsedFilter.filter?.name.trim() === ''
                            ? 'Name cannot be empty'
                            : null
                    }
                    error={parsedFilter.filter?.name.trim() === ''}
                    onChange={(e) => {
                        if (parsedFilter?.filter) {
                            setParsedFilter({
                                ...parsedFilter,
                                filter: {
                                    ...parsedFilter.filter,
                                    name: e.target.value,
                                    source: filterUrl!!,
                                },
                            })
                        }
                    }}
                />
                <Typography variant="h6" color={colors.rsLightestBrown}>
                    with {customizationCount} customizations from{' '}
                    <a href={filterUrl ?? '#'}>
                        {!!filterUrl ? new URL(filterUrl).hostname : null}
                    </a>
                </Typography>
                <Button
                    sx={{
                        height: 'fit-content',
                        marginLeft: 'auto',
                        alignSelf: 'center',
                    }}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                        updateFilter({
                            ...parsedFilter.filter!!,
                            source: filterUrl!!,
                            importedOn: new Date().toISOString(),
                        })
                        setActiveFilter(parsedFilter.filter!!.id)
                        setFilterConfiguration(
                            parsedFilter.filter!!.id,
                            filterConfig || DEFAULT_FILTER_CONFIGURATION
                        )

                        navigate('/')
                    }}
                >
                    Import
                </Button>
            </div>
            <div>
                <CustomizeTab
                    extraComponent={
                        <Typography
                            color={colors.rsDarkOrange}
                            variant="body2"
                            fontSize={24}
                        >
                            Check out the modules below. If you'd like to import
                            this filter and customize it, press import on the
                            right.
                        </Typography>
                    }
                    filter={parsedFilter.filter!!}
                    config={filterConfig}
                    readonly={true}
                    onChange={() => {}}
                    clearConfiguration={() => {}}
                    setEnabledModule={() => {}}
                />
            </div>
        </>
    ) : null

    return (
        <Container maxWidth="xl">
            {loadingComponent}
            {errorComponent}
            {filterComponent}
        </Container>
    )
}
