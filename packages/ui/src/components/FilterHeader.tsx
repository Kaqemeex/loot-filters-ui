import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import React from 'react'
import { useFilterFromRouteStore } from '../stores/filter-store'

interface FilterHeaderProps {
    onBackClick: () => void
    backButtonText?: string
    subtitle?: string
}

export const FilterHeader: React.FC<FilterHeaderProps> = React.memo(
    ({
        onBackClick,
        backButtonText = 'Back to Filter',
        subtitle = 'Configure sections, groups, and macro bindings for your filter',
    }) => {
        const { filter, isLoadingFilter } = useFilterFromRouteStore()

        if (isLoadingFilter) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )
        }

        return (
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBackClick}
                    sx={{ mb: 2 }}
                >
                    {backButtonText}
                </Button>
                <Typography variant="h4" component="h1">
                    Filter: {filter?.name}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1, mb: 2 }}
                >
                    {subtitle}
                </Typography>
            </Box>
        )
    }
)
