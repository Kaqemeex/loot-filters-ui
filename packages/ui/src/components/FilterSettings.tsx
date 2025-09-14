import {
    Alert,
    Box,
    CircularProgress,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useFilterFromRouteStore } from '../stores/filter-store'
import { MacroBindingsList } from './MacroBindingsList'
import FilterVersionSelect from './FilterVersionSelect'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`filter-settings-tabpanel-${index}`}
            aria-labelledby={`filter-settings-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    )
}

export const FilterSettings: React.FC = () => {
    const { versions, filter, isLoading } = useFilterFromRouteStore()

    const [activeTab, setActiveTab] = useState(0)
    const [selectedVersionId, setSelectedVersionId] = useState<string>(
        filter?.currentVersionId || versions?.[0]?.versionId || ''
    )

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!filter) {
        return <Alert severity="error">Filter not found</Alert>
    }

    if (!versions || !versions.length) {
        return (
            <Alert severity="info">
                No versions available for this filter.
            </Alert>
        )
    }

    return (
        <Box>
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6">Filter Settings</Typography>
                <Box>
                    <FilterVersionSelect
                        selectedVersionId={selectedVersionId}
                        versions={versions}
                        onVersionChange={(versionId) =>
                            setSelectedVersionId(versionId)
                        }
                        allowCreateVersion={true}
                    />
                </Box>
            </Box>

            <>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(event, newValue) => setActiveTab(newValue)}
                    >
                        <Tab label="Macro Bindings" />
                        <Tab label="Settings" />
                    </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                    <MacroBindingsList
                        macroBindings={
                            versions.find(
                                (version) =>
                                    version.versionId === selectedVersionId
                            )?.parsedMacros || []
                        }
                        isLoading={false}
                    />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Alert severity="info">
                        Settings configuration coming soon...
                    </Alert>
                </TabPanel>
            </>
        </Box>
    )
}
