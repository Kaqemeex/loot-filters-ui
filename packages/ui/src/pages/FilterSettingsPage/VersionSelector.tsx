import { Add as AddIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material'
import React from 'react'

interface VersionSelectorProps {
    selectedVersionId: string
    filterVersions: any[]
    onVersionChange: (versionId: string) => void
    onCreateVersion: () => void
}

export const VersionSelector: React.FC<VersionSelectorProps> = React.memo(
    ({
        selectedVersionId,
        filterVersions,
        onVersionChange,
        onCreateVersion,
    }) => {
        return (
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" component="h3">
                        Version Configuration
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onCreateVersion}
                    >
                        Create New Version
                    </Button>
                </Box>

                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Version</InputLabel>
                            <Select
                                value={selectedVersionId}
                                onChange={(e) =>
                                    onVersionChange(e.target.value)
                                }
                                label="Select Version"
                            >
                                {filterVersions.map((version: any) => (
                                    <MenuItem
                                        key={version.versionId}
                                        value={version.versionId}
                                    >
                                        Version {version.versionId.slice(0, 8)}
                                        {' - '}
                                        {new Date(
                                            version.createdAt
                                        ).toLocaleDateString()}
                                        {version.versionId ===
                                            selectedVersionId && ' (Current)'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedVersionId && (
                            <Box sx={{ mt: 2 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Configure settings for the selected version.
                                    Changes will be saved to this specific
                                    version.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        )
    }
)
