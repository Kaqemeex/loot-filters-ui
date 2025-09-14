import { FilterVersion } from '@loot-filters/core'
import { Box, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterFromRouteStore } from '../stores/filter-store'
import { FilterVersionCreator } from './FilterVersionCreator'

interface FilterVersionSelectProps {
    selectedVersionId: string
    versions: FilterVersion[]
    onVersionChange: (versionId: string) => void
    allowCreateVersion: boolean
}

const FilterVersionSelect: React.FC<FilterVersionSelectProps> = ({
    selectedVersionId,
    versions,
    onVersionChange,
    allowCreateVersion,
}) => {
    const navigate = useNavigate()
    const [showVersionCreator, setShowVersionCreator] = useState(false)
    const { filter, forceLoadData } = useFilterFromRouteStore()
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Select Version:
                </Typography>
                <select
                    value={selectedVersionId}
                    onChange={(e) => onVersionChange(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minWidth: '200px',
                    }}
                >
                    {versions.map((version) => (
                        <option
                            key={version.versionId}
                            value={version.versionId}
                        >
                            {version.name ||
                                `Version ${version.versionId.slice(0, 8)}`}
                            {version.versionId === filter?.currentVersionId &&
                                ' (Current)'}
                        </option>
                    ))}
                </select>
                {allowCreateVersion && (
                    <Button
                        variant="contained"
                        onClick={() => setShowVersionCreator(true)}
                    >
                        Create New Version
                    </Button>
                )}
            </Box>
            {versions && (
                <FilterVersionCreator
                    filterId={versions[0].filterId}
                    onVersionCreated={() => {
                        forceLoadData().then(() => {
                            navigate(
                                `/filters/${versions[0].filterId}/settings`
                            )
                            setShowVersionCreator(false)
                        })
                    }}
                    onCancel={() => {
                        setShowVersionCreator(false)
                    }}
                    open={showVersionCreator}
                />
            )}
        </>
    )
}

export default FilterVersionSelect
