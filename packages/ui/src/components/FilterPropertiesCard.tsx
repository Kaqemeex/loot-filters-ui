import { Edit as EditIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Typography,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterFromRouteStore } from '../stores/filter-store'

export const FilterPropertiesCard: React.FC = () => {
    const navigate = useNavigate()
    const { filter, isLoadingFilter } = useFilterFromRouteStore()
    if (isLoadingFilter) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!filter) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                    Filter not found
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h6" component="h3">
                    Filter Properties
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() =>
                        navigate(
                            `/filters/${filter.filterId}/settings/edit-properties`
                        )
                    }
                >
                    Edit Properties
                </Button>
            </Box>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant="h6">{filter.name}</Typography>
                            <Chip
                                label={filter.public ? 'Public' : 'Private'}
                                color={filter.public ? 'success' : 'default'}
                                size="small"
                            />
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            {filter.description || 'No description'}
                        </Typography>
                        {filter.currentVersionId && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Current Version:{' '}
                                {filter.currentVersionId.slice(0, 8)}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
