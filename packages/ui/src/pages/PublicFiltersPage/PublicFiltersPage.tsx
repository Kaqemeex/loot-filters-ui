import {
    Download as DownloadIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListPublicFilters } from '../../utils/api'

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export const PublicFiltersPage: React.FC = () => {
    const navigate = useNavigate()

    const {
        data: filters,
        apiCall: fetchPublicFilters,
        isLoading: loading,
    } = useListPublicFilters()

    const [error, setError] = useState<string | null>(null)
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    const fetchData = useCallback(async () => {
        try {
            setError(null)
            await fetchPublicFilters(undefined)
        } catch (err) {
            console.error('Failed to fetch public filters:', err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch public filters'
            )
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleToggleFavorite = (filterId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(filterId)) {
                newFavorites.delete(filterId)
            } else {
                newFavorites.add(filterId)
            }
            return newFavorites
        })
        // TODO: Implement actual favorite functionality with API
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 3 }}>
                {error}
            </Alert>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
                    Public Filters
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Discover and download filters created by the community
                </Typography>
            </Box>

            {!filters || filters.length === 0 ? (
                <Card sx={{ maxWidth: 600, mx: 'auto' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                        >
                            No public filters available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check back later for community-created filters
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                        },
                        gap: 3,
                    }}
                >
                    {Array.isArray(filters) &&
                        filters.map((filter) => (
                            <Card key={filter.filterId}>
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
                                            label="Public"
                                            size="small"
                                            color="success"
                                        />
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
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
                                            Updated{' '}
                                            {formatDate(filter.updatedAt)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Filter">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    navigate(
                                                        `/filters/${filter.filterId}`
                                                    )
                                                }
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Toggle Favorite">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleToggleFavorite(
                                                        filter.filterId
                                                    )
                                                }
                                            >
                                                {favorites.has(
                                                    filter.filterId
                                                ) ? (
                                                    <FavoriteIcon />
                                                ) : (
                                                    <FavoriteBorderIcon />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download Filter">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setError(
                                                        'Download not implemented'
                                                    )
                                                }
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                </Box>
            )}
        </Box>
    )
}
