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
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { osrsColors } from './theme/osrsTheme'

function App() {
    const { sessionId, sessionExpiresAt } = useAuthState()
    const isAuthenticated =
        sessionId && sessionExpiresAt && Date.now() < sessionExpiresAt

    return (
        <Box
            sx={{
                display: 'flex',
                backgroundColor: osrsColors.bodyBackground,
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
    const { username, sessionId, sessionExpiresAt } = useAuthState()
    const { logout } = useAuthActions()
    const isAuthenticated =
        sessionId && sessionExpiresAt && Date.now() < sessionExpiresAt

    return (
        <Box>
            <Typography
                variant="h6"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
            >
                Manage your Path of Exile loot filters with ease.
            </Typography>

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
