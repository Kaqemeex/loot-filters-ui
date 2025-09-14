import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    FilterList as FilterIcon,
    Home as HomeIcon,
} from '@mui/icons-material'
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthState } from '../auth/useAuth'
import { useSidebarStore } from '../stores/sidebarStore'

const DRAWER_WIDTH = 240
const COLLAPSED_DRAWER_WIDTH = 64

const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'My Filters', icon: <FilterIcon />, path: '/my-filters' },
    { text: 'Public Filters', icon: <FilterIcon />, path: '/public-filters' },
]

export const Sidebar: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isCollapsed, toggleCollapse } = useSidebarStore()
    const { isAuthenticated } = useAuthState()

    const handleNavigation = (path: string) => {
        // Don't allow navigation to authenticated-only pages if not authenticated
        if (path === '/my-filters' && !isAuthenticated) {
            return
        }
        navigate(path)
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                flexShrink: 0,
                transition: 'width 0.2s ease-in-out',
                '& .MuiDrawer-paper': {
                    width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    transition: 'width 0.2s ease-in-out',
                    overflowX: 'hidden',
                },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <IconButton onClick={toggleCollapse} size="small">
                        {isCollapsed ? (
                            <ChevronRightIcon />
                        ) : (
                            <ChevronLeftIcon />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            <List sx={{ pt: 1 }}>
                {navigationItems.map((item) => {
                    const isAuthenticatedOnly = item.path === '/my-filters'
                    const isDisabled = isAuthenticatedOnly && !isAuthenticated

                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                selected={location.pathname === item.path}
                                disabled={isDisabled}
                                sx={{
                                    mx: 1,
                                    borderRadius: 1,
                                    opacity: isDisabled ? 0.5 : 1,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: 'inherit',
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText primary={item.text} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Drawer>
    )
}
