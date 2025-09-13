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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import { useListMyFilters } from '../../utils/api'

export const MyFiltersPage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated, sessionId, username } = useAuthState()

    const {
        data: filters,
        apiCall: fetchMyFilters,
        isLoading: loading,
    } = useListMyFilters()

    const [error, setError] = useState<string | null>(null)

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
    if (!loading && !filters) {
        fetchMyFilters(undefined)
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
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
                    onClick={() => navigate('/create-filter')}
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
            ) : !filters || filters.length === 0 ? (
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
                            onClick={() => navigate('/create-filter')}
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
                                    navigate(`/filters/${filter.filterId}`)
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
