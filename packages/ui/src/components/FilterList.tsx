import {
    Add as AddIcon,
    Download as DownloadIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Favorite as FavoriteIcon,
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
import { useNavigate } from 'react-router-dom'

export interface Filter {
    filterId: string
    name: string
    description: string
    public: boolean
    currentVersionId: string
    ownerDiscordId: string
    createdAt: number
    updatedAt: number
}

export interface FilterListProps {
    filters: Filter[] | null | undefined
    loading: boolean
    error: string | null
    title: string
    subtitle?: string
    showCreateButton?: boolean
    showFavorites?: boolean
    showDownload?: boolean
    emptyStateTitle?: string
    emptyStateDescription?: string
    emptyStateActionText?: string
    onEmptyStateAction?: () => void
    onToggleFavorite?: (filterId: string) => void
    favorites?: Set<string>
    gridColumns?: {
        xs?: number | string
        md?: number | string
        lg?: number | string
    }
}

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export const FilterList: React.FC<FilterListProps> = ({
    filters,
    loading,
    error,
    title,
    subtitle,
    showCreateButton = false,
    showFavorites = false,
    showDownload = false,
    emptyStateTitle = 'No filters available',
    emptyStateDescription = 'Check back later for filters',
    emptyStateActionText,
    onEmptyStateAction,
    onToggleFavorite,
    favorites = new Set(),
    gridColumns = { xs: 1, md: 2, lg: 3 },
}) => {
    const navigate = useNavigate()

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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ mb: subtitle ? 1 : 0 }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {showCreateButton && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/create-filter')}
                    >
                        Create Filter
                    </Button>
                )}
            </Box>

            {!filters || filters.length === 0 ? (
                <Card sx={{ maxWidth: 600, mx: 'auto' }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                        >
                            {emptyStateTitle}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            {emptyStateDescription}
                        </Typography>
                        {emptyStateActionText && onEmptyStateAction && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={onEmptyStateAction}
                            >
                                {emptyStateActionText}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs:
                                gridColumns.xs === 1
                                    ? '1fr'
                                    : `repeat(${gridColumns.xs}, 1fr)`,
                            md:
                                gridColumns.md === 2
                                    ? 'repeat(2, 1fr)'
                                    : `repeat(${gridColumns.md}, 1fr)`,
                            lg:
                                gridColumns.lg === 3
                                    ? 'repeat(3, 1fr)'
                                    : `repeat(${gridColumns.lg}, 1fr)`,
                        },
                        gap: 3,
                    }}
                >
                    {filters.map((filter) => (
                        <Card
                            key={filter.filterId}
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
                                            filter.public ? 'Public' : 'Private'
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
                                        mb:
                                            showFavorites || showDownload
                                                ? 3
                                                : 0,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Version{' '}
                                        {filter.currentVersionId.slice(0, 8)}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {showFavorites ? 'Updated' : 'Modified'}{' '}
                                        {formatDate(filter.updatedAt)}
                                    </Typography>
                                </Box>

                                {(showFavorites || showDownload) && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Filter">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(
                                                        `/filters/${filter.filterId}`
                                                    )
                                                }}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {showFavorites && onToggleFavorite && (
                                            <Tooltip title="Toggle Favorite">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onToggleFavorite(
                                                            filter.filterId
                                                        )
                                                    }}
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
                                        )}

                                        {showDownload && (
                                            <Tooltip title="Download Filter">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                    }}
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    )
}
