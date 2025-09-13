import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

interface FilterPropertiesEditorProps {
    name: string
    description: string
    public: boolean
    currentVersionId: string
    filterVersions: any[]
    onSave: (data: {
        name: string
        description: string
        public: boolean
        currentVersionId: string
    }) => void
    isSaving: boolean
}

export const FilterPropertiesEditor: React.FC<FilterPropertiesEditorProps> =
    React.memo(
        ({
            name: initialName,
            description: initialDescription,
            public: initialPublic,
            currentVersionId: initialCurrentVersionId,
            filterVersions,
            onSave,
            isSaving,
        }) => {
            // Internal form state
            const [editing, setEditing] = useState(false)
            const [name, setName] = useState(initialName)
            const [description, setDescription] = useState(initialDescription)
            const [publicFilter, setPublicFilter] = useState(initialPublic)
            const [currentVersionId, setCurrentVersionId] = useState(
                initialCurrentVersionId
            )

            // Update internal state when props change
            useEffect(() => {
                setName(initialName)
                setDescription(initialDescription)
                setPublicFilter(initialPublic)
                setCurrentVersionId(initialCurrentVersionId)
            }, [
                initialName,
                initialDescription,
                initialPublic,
                initialCurrentVersionId,
            ])

            const handleStartEdit = () => {
                setEditing(true)
            }

            const handleCancel = () => {
                setEditing(false)
                // Reset to original values
                setName(initialName)
                setDescription(initialDescription)
                setPublicFilter(initialPublic)
                setCurrentVersionId(initialCurrentVersionId)
            }

            const handleSave = () => {
                onSave({
                    name,
                    description,
                    public: publicFilter,
                    currentVersionId,
                })
                setEditing(false)
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
                        {!editing && (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleStartEdit}
                            >
                                Edit Properties
                            </Button>
                        )}
                    </Box>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            {editing ? (
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
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                sm: '1fr 1fr',
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Filter Name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>
                                                Current Version
                                            </InputLabel>
                                            <Select
                                                value={currentVersionId}
                                                onChange={(e) =>
                                                    setCurrentVersionId(
                                                        e.target.value
                                                    )
                                                }
                                                label="Current Version"
                                            >
                                                <MenuItem value="">
                                                    <em>No current version</em>
                                                </MenuItem>
                                                {filterVersions.map(
                                                    (version: any) => (
                                                        <MenuItem
                                                            key={
                                                                version.versionId
                                                            }
                                                            value={
                                                                version.versionId
                                                            }
                                                        >
                                                            Version{' '}
                                                            {version.versionId.slice(
                                                                0,
                                                                8
                                                            )}
                                                            {' - '}
                                                            {new Date(
                                                                version.createdAt
                                                            ).toLocaleDateString()}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        label="Description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={publicFilter}
                                                onChange={(e) =>
                                                    setPublicFilter(
                                                        e.target.checked
                                                    )
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
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="h6">
                                            {name}
                                        </Typography>
                                        <Chip
                                            label={
                                                publicFilter
                                                    ? 'Public'
                                                    : 'Private'
                                            }
                                            color={
                                                publicFilter
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        {description || 'No description'}
                                    </Typography>
                                    {currentVersionId && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Current Version:{' '}
                                            {currentVersionId.slice(0, 8)}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )
        }
    )
