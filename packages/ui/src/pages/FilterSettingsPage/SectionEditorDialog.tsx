import { Group, Section } from '@loot-filters/core'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    TextField,
    Typography,
} from '@mui/material'
import React from 'react'

interface SectionEditorDialogProps {
    open: boolean
    section: Section | null
    editingType: 'section' | 'group'
    onClose: () => void
    onSave: (section: Section) => void
    onDelete: () => void
    isEditing: boolean
}

export const SectionEditorDialog: React.FC<SectionEditorDialogProps> = ({
    open,
    section,
    editingType,
    onClose,
    onSave,
    onDelete,
    isEditing,
}) => {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        groups: [] as Group[],
    })

    React.useEffect(() => {
        if (section) {
            setFormData({
                name: section.name || '',
                description: section.description || '',
                groups: section.groups || [],
            })
        } else {
            setFormData({
                name: '',
                description: '',
                groups: [],
            })
        }
    }, [section, open])

    const handleSave = () => {
        const newSection: Section = {
            name: formData.name,
            description: formData.description,
            groups: formData.groups,
        }
        onSave(newSection)
    }

    const addGroup = () => {
        const newGroup: Group = {
            name: `Group ${formData.groups.length + 1}`,
            description: '',
            inputs: [],
        }
        setFormData((prev) => ({
            ...prev,
            groups: [...prev.groups, newGroup],
        }))
    }

    const updateGroup = (index: number, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            groups: prev.groups.map((group, i) =>
                i === index ? { ...group, [field]: value } : group
            ),
        }))
    }

    const deleteGroup = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            groups: prev.groups.filter((_, i) => i !== index),
        }))
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {isEditing ? 'Edit' : 'Create'}{' '}
                {editingType === 'section' ? 'Section' : 'Group'}
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        mt: 2,
                    }}
                >
                    <TextField
                        fullWidth
                        label={`${editingType === 'section' ? 'Section' : 'Group'} Name`}
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                    />

                    {editingType === 'section' && (
                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h6">Groups</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addGroup}
                                    size="small"
                                >
                                    Add Group
                                </Button>
                            </Box>

                            {formData.groups.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: 'center', py: 4 }}
                                >
                                    No groups added yet. Click "Add Group" to
                                    create your first group.
                                </Typography>
                            ) : (
                                <List>
                                    {formData.groups.map((group, index) => (
                                        <ListItem
                                            key={index}
                                            sx={{
                                                flexDirection: 'column',
                                                alignItems: 'stretch',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography variant="subtitle2">
                                                    Group {index + 1}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        deleteGroup(index)
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    mb: 1,
                                                }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Group Name"
                                                    value={group.name}
                                                    onChange={(e) =>
                                                        updateGroup(
                                                            index,
                                                            'name',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Description"
                                                    value={group.description}
                                                    onChange={(e) =>
                                                        updateGroup(
                                                            index,
                                                            'description',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                {isEditing && (
                    <Button color="error" onClick={onDelete}>
                        Delete
                    </Button>
                )}
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                >
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
