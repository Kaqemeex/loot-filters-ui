import { Alert, Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { OAuthRedirectLandingPage, useAuthActions, useAuthState } from './auth'
import { FilterList } from './components/FilterList'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { CreateFilterPage } from './pages/CreateFilterPage/CreateFilterPage'
import { FilterEditPropertiesPage } from './pages/FilterEditPropertiesPage/FilterEditPropertiesPage'
import { FilterSettingsPage } from './pages/FilterSettingsPage/FilterSettingsPage'
import { FilterViewerPage } from './pages/FilterViewerPage/FilterViewerPage'
import { PublicFiltersPage } from './pages/PublicFiltersPage/PublicFiltersPage'
import { useListMyFilters } from './utils/api'

function App() {
    const { isAuthenticated } = useAuthState()
    const { checkAuth } = useAuthActions()

    // Check authentication status on app load and periodically
    useEffect(() => {
        checkAuth()

        // Check auth every 5 minutes to catch expired sessions
        const interval = setInterval(
            () => {
                checkAuth()
            },
            5 * 60 * 1000
        ) // 5 minutes

        return () => clearInterval(interval)
    }, [checkAuth])

    return (
        <Box
            sx={{
                display: 'flex',
                backgroundColor: 'background.default',
                minHeight: '100vh',
            }}
        >
            <Sidebar />
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Navbar />
                </Box>
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/create-filter"
                            element={<CreateFilterPage />}
                        />
                        <Route
                            path="/filters/:filterId"
                            element={<FilterViewerPage />}
                        />
                        <Route
                            path="/filters/:filterId/settings"
                            element={<FilterSettingsPage />}
                        />
                        <Route
                            path="/filters/:filterId/settings/edit-properties"
                            element={<FilterEditPropertiesPage />}
                        />
                        <Route
                            path="/public-filters"
                            element={<PublicFiltersPage />}
                        />
                        <Route
                            path="/login/redirect"
                            element={<OAuthRedirectLandingPage />}
                        />
                    </Routes>
                </Box>
            </Box>
        </Box>
    )
}

function Home() {
    const { username, isAuthenticated } = useAuthState()
    const { logout } = useAuthActions()

    const {
        data: filters,
        apiCall: fetchMyFilters,
        isLoading: loading,
    } = useListMyFilters()

    const [error, setError] = useState<string | null>(null)

    // Fetch filters if authenticated and not already loaded
    useEffect(() => {
        if (isAuthenticated && !loading && !filters) {
            fetchMyFilters(undefined).catch((err) => {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch your filters'
                )
            })
        }
    }, [isAuthenticated, loading, filters, fetchMyFilters])

    if (!isAuthenticated) {
        return (
            <Box>
                <Alert severity="info" sx={{ maxWidth: 400 }}>
                    Please log in to continue.
                </Alert>
            </Box>
        )
    }

    return (
        <FilterList
            filters={filters || undefined}
            loading={loading}
            error={error}
            title={`Welcome back, ${username}!`}
            subtitle="Your personal loot filters"
            showCreateButton={true}
            emptyStateTitle="No filters yet"
            emptyStateDescription="Create your first loot filter to get started"
            emptyStateActionText="Create Your First Filter"
            onEmptyStateAction={() => (window.location.href = '/create-filter')}
            gridColumns={{ xs: 1, md: 2 }}
        />
    )
}

export default App
