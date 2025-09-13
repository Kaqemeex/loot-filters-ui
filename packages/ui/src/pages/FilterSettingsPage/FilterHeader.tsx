import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import React from 'react'

interface FilterHeaderProps {
    filterName: string
    onBackClick: () => void
}

export const FilterHeader: React.FC<FilterHeaderProps> = React.memo(
    ({ filterName, onBackClick }) => {
        return (
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBackClick}
                    sx={{ mb: 2 }}
                >
                    Back to Filter
                </Button>
                <Typography variant="h4" component="h1">
                    Filter: {filterName}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1, mb: 2 }}
                >
                    Configure sections, groups, and macro bindings for your
                    filter
                </Typography>
            </Box>
        )
    }
)
