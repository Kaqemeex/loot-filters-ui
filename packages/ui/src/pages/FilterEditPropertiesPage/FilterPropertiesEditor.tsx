import { Save as SaveIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFilterFromRouteStore } from '../../stores/filter-store'
import { useUpdateFilter } from '../../utils/api'

export const FilterPropertiesEditor: React.FC = React.memo(() => {
    const navigate = useNavigate()
    const { filter, versions, isLoading } = useFilterFromRouteStore()

    const [name, setName] = useState(filter?.name || '')
    const [description, setDescription] = useState(filter?.description || '')
    const [publicFilter, setPublicFilter] = useState(filter?.public || false)
    const [currentVersionId, setCurrentVersionId] = useState(
        !filter?.currentVersionId ? '@none' : filter.currentVersionId
    )

    const { apiCall: updateFilter, isLoading: isUpdatingFilter } =
        useUpdateFilter()

    if (isUpdatingFilter || isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h6" component="h3">
                    Filter Properties
                </Typography>
            </Box>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Filter Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Current Version</InputLabel>
                                <Select
                                    value={currentVersionId || '@none'}
                                    onChange={(e) =>
                                        setCurrentVersionId(e.target.value)
                                    }
                                    label="Current Version"
                                >
                                    {currentVersionId === '@none' && (
                                        <MenuItem value="@none">
                                            <em>
                                                No current version (Current)
                                            </em>
                                        </MenuItem>
                                    )}
                                    {(versions || []).map((version: any) => (
                                        <MenuItem
                                            key={version.versionId}
                                            value={version.versionId}
                                        >
                                            {version.name ||
                                                `Version ${version.versionId.slice(0, 8)}`}
                                            {version.versionId ===
                                                filter?.currentVersionId &&
                                                ' (Current)'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={publicFilter}
                                    onChange={(e) =>
                                        setPublicFilter(e.target.checked)
                                    }
                                />
                            }
                            label="Public Filter"
                        />

                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() =>
                                    navigate(
                                        `/filters/${filter?.filterId}/settings`
                                    )
                                }
                                disabled={isUpdatingFilter}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={() =>
                                    updateFilter({
                                        filterId: filter?.filterId!,
                                        name,
                                        description,
                                        public: publicFilter,
                                        currentVersionId,
                                    }).then(() => {
                                        navigate(
                                            `/filters/${filter?.filterId}/settings`
                                        )
                                    })
                                }
                                disabled={isUpdatingFilter}
                            >
                                {isUpdatingFilter
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
})
