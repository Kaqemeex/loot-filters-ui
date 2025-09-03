import { FilterEgg } from '@loot-filters/core'
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'
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
import { createFilter, createFilterVersion } from '../../utils/api'
import { EXAMPLE_FILTER, precompileFilter } from '../../utils/parser'

interface CreateFilterForm {
    name: string
    description: string
    public: boolean
    rawRs2f: string
}

const initialFormState: CreateFilterForm = {
    name: '',
    description: '',
    public: false,
    rawRs2f: EXAMPLE_FILTER,
}

export const CreateFilterPage: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [form, setForm] = useState<CreateFilterForm>(initialFormState)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<CreateFilterForm>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateFilterForm> = {}

        if (!form.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!form.description.trim()) {
            newErrors.description = 'Description is required'
        }

        if (!form.rawRs2f.trim()) {
            newErrors.rawRs2f = 'Filter content is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (
        field: keyof CreateFilterForm,
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
            // Use the parser helper to precompile the filter
            const precompiledData = precompileFilter(form.rawRs2f)

            // Create the filter metadata
            const filterData: FilterEgg = {
                name: form.name,
                description: form.description,
                public: form.public,
            }

            // Create the filter first
            const newFilter = (await createFilter(filterData)) as {
                filterId: string
            }
            console.log('newFilter', newFilter)

            // Then create the filter version with the precompiled data
            await createFilterVersion(newFilter.filterId, {
                filterId: newFilter.filterId,
                ...precompiledData,
            })

            // Navigate to the new filter
            navigate(`/filters/${newFilter.filterId}`)
        } catch (error) {
            console.error('Failed to create filter:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        navigate('/my-filters')
    }

    const handleResetToExample = () => {
        setForm((prev) => ({ ...prev, rawRs2f: EXAMPLE_FILTER }))
        if (errors.rawRs2f) {
            setErrors((prev) => ({ ...prev, rawRs2f: undefined }))
        }
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

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                    gap: 4,
                }}
            >
                {/* Filter Content Section */}
                <Box>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <Typography variant="h6" component="h3">
                                    Filter Content (RS2F)
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleResetToExample}
                                >
                                    Reset to Example
                                </Button>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={25}
                                value={form.rawRs2f}
                                onChange={(e) =>
                                    handleInputChange('rawRs2f', e.target.value)
                                }
                                error={!!errors.rawRs2f}
                                helperText={
                                    errors.rawRs2f ||
                                    'Enter your loot filter content in RS2F format'
                                }
                            />
                        </CardContent>
                    </Card>
                </Box>

                {/* Filter Details Section */}
                <Box>
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
                                    Public filters can be viewed and used by
                                    other players
                                </FormHelperText>
                            </FormControl>
                        </CardContent>
                    </Card>

                    {/* Parser Info Card */}
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{ mb: 2 }}
                            >
                                Parser Information
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your filter will be automatically parsed and
                                optimized using the RS2F parser.
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                            >
                                Macros will be extracted and the filter will be
                                precompiled for better performance.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            onClick={handleCancel}
                            variant="outlined"
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            fullWidth
                        >
                            {saving ? 'Creating...' : 'Create Filter'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
