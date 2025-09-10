import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { OAuthRedirectLandingPage, useAuthActions, useAuthState } from './auth'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { CreateFilterPage } from './pages/CreateFilterPage/CreateFilterPage'
import { FilterSettingsPage } from './pages/FilterSettingsPage/FilterSettingsPage'
import { FilterViewerPage } from './pages/FilterViewerPage/FilterViewerPage'
import { MyFiltersPage } from './pages/MyFiltersPage/MyFiltersPage'
import { PublicFiltersPage } from './pages/PublicFiltersPage/PublicFiltersPage'

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
                        <Route path="/my-filters" element={<MyFiltersPage />} />
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

    return (
        <Box>
            {isAuthenticated ? (
                <Card sx={{ maxWidth: 400 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" component="h3" gutterBottom>
                            Welcome back, {username}!
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                            You are successfully logged in.
                        </Typography>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="info" sx={{ maxWidth: 400 }}>
                    Please log in to continue.
                </Alert>
            )}
        </Box>
    )
}

export default App
