import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { FilterSelector } from '../components/FilterSelector'
import { CustomizeTab } from '../components/tabs/CustomizeTab'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useFilterStore } from '../store/filterStore'

export const CustomizeFilterPageBody: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0)

    const activeFilter = useFilterStore((state) =>
        Object.values(state.filters).find((filter) => filter.active)
    )

    const config = useFilterConfigStore((state) => {
        if (!activeFilter) return null
        return state.filterConfigurations[activeFilter.id] ?? null
    })

    const setFilterConfiguration = useFilterConfigStore(
        (state) => state.setFilterConfiguration
    )
    const clearConfiguration = useFilterConfigStore(
        (state) => state.clearConfiguration
    )
    const setEnabledModule = useFilterConfigStore(
        (state) => state.setEnabledModule
    )

    if (!activeFilter) {
        return <Box />
    }

    return (
        <Box>
            <Box sx={{ mt: 2 }}>
                <CustomizeTab
                    readonly={false}
                    extraComponent={
                        <Typography variant="h6" color="secondary">
                            {!activeFilter?.description
                                ? 'No description'
                                : activeFilter?.description}
                            {activeFilter?.updatedOn
                                ? ` (updated: ${new Date(activeFilter?.updatedOn).toLocaleDateString()})`
                                : null}
                            {!activeFilter ? 'Select a Filter' : null}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                            >
                                {activeFilter?.importedOn
                                    ? `Imported on ${new Date(activeFilter?.importedOn).toLocaleDateString()}`
                                    : null}
                            </Typography>
                        </Typography>
                    }
                    filter={activeFilter}
                    config={config}
                    onChange={(config) => {
                        setFilterConfiguration(activeFilter?.id, config)
                    }}
                    clearConfiguration={(filterId, macroNames) => {
                        clearConfiguration(filterId, macroNames)
                    }}
                    setEnabledModule={setEnabledModule}
                />
            </Box>
        </Box>
    )
}
