import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    Share as ShareIcon,
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
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReadFilter } from '../../utils/api'

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
            id={`filter-tabpanel-${index}`}
            aria-labelledby={`filter-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    )
}

export const FilterViewerPage: React.FC = () => {
    const { filterId } = useParams<{ filterId: string }>()
    const navigate = useNavigate()

    const {
        data: filter,
        apiCall: fetchFilter,
        isLoading: loading,
    } = useReadFilter()

    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState(0)

    const fetchData = useCallback(async () => {
        if (!filterId) {
            setError('No filter ID provided')
            return
        }

        try {
            setError(null)
            await fetchFilter({ filterId })
        } catch (err) {
            console.error('Failed to fetch filter:', err)
            setError(
                err instanceof Error ? err.message : 'Failed to fetch filter'
            )
        }
    }, [filterId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue)
    }

    const handleDownload = () => {
        // TODO: Implement filter download functionality
        console.log('Download filter:', filter?.filterId)
    }

    const handleShare = () => {
        // TODO: Implement filter sharing functionality
        console.log('Share filter:', filter?.filterId)
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
        )
    }

    if (error || !filter) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error || 'Filter not found'}
            </Alert>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate('/my-filters')}
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
                        {filter.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                            label={filter.public ? 'Public' : 'Private'}
                            size="small"
                            color={filter.public ? 'success' : 'default'}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                        >
                            Version {filter.currentVersionId.slice(0, 8)}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Settings">
                        <IconButton
                            onClick={() =>
                                navigate(`/filters/${filter.filterId}/settings`)
                            }
                        >
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Filter">
                        <IconButton onClick={handleDownload}>
                            <DownloadIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Filter">
                        <IconButton onClick={handleShare}>
                            <ShareIcon />
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
                        {filter.description}
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
                                {formatDate(filter.createdAt)}
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
                                {formatDate(filter.updatedAt)}
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
                                {filter.filterId.slice(0, 8)}...
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
                                {filter.public ? 'Public' : 'Private'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Paper>
                <Tabs value={activeTab} onChange={handleTabChange}>
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
