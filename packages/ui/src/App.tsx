import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Typography,
} from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import { OAuthRedirectLandingPage, useAuthActions, useAuthState } from './auth'
import { FilterViewer } from './components/FilterViewer'
import { MyFilters } from './components/MyFilters'
import { Navbar } from './components/Navbar'
import { PublicFilters } from './components/PublicFilters'
import { Sidebar } from './components/Sidebar'

function App() {
    const { isAuthenticated } = useAuthState()

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
                        <Route path="/my-filters" element={<MyFilters />} />
                        <Route
                            path="/filters/:filterId"
                            element={<FilterViewer />}
                        />

                        <Route
                            path="/public-filters"
                            element={<PublicFilters />}
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
