import { AccountCircle } from '@mui/icons-material'
import {
    AppBar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { DiscordLoginButton, useAuthActions, useAuthState } from '../auth'
import { osrsColors } from '../theme/osrsTheme'

export const Navbar: React.FC = () => {
    const { username, sessionId, sessionExpiresAt } = useAuthState()
    const { logout } = useAuthActions()
    const isAuthenticated =
        sessionId && sessionExpiresAt && Date.now() < sessionExpiresAt

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        logout()
        handleClose()
    }

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: osrsColors.buttonDark,
                color: osrsColors.bodyMain,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        color: osrsColors.ecstasy,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                >
                    Loot Filters
                </Typography>

                {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="h6"
                            sx={{
                                mr: 2,
                                color: osrsColors.bodyLight,
                                fontWeight: 500,
                            }}
                        >
                            {username}
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            sx={{
                                color: osrsColors.bodyMain,
                                '&:hover': {
                                    backgroundColor: osrsColors.buttonLight,
                                },
                            }}
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            sx={{
                                '& .MuiPaper-root': {
                                    backgroundColor: osrsColors.bodyMain,
                                    border: `1px solid ${osrsColors.bodyBorder}`,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <MenuItem
                                onClick={handleLogout}
                                sx={{
                                    color: osrsColors.buttonDark,
                                    '&:hover': {
                                        backgroundColor: osrsColors.bodyLight,
                                    },
                                }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <DiscordLoginButton />
                )}
            </Toolbar>
        </AppBar>
    )
}
