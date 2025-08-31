import { Filter } from '@loot-filters/core'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../auth/useAuth'
import { deleteFilter, getMyFilters } from '../utils/api'
import { CreateFilter } from './CreateFilter'

export const MyFilters: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [filters, setFilters] = useState<Filter[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const handleCreateFilter = () => {
        setCreateDialogOpen(true)
    }

    const handleCreateDialogClose = () => {
        setCreateDialogOpen(false)
    }

    const handleCreateSuccess = () => {
        // Refresh the filters list
        if (isAuthenticated) {
            const fetchFilters = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const data = (await getMyFilters()) as Filter[]
                    setFilters(data)
                } catch (err) {
                    console.error('Failed to fetch filters:', err)
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to fetch filters'
                    )
                } finally {
                    setLoading(false)
                }
            }
            fetchFilters()
        }
    }

    const handleEditFilter = (filterId: string) => {
        // TODO: Implement edit filter functionality
        console.log('Edit filter clicked:', filterId)
    }

    const handleDeleteFilter = (filterId: string) => {
        deleteFilter(filterId).then(() => {
            setFilters((prev) => prev.filter((f) => f.filterId !== filterId))
        })
    }

    const handleViewFilter = (filterId: string) => {
        navigate(`/filters/${filterId}`)
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false)
            return
        }

        const fetchFilters = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = (await getMyFilters()) as Filter[]
                setFilters(data)
            } catch (err) {
                console.error('Failed to fetch filters:', err)
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch filters'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchFilters()
    }, [isAuthenticated])

    // Show authentication error if not logged in
    if (!isAuthenticated) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    My Filters
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    You must be logged in to view your filters. Please log in to
                    continue.
                </Alert>
            </Box>
        )
    }

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                >
                    My Filters
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateFilter}
                >
                    Create Filter
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : filters.length === 0 ? (
                <Card sx={{ maxWidth: 600, mx: 'auto' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                        >
                            No filters yet
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Create your first loot filter to get started
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateFilter}
                        >
                            Create Your First Filter
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, 1fr)',
                        },
                        gap: 3,
                    }}
                >
                    {filters.map((filter) => (
                        <Box key={filter.filterId}>
                            <Card
                                sx={{
                                    height: '100%',
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                       
                                        >
                                            {filter.name}
                                        </Typography>
                                        <Chip
                                            label={
                                                filter.public
                                                    ? 'Public'
                                                    : 'Private'
                                            }
                                            size="small"
                                            color={
                                                filter.public
                                                    ? 'success'
                                                    : 'default'
                                            }
                                        />
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        {filter.description}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Version{' '}
                                            {filter.currentVersionId.slice(
                                                0,
                                                8
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Modified{' '}
                                            {new Date(
                                                filter.updatedAt
                                            ).toLocaleDateString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Filter">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleViewFilter(
                                                        filter.filterId
                                                    )
                                                }
                                                
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Filter">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleEditFilter(
                                                        filter.filterId
                                                    )
                                                }
                                                
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Filter">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleDeleteFilter(
                                                        filter.filterId
                                                    )
                                                }
                                                
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}

            <CreateFilter
                open={createDialogOpen}
                onClose={handleCreateDialogClose}
                onSuccess={handleCreateSuccess}
            />
        </Box>
    )
}
