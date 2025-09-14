import { Alert, Box, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { FilterHeader } from '../../components/FilterHeader'
import { FilterPropertiesCard } from '../../components/FilterPropertiesCard'
import { FilterSettings } from '../../components/FilterSettings'
import { useFilterFromRouteStore } from '../../stores/filter-store'

export const FilterSettingsPage: React.FC = () => {
    const { filter, versions, isLoadingFilter, isLoadingFilterVersions } =
        useFilterFromRouteStore()

    const navigate = useNavigate()

    if (isLoadingFilter || isLoadingFilterVersions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!filter) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Alert severity="error">Filter not found</Alert>
            </Box>
        )
    }

    return (
        <Box>
            <FilterHeader onBackClick={() => navigate('/')} />
            <FilterPropertiesCard />
            <FilterSettings />
        </Box>
    )
}
