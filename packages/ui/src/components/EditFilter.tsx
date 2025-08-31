import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    IconButton,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useAuthState } from '../auth/useAuth'
import { updateFilter } from '../utils/api'

interface EditFilterDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
    filter: {
        filterId: string
        name: string
        description: string
        public: boolean
    }
}

interface EditFilterForm {
    name: string
    description: string
    public: boolean
}

export const EditFilter: React.FC<EditFilterDialogProps> = ({
    open,
    onClose,
    onSuccess,
    filter,
}) => {
    const { isAuthenticated } = useAuthState()
    const [form, setForm] = useState<EditFilterForm>({
        name: filter.name,
        description: filter.description,
        public: filter.public,
    })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<EditFilterForm>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<EditFilterForm> = {}

        if (!form.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!form.description.trim()) {
            newErrors.description = 'Description is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (
        field: keyof EditFilterForm,
        value: string | boolean
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        setSaving(true)
        try {
            // Only send fields that have changed
            const updates: {
                name?: string
                description?: string
                public?: boolean
            } = {}

            if (form.name !== filter.name) {
                updates.name = form.name
            }
            if (form.description !== filter.description) {
                updates.description = form.description
            }
            if (form.public !== filter.public) {
                updates.public = form.public
            }

            // If no changes, just close
            if (Object.keys(updates).length === 0) {
                onClose()
                return
            }

            await updateFilter(filter.filterId, updates)

            // Reset form and close dialog
            setErrors({})
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Failed to update filter:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        // Reset form to original values when closing
        setForm({
            name: filter.name,
            description: filter.description,
            public: filter.public,
        })
        setErrors({})
        onClose()
    }

    // Show authentication error if not logged in
    if (!isAuthenticated) {
        return (
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ color: 'primary.dark' }}>
                    Edit Filter
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        You must be logged in to edit filters.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h6">Edit Filter</Typography>
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{ mb: 3 }}
                            >
                                Filter Details
                            </Typography>

                            <TextField
                                fullWidth
                                label="Filter Name"
                                value={form.name}
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                                error={!!errors.name}
                                helperText={
                                    errors.name ||
                                    'Give your filter a descriptive name'
                                }
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        'description',
                                        e.target.value
                                    )
                                }
                                error={!!errors.description}
                                helperText={
                                    errors.description ||
                                    'Describe what this filter does'
                                }
                            />

                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={form.public}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'public',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="Make this filter public"
                                />
                                <FormHelperText>
                                    Public filters can be viewed and used by
                                    other players
                                </FormHelperText>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
