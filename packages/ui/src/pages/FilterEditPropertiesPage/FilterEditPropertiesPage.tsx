import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import { FilterHeader } from '../../components/FilterHeader'
import { useFilterFromRouteStore } from '../../stores/filter-store'
import { FilterPropertiesEditor } from './FilterPropertiesEditor'

export const FilterEditPropertiesPage: React.FC = () => {
    const { filterId } = useParams<{ filterId: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const { isLoadingFilter, isLoadingFilterVersions, filter, versions } =
        useFilterFromRouteStore()

    if (!isAuthenticated) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Edit Filter Properties
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    You must be logged in to edit filter properties. Please log
                    in to continue.
                </Alert>
            </Box>
        )
    }
    if (isLoadingFilter || isLoadingFilterVersions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!filter) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Edit Filter Properties
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    Filter not found
                </Alert>
            </Box>
        )
    }

    return (
        <Box>
            <FilterHeader
                onBackClick={() => navigate(`/filters/${filterId}/settings`)}
                backButtonText="Back to Settings"
                subtitle="Edit filter name, description, visibility, and current version"
            />

            <FilterPropertiesEditor />
        </Box>
    )
}
