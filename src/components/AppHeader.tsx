import { ChevronRight } from '@mui/icons-material'
import {
    Box,
    FormControl,
    FormControlLabel,
    FormGroup,
    Link,
    Switch,
    Tab,
    Tabs,
    Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUiStore } from '../store/store'
import { colors } from '../styles/MuiTheme'

export const Header: React.FC<{
    primaryNavTab: 'filters' | 'modules' | 'editModule'
}> = ({ primaryNavTab }) => {
    const { siteConfig, setSiteConfig } = useUiStore()

    const navigate = useNavigate()

    return (
        <Box>
            <Box
                sx={{
                    padding: 1,
                    display: 'flex',
                }}
            >
                <Typography variant="h4" color="primary">
                    Loot Filter Builder
                    <Typography
                        sx={{ paddingLeft: '1em', display: 'inline-block' }}
                        gutterBottom
                    >
                        <span style={{ color: colors.rsYellow }}>
                            A LootFilter builder for{' '}
                            <Link
                                style={{
                                    color: colors.rsYellow,
                                    textDecorationColor: colors.rsYellow,
                                }}
                                target="_blank"
                                href="https://github.com/riktenx/loot-filters"
                            >
                                RuneLite Loot Filters
                            </Link>
                        </span>
                    </Typography>
                </Typography>
                {siteConfig.isLocal ? (
                    <FormControl sx={{ marginLeft: 'auto' }}>
                        <FormGroup>
                            <FormControlLabel
                                sx={{ color: colors.rsYellow }}
                                control={
                                    <Switch checked={siteConfig.devMode} />
                                }
                                onChange={(_, checked: boolean) =>
                                    setSiteConfig({
                                        ...siteConfig,
                                        devMode: checked,
                                    })
                                }
                                label="Dev Mode"
                            />
                        </FormGroup>
                    </FormControl>
                ) : null}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tabs
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    value={primaryNavTab}
                    onChange={(_, value) => {
                        if (value === 'filters') {
                            navigate('/')
                        } else {
                            navigate('/modules')
                        }
                    }}
                >
                    <Tab value="filters" label="Filters" />
                    <Tab value="module" label="Modules" />
                    <Tab
                        value="editModule"
                        style={{
                            display:
                                primaryNavTab === 'editModule'
                                    ? 'block'
                                    : 'none',
                        }}
                        label={
                            <div style={{ display: 'flex' }}>
                                <ChevronRight
                                    sx={{
                                        color: colors.rsDarkOrange,
                                    }}
                                />
                                <div style={{ alignSelf: 'center' }}>
                                    {' '}
                                    Edit Module
                                </div>
                            </div>
                        }
                    />
                </Tabs>
            </Box>
        </Box>
    )
}
