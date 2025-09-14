import {
    bestEffortMacroMapping,
    FilterVersionEgg,
    FilterVersionSettings,
    precompileFilter,
    TYPICAL_WHACK_GITHUB_URL,
} from '@loot-filters/core'
import { Add as AddIcon } from '@mui/icons-material'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useCreateFilterVersion } from '../utils/api'

interface FilterVersionCreatorProps {
    filterId: string
    onVersionCreated: () => void
    onCancel: () => void
    open: boolean
    initialVersionName?: string
    initialContentSource?: 'url' | 'raw'
    initialRawRs2f?: string
    initialUrl?: string
    settings?: FilterVersionSettings
    title?: string
    showAsDialog?: boolean
}

export const FilterVersionCreator: React.FC<FilterVersionCreatorProps> = ({
    filterId,
    onVersionCreated,
    onCancel,
    open,
    initialVersionName = 'Initial Version',
    initialContentSource = 'url',
    initialRawRs2f = '',
    initialUrl = TYPICAL_WHACK_GITHUB_URL,
    settings,
    title = 'Create New Version',
    showAsDialog = true,
}) => {
    const { apiCall: createFilterVersion, isLoading: saving } =
        useCreateFilterVersion()

    const formInitialState = {
        filterId,
        contentSource: initialContentSource,
        name: initialVersionName,
        rawRs2f: initialRawRs2f,
        precompiledRs2f: '',
        parsedMacros: [],
        settings: settings || { sections: [], macroInputMappings: {} },
        url: initialUrl,
    }

    const [formState, setFormState] = useState<
        Partial<FilterVersionEgg> & { contentSource: 'url' | 'raw' }
    >(formInitialState)

    const clearForm = useCallback(() => {
        setFormState(formInitialState)
        setErrors({})
    }, [])

    const [errors, setErrors] = useState<Partial<typeof formInitialState>>({})
    const hasErrors = useMemo(
        () =>
            Object.values(errors)
                .map((error) => !!error)
                .some((error) => error),
        [errors]
    )

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (!formState.name!.trim()) {
            newErrors.name = 'Version name is required'
        }

        if (formState.contentSource === 'raw' && !formState.rawRs2f!.trim()) {
            newErrors.rawRs2f = 'Filter content is required'
        }

        if (formState.contentSource === 'url' && !formState.url!.trim()) {
            newErrors.url = 'URL is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        try {
            let finalRawRs2f = formState.rawRs2f

            // If content source is URL, fetch the content
            if (formState.contentSource === 'url') {
                const response = await fetch(formState.url!)
                finalRawRs2f = await response.text()
            }

            // Precompile the filter
            const precompiledData = precompileFilter(finalRawRs2f!)

            // Create the version data
            const versionData: FilterVersionEgg = {
                filterId,
                name: formState.name!.trim(),
                rawRs2f: finalRawRs2f!,
                precompiledRs2f: precompiledData.precompiledRs2f,
                parsedMacros: precompiledData.parsedMacros,
                settings: {
                    sections: settings?.sections || [],
                    macroInputMappings: {
                        ...bestEffortMacroMapping(precompiledData.parsedMacros),
                        ...settings?.macroInputMappings,
                    },
                },
            }

            createFilterVersion(versionData).then(({ versionId }) => {
                clearForm()
                onVersionCreated()
            })
        } catch (error) {
            console.error('Failed to create version:', error)
            setErrors({
                name: 'Failed to create version. Please try again.',
            })
        }
    }

    const content = (
        <Box>
            <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
                {title}
            </Typography>

            <TextField
                fullWidth
                label="Version Name"
                value={formState.name!}
                onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                }
                error={!!errors.name}
                required
                helperText={errors.name || 'Enter a name for the new version'}
                sx={{ mb: 2 }}
            />

            {/* Content Source Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup
                    value={formState.contentSource}
                    onChange={(e) =>
                        setFormState({
                            ...formState,
                            contentSource: e.target.value as 'url' | 'raw',
                        })
                    }
                    row
                >
                    <FormControlLabel
                        value="raw"
                        control={<Radio />}
                        label="Enter Raw Content"
                    />
                    <FormControlLabel
                        value="url"
                        control={<Radio />}
                        label="Load from URL"
                    />
                </RadioGroup>
            </FormControl>

            {/* URL Input */}
            {formState.contentSource === 'url' && (
                <TextField
                    fullWidth
                    label="Filter URL"
                    value={formState.url!}
                    onChange={(e) =>
                        setFormState({ ...formState, url: e.target.value })
                    }
                    error={!!errors.url}
                    required
                    helperText={
                        errors.url || 'Enter a URL to load filter content from'
                    }
                    sx={{ mb: 2 }}
                />
            )}

            {/* Raw Content Input */}
            {formState.contentSource === 'raw' && (
                <TextField
                    fullWidth
                    label="RS2F Content"
                    multiline
                    rows={12}
                    value={formState.rawRs2f}
                    onChange={(e) =>
                        setFormState({ ...formState, rawRs2f: e.target.value })
                    }
                    error={!!errors.rawRs2f}
                    required
                    helperText={
                        errors.rawRs2f ||
                        'Enter your loot filter content in RS2F format'
                    }
                    sx={{ mb: 2 }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    onClick={() => {
                        clearForm()
                        onCancel()
                    }}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={hasErrors || saving}
                >
                    {saving ? 'Creating...' : 'Create Version'}
                </Button>
            </Box>
        </Box>
    )

    if (showAsDialog) {
        return (
            <Dialog open={open} onClose={clearForm} maxWidth="md" fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{content}</DialogContent>
            </Dialog>
        )
    }

    return content
}
