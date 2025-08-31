import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    FilterList as FilterIcon,
    Home as HomeIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
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
import { osrsColors } from '../theme/osrsTheme'
import { useSidebarStore } from './sidebarStore'

const DRAWER_WIDTH = 240
const COLLAPSED_DRAWER_WIDTH = 64

const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Loot Filters', icon: <FilterIcon />, path: '/filters' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
]

export const Sidebar: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { isCollapsed, toggleCollapse } = useSidebarStore()

    const handleNavigation = (path: string) => {
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
                    backgroundColor: osrsColors.bodyDark,
                    color: osrsColors.buttonDark,
                    borderRight: `1px solid ${osrsColors.bodyBorder}`,
                    transition: 'width 0.2s ease-in-out',
                    overflowX: 'hidden',
                },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <IconButton
                        onClick={toggleCollapse}
                        size="small"
                        sx={{
                            color: osrsColors.buttonDark,
                            '&:hover': {
                                backgroundColor: osrsColors.bodyMid,
                            },
                        }}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon />
                        ) : (
                            <ChevronLeftIcon />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider sx={{ borderColor: osrsColors.bodyBorder }} />

            <List sx={{ pt: 1 }}>
                {navigationItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                mx: 1,
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    backgroundColor: osrsColors.ecstasy,
                                    color: osrsColors.buttonDark,
                                    '&:hover': {
                                        backgroundColor: osrsColors.korma,
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: osrsColors.bodyMid,
                                },
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
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: 500,
                                    }}
                                />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    )
}
