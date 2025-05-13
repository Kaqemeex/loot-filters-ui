import { AppBar, Box, Button, Link, Tab, Tabs, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'

import { FilterSelector } from '../components/FilterSelector'
import { colors } from '../styles/MuiTheme'

const externalLinkStyle = {
    color: colors.rsYellow,
    textDecorationColor: colors.rsYellow,
}

export const AppHeader: React.FC = () => {
    let buildInfo = { gitSha: 'main' }
    try {
        buildInfo = require('../build-info.json')
    } catch {
        console.warn('Could not load build info, using default')
    }

    const location = useLocation()

    return (
        <AppBar
            sx={{
                backgroundColor: colors.rsDarkBrown,
                padding: 1,
            }}
            position="sticky"
        >
            <Box sx={{ display: 'flex' }}>
                <Typography variant="h4" color="primary">
                    FilterScape.xyz
                </Typography>
                <Tabs value={location.pathname}>
                    <Tab
                        label="New filter"
                        value="/new-filter"
                        to="/new-filter"
                        component={RouterLink}
                    />
                    <Tab
                        label="Customize"
                        value="/"
                        to="/"
                        component={RouterLink}
                    />
                    <Tab
                        label="Help"
                        value="/help"
                        to="/help"
                        component={RouterLink}
                    />
                    {buildInfo.gitSha === 'main' && (
                        <Tab
                            label="Debug"
                            value="/debug"
                            to="/debug"
                            component={RouterLink}
                        />
                    )}
                </Tabs>
                <Button color="secondary">
                    <Link
                        sx={externalLinkStyle}
                        target="_blank"
                        href="https://discord.gg/ESbA28wPnt"
                    >
                        Join the Discord
                    </Link>
                </Button>
                <Typography
                    color="primary"
                    variant="body2"
                    sx={{ marginLeft: 'auto' }}
                >
                    A customizer for the{' '}
                    <Link
                        sx={externalLinkStyle}
                        target="_blank"
                        href="https://runelite.net/plugin-hub/show/loot-filters"
                    >
                        Loot Filters plugin
                    </Link>
                </Typography>
                <Typography
                    sx={{ marginLeft: 1 }}
                    variant="body2"
                    color="text.secondary"
                >
                    version: {buildInfo.gitSha.slice(0, 7)}
                </Typography>
            </Box>
            {location.pathname === '/' && (
                <Box paddingTop={1}>
                    <FilterSelector />
                </Box>
            )}
        </AppBar>
    )
}
