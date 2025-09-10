import { FilterEgg, TYPICAL_WHACK_GITHUB_URL } from '@loot-filters/core'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import { FilterVersionCreator } from '../../components/FilterVersionCreator'
import { createFilter } from '../../utils/api'

interface CreateFilterForm {
    name: string
    description: string
    public: boolean
}

const initialFormState: CreateFilterForm = {
    name: '',
    description: '',
    public: false,
}

export const CreateFilterPage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [form, setForm] = useState<CreateFilterForm>(initialFormState)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<CreateFilterForm>>({})
    const [showVersionCreator, setShowVersionCreator] = useState(false)
    const [createdFilterId, setCreatedFilterId] = useState<string | null>(null)

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateFilterForm> = {}

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
        field: keyof CreateFilterForm,
        value: string | boolean
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }))
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
            // Create the filter metadata
            const filterData: FilterEgg = {
                name: form.name,
                description: form.description,
                public: form.public,
            }

            const newFilter = (await createFilter(filterData)) as {
                filterId: string
            }

            setCreatedFilterId(newFilter.filterId)
            setShowVersionCreator(true)
        } catch (error) {
            console.error('Failed to create filter:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleVersionCreated = (versionId: string) => {
        if (createdFilterId) {
            navigate(`/filters/${createdFilterId}`)
        }
    }

    const handleVersionCreatorCancel = () => {
        setShowVersionCreator(false)
        if (createdFilterId) {
            navigate(`/filters/${createdFilterId}`)
        }
    }

    const handleCancel = () => {
        navigate('/my-filters')
    }

    // Show authentication error if not logged in
    if (!isAuthenticated) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Create Filter
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    You must be logged in to create filters. Please log in to
                    continue.
                </Alert>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleCancel}
                    sx={{ mb: 2 }}
                >
                    Back to My Filters
                </Button>
                <Typography variant="h4" component="h1">
                    Create New Filter
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 600 }}>
                <Card
                    sx={{
                        backgroundColor: 'action.hover',
                        border: `1px solid ${'divider'}`,
                        mb: 3,
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{ color: 'primary.dark', mb: 3 }}
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
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                            error={!!errors.description}
                            helperText={
                                errors.description ||
                                'Describe what this filter does'
                            }
                            sx={{ mb: 3 }}
                        />

                        <FormControl fullWidth>
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
                                Public filters can be viewed and used by other
                                players
                            </FormHelperText>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={handleCancel} variant="outlined" fullWidth>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        fullWidth
                    >
                        {saving ? 'Creating...' : 'Create Filter'}
                    </Button>
                </Box>
            </Box>

            {/* Version Creator Dialog */}
            {createdFilterId && (
                <FilterVersionCreator
                    filterId={createdFilterId}
                    onVersionCreated={handleVersionCreated}
                    onCancel={handleVersionCreatorCancel}
                    open={showVersionCreator}
                    initialVersionName="Initial Version"
                    initialContentSource="url"
                    initialUrl={TYPICAL_WHACK_GITHUB_URL}
                    title="Create Initial Version"
                />
            )}
        </Box>
    )
}
