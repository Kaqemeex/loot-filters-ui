import {
    bestEffortMacroMapping,
    FilterVersionEgg,
    FilterVersionSettings,
    precompileFilter,
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
import { useState } from 'react'
import { createFilterVersion } from '../utils/api'

interface FilterVersionCreatorProps {
    filterId: string
    onVersionCreated: (versionId: string) => void
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
    initialVersionName = '',
    initialContentSource = 'url',
    initialRawRs2f = '',
    initialUrl = '',
    settings,
    title = 'Create New Version',
    showAsDialog = true,
}) => {
    const [versionName, setVersionName] = useState(initialVersionName)
    const [contentSource, setContentSource] = useState<'url' | 'raw'>(
        initialContentSource
    )
    const [rawRs2f, setRawRs2f] = useState(initialRawRs2f)
    const [url, setUrl] = useState(initialUrl)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<{
        versionName?: string
        rawRs2f?: string
        url?: string
    }>({})

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (!versionName.trim()) {
            newErrors.versionName = 'Version name is required'
        }

        if (contentSource === 'raw' && !rawRs2f.trim()) {
            newErrors.rawRs2f = 'Filter content is required'
        }

        if (contentSource === 'url' && !url.trim()) {
            newErrors.url = 'URL is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        setSaving(true)
        try {
            let finalRawRs2f = rawRs2f

            // If content source is URL, fetch the content
            if (contentSource === 'url') {
                const response = await fetch(url)
                finalRawRs2f = await response.text()
            }

            // Precompile the filter
            const precompiledData = precompileFilter(finalRawRs2f)

            // Create the version data
            const versionData: FilterVersionEgg = {
                filterId,
                name: versionName.trim(),
                rawRs2f: finalRawRs2f,
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

            const newVersion = await createFilterVersion(filterId, versionData)

            if (
                newVersion &&
                typeof newVersion === 'object' &&
                'versionId' in newVersion
            ) {
                onVersionCreated((newVersion as any).versionId)
            }

            // Reset form
            setVersionName('')
            setRawRs2f('')
            setUrl('')
            setContentSource('url')
            setErrors({})
        } catch (error) {
            console.error('Failed to create version:', error)
            setErrors({
                versionName: 'Failed to create version. Please try again.',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setVersionName('')
        setRawRs2f('')
        setUrl('')
        setContentSource('url')
        setErrors({})
        onCancel()
    }

    const content = (
        <Box>
            <Typography variant="h6" component="h3" sx={{ mb: 3 }}>
                {title}
            </Typography>

            <TextField
                fullWidth
                label="Version Name"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                error={!!errors.versionName}
                helperText={
                    errors.versionName || 'Enter a name for the new version'
                }
                sx={{ mb: 2 }}
            />

            {/* Content Source Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup
                    value={contentSource}
                    onChange={(e) =>
                        setContentSource(e.target.value as 'url' | 'raw')
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
            {contentSource === 'url' && (
                <TextField
                    fullWidth
                    label="Filter URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    error={!!errors.url}
                    helperText={
                        errors.url || 'Enter a URL to load filter content from'
                    }
                    sx={{ mb: 2 }}
                />
            )}

            {/* Raw Content Input */}
            {contentSource === 'raw' && (
                <TextField
                    fullWidth
                    label="RS2F Content"
                    multiline
                    rows={12}
                    value={rawRs2f}
                    onChange={(e) => setRawRs2f(e.target.value)}
                    error={!!errors.rawRs2f}
                    helperText={
                        errors.rawRs2f ||
                        'Enter your loot filter content in RS2F format'
                    }
                    sx={{ mb: 2 }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel} variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={
                        !versionName.trim() ||
                        (contentSource === 'raw' && !rawRs2f.trim()) ||
                        (contentSource === 'url' && !url.trim()) ||
                        saving
                    }
                >
                    {saving ? 'Creating...' : 'Create Version'}
                </Button>
            </Box>
        </Box>
    )

    if (showAsDialog) {
        return (
            <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{content}</DialogContent>
            </Dialog>
        )
    }

    return content
}
