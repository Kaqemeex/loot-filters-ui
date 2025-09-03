import { Filter } from '@loot-filters/core'
import { Add as AddIcon } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import { getMyFilters } from '../../utils/api'

export const MyFiltersPage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [filters, setFilters] = useState<Filter[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const handleCreateFilter = () => {
        navigate('/create-filter')
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
                <Typography variant="h4" component="h1">
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
                        <Typography variant="body2" color="text.secondary">
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
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                    },
                                }}
                                onClick={() =>
                                    handleViewFilter(filter.filterId)
                                }
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
                                        <Typography variant="h6" component="h3">
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
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}
