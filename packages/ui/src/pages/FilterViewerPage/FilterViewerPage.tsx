import {
    ArrowBack as ArrowBackIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterFromRouteStore } from '../../stores/filter-store'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`filter-tabpanel-${index}`}
            aria-labelledby={`filter-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    )
}

export const FilterViewerPage: React.FC = () => {
    const navigate = useNavigate()
    const { filter, isLoadingFilter } = useFilterFromRouteStore()

    const [activeTab, setActiveTab] = useState(0)

    if (!filter) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                Filter not found
            </Alert>
        )
    }

    if (isLoadingFilter) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        color: 'primary.main',
                        mr: 2,
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ color: 'primary.main', mb: 1 }}
                    >
                        {filter?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            label={filter?.public ? 'Public' : 'Private'}
                            size="small"
                            color={filter?.public ? 'success' : 'default'}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                        >
                            Version {filter?.currentVersionId.slice(0, 8)}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Settings">
                        <IconButton
                            onClick={() =>
                                navigate(
                                    `/filters/${filter?.filterId}/settings`
                                )
                            }
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Filter Info Card */}
            <Card
                sx={{
                    mb: 3,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filter Information
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        {filter?.description}
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                            >
                                Created
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                                {formatDate(filter?.createdAt || 0)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                            >
                                Last Modified
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                                {formatDate(filter?.updatedAt || 0)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                            >
                                Filter ID
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                                {filter?.filterId.slice(0, 8)}...
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}
                            >
                                Status
                            </Typography>
                            <Typography variant="body2" color="text.primary">
                                {filter?.public ? 'Public' : 'Private'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Paper>
                <Tabs
                    value={activeTab}
                    onChange={(event, newValue) => setActiveTab(newValue)}
                >
                    <Tab label="Filter Rules" />
                    <Tab label="Macros" />
                    <Tab label="Compiled" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <Typography variant="body2" color="text.primary">
                        Filter rules content will be displayed here.
                        <br />
                        This would show the actual filter rules in a readable
                        format.
                    </Typography>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Typography variant="body2" color="text.primary">
                        Macro definitions will be displayed here.
                        <br />
                        This would show any custom macros used in the filter.
                    </Typography>
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <Typography variant="body2" color="text.primary">
                        Compiled filter content will be displayed here.
                        <br />
                        This would show the precompiled filter format.
                    </Typography>
                </TabPanel>
            </Paper>
        </Box>
    )
}
