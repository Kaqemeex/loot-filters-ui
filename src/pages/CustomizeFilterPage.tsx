import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {
    Box,
    Tab,
    Tabs,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { filter } from 'underscore'
import { BackgroundSelector } from '../components/BackgroundSelector'
import { FilterSelector } from '../components/FilterSelector'
import { CustomizeTab } from '../components/tabs/CustomizeTab'
import { RenderedFilterTab } from '../components/tabs/RenderedFilterTab'
import { useUiStore } from '../store/store'

export const FilterTabs: React.FC = () => {
    const { siteConfig } = useUiStore()
    const [activeTab, setActiveTab] = useState(0)

    const importedModularFilters = useUiStore(
        (state) => state.importedModularFilters
    )
    const activeFilter = useMemo(
        () =>
            Object.values(importedModularFilters).find(
                (filter) => filter.active
            ),
        [importedModularFilters]
    )

    const tabs = useMemo(() => {
        return [
            {
                label: 'Customize',
                disabled: !activeFilter,
                dev: false,
                component: activeFilter ? (
                    <CustomizeTab />
                ) : (
                    <Typography variant="h6" color="secondary">
                        No filter selected, select or import a filter
                    </Typography>
                ),
            },
            {
                label: 'Preview',
                disabled: !activeFilter,
                dev: false,
                component: <RenderedFilterTab />,
            },
        ]
    }, [activeFilter])

    const filteredTabs = useMemo(
        () => filter(tabs, (tab) => siteConfig.devMode || tab.dev === false),
        [tabs, siteConfig.devMode]
    )

    return (
        <Box sx={{ mt: 3 }}>
            <Box>
                <FilterSelector />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    mt: 2,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    aria-label="filter tabs"
                    sx={{ flex: 1 }}
                >
                    {filteredTabs.map((tab, index) => (
                        <Tab
                            key={index}
                            label={tab.label}
                            disabled={tab.disabled}
                            sx={{
                                fontSize: '1.2rem',
                            }}
                        />
                    ))}
                </Tabs>
                {activeTab === 0 && activeFilter && (
                    <>
                        <BackgroundSelector />
                        <ToggleButtonGroup size="small" exclusive={false}>
                            <ToggleButton
                                value="expand"
                                onClick={() => {
                                    const event = new CustomEvent('expandAll', {
                                        detail: true,
                                    })
                                    window.dispatchEvent(event)
                                }}
                            >
                                <ExpandMore />
                            </ToggleButton>
                            <ToggleButton
                                value="collapse"
                                onClick={() => {
                                    const event = new CustomEvent('expandAll', {
                                        detail: false,
                                    })
                                    window.dispatchEvent(event)
                                }}
                            >
                                <ExpandLess />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </>
                )}
            </Box>
            <Box sx={{ mt: 2 }}>{filteredTabs[activeTab].component}</Box>
        </Box>
    )
}
