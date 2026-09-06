import { useFilterStore } from '../store/filterStore'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useAlertStore } from '../store/alerts'
import { deriveUrl } from '../parsing/deriveConfig'
import { parseSiteMetadata } from '../parsing/parse'
import { reassociateFilter } from '../utils/restoreFilter'
import { Editor } from '@monaco-editor/react'
import { Delete, Download, Upload } from '@mui/icons-material'
import {
    Box,
    Button,
    Container,
    FormControlLabel,
    Switch,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FLAG_NAMES, useFeatureFlagStore } from '../components/FeatureFlagged'
import {
    allStorageKeys,
    clearAllState,
    downloadFile,
    idbKeys,
    localState,
    uploadState,
} from '../utils/file'

type StorageData = Record<string, unknown>

const useStorageData = () => {
    const [data, setData] = useState<StorageData>({})

    const reload = async () => {
        const state = await localState()
        setData(state)
    }

    useEffect(() => {
        reload()
    }, [])

    return { data, reload }
}

const FilterStoreTabs = ({
    data,
    filterStoreTab,
    setFilterStoreTab,
}: {
    data: StorageData
    filterStoreTab: string
    setFilterStoreTab: (tab: string) => void
}) => {
    const filterStore = data['filter-store'] as
        | { state: { filters: Record<string, { name: string }> } }
        | undefined

    if (!filterStore?.state?.filters) return null

    return (
        <Tabs
            value={filterStoreTab}
            onChange={(_, newValue) => setFilterStoreTab(newValue)}
        >
            <Tab value="everything" label="Everything" />
            {Object.entries(filterStore.state.filters).map(([key, filter]) => (
                <Tab key={key} value={key} label={filter.name} />
            ))}
        </Tabs>
    )
}

const renderContent = (
    tab: string,
    filterStoreTab: string,
    data: StorageData
): string => {
    const value = data[tab]
    if (value === undefined || value === null)
        return 'No data found for this tab'

    let content = value as Record<string, unknown>

    if (tab === 'filter-store' && filterStoreTab !== 'everything') {
        const state = (
            content as { state: { filters: Record<string, unknown> } }
        ).state
        content = state?.filters?.[filterStoreTab] as Record<string, unknown>
    } else if (
        tab === 'filter-configuration-store' &&
        filterStoreTab !== 'everything'
    ) {
        const state = (
            content as {
                state: { filterConfigurations: Record<string, unknown> }
            }
        ).state
        content = state?.filterConfigurations?.[filterStoreTab] as Record<
            string,
            unknown
        >
    }

    return JSON.stringify(content, null, 2)
}

const isJson = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null
}

export const DebugPage = () => {
    useNavigate()
    const [tab, setTab] = useState('filter-store')
    const [filterStoreTab, setFilterStoreTab] = useState('everything')
    const { data, reload } = useStorageData()
    const { filters, updateFilter } = useFilterStore()
    const { filterConfigurations, setFilterConfiguration } =
        useFilterConfigStore()
    const { addAlert } = useAlertStore()
    const [reassociating, setReassociating] = useState(false)
    const selectedFilter = filters[filterStoreTab]

    const forceReassociation = async () => {
        if (!selectedFilter) return
        setReassociating(true)
        try {
            const metadata = parseSiteMetadata(selectedFilter.rs2f).metadata
            const source =
                selectedFilter.source ??
                deriveUrl(selectedFilter) ??
                window
                    .prompt('Enter the original source URL for this filter:')
                    ?.trim()
            if (!source) return
            const restored = await reassociateFilter(
                selectedFilter,
                filterConfigurations[selectedFilter.id],
                source,
                selectedFilter.commit ?? metadata?.commit,
                selectedFilter.revisionUrl ?? metadata?.revisionUrl
            )
            updateFilter(restored.filter)
            setFilterConfiguration(restored.filter.id, restored.config)
            await reload()
            addAlert({
                children: `Re-associated "${restored.filter.name}" with its source`,
                severity: 'success',
            })
        } catch (error) {
            addAlert({ children: (error as Error).message, severity: 'error' })
        } finally {
            setReassociating(false)
        }
    }

    const { checkFeatureFlag, setFeatureFlag } = useFeatureFlagStore()

    return (
        <Container maxWidth="lg">
            <Box>
                {FLAG_NAMES.map((flag) => (
                    <FormControlLabel
                        key={flag}
                        control={
                            <Switch
                                checked={checkFeatureFlag(flag)}
                                onChange={(e) => {
                                    setFeatureFlag(flag, e.target.checked)
                                }}
                            />
                        }
                        label={
                            <Typography color="text.secondary" fontSize="24px">
                                {flag} feature flag
                            </Typography>
                        }
                    />
                ))}
            </Box>
            <Box
                sx={{
                    mt: 5,
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Button
                    sx={{ width: '250px' }}
                    variant="outlined"
                    onClick={async () => {
                        const state = await localState()
                        const fileName = `filterscape_state_${Date.now()
                            .toString()
                            .replaceAll('/', '-')}.json`
                        const file = new File(
                            [JSON.stringify(state)],
                            fileName,
                            { type: 'text/plain' }
                        )
                        downloadFile(file)
                    }}
                >
                    <Download sx={{ fontSize: '20px' }} />
                    Download Local State
                </Button>

                <Button
                    sx={{ width: '250px' }}
                    variant="outlined"
                    component="label"
                >
                    <Upload sx={{ fontSize: '20px' }} />
                    Upload Local State
                    <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const reader = new FileReader()
                            reader.onload = async (e) => {
                                const content = e.target?.result as string
                                const state = JSON.parse(content)
                                await uploadState(state)
                                window.location.href = `${window.location.protocol}://${window.location.host}`
                            }
                            reader.readAsText(file)
                        }}
                    />
                </Button>
                <Button
                    sx={{ width: '250px', color: 'red' }}
                    variant="outlined"
                    onClick={async () => {
                        await clearAllState()
                        window.location.href = `${window.location.protocol}://${window.location.host}`
                    }}
                >
                    <Delete sx={{ fontSize: '20px' }} />
                    Delete All Stored Data
                </Button>
            </Box>
            <Box>
                <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
                    {allStorageKeys.map((key) => (
                        <Tab key={key} value={key} label={key} />
                    ))}
                </Tabs>
                {(tab === 'filter-store' ||
                    tab === 'filter-configuration-store') && (
                    <FilterStoreTabs
                        data={data}
                        filterStoreTab={filterStoreTab}
                        setFilterStoreTab={setFilterStoreTab}
                    />
                )}

                {(tab === 'filter-store' ||
                    tab === 'filter-configuration-store') &&
                    selectedFilter && (
                        <Button
                            disabled={reassociating}
                            onClick={forceReassociation}
                        >
                            {reassociating
                                ? 'Re-associating…'
                                : 'Force re-association'}
                        </Button>
                    )}
                <Editor
                    height="70vh"
                    language={isJson(data[tab]) ? 'json' : 'text'}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, readOnly: true }}
                    value={renderContent(tab, filterStoreTab, data)}
                />
            </Box>
        </Container>
    )
}
