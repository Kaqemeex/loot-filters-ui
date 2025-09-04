import {
    FilterVersionSettings,
    Group,
    MacroInputMapping,
    Section,
} from '@loot-filters/core'
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    List,
    MenuItem,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import {
    getFilter,
    getFilterVersions,
    getFilterVersionSettings,
    updateFilter,
    updateFilterVersionSettings,
} from '../../utils/api'
import { createFilterVersionWithPrecompiling } from '../../utils/filterVersionUtils'
import { MacroMapping } from './MacroMapping'

export const FilterSettingsPage: React.FC = () => {
    const { filterId } = useParams<{ filterId: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [filter, setFilter] = useState<any>(null)
    const [filterVersions, setFilterVersions] = useState<any[]>([])
    const [selectedVersionId, setSelectedVersionId] = useState<string>('')
    const [settings, setSettings] = useState<FilterVersionSettings>({
        sections: [],
        macroInputMappings: {},
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSection, setEditingSection] = useState<Section | null>(null)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [editingType, setEditingType] = useState<'section' | 'group'>(
        'section'
    )
    const [availableMacros, setAvailableMacros] = useState<
        Record<string, string>
    >({})
    const [createVersionDialogOpen, setCreateVersionDialogOpen] =
        useState(false)
    const [newVersionName, setNewVersionName] = useState('')
    const [newVersionRs2f, setNewVersionRs2f] = useState('')
    const [currentVersionData, setCurrentVersionData] = useState<any>(null)
    const [copySettingsFromVersion, setCopySettingsFromVersion] =
        useState<string>('')
    const [copySettingsEnabled, setCopySettingsEnabled] = useState(true)
    const [editingFilterProperties, setEditingFilterProperties] =
        useState(false)
    const [tempFilterName, setTempFilterName] = useState('')
    const [tempFilterDescription, setTempFilterDescription] = useState('')
    const [tempFilterPublic, setTempFilterPublic] = useState(false)
    const [tempCurrentVersionId, setTempCurrentVersionId] = useState('')

    useEffect(() => {
        if (!filterId || !isAuthenticated) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                // Fetch filter and versions in parallel
                const [filterData, versionsData] = await Promise.all([
                    getFilter(filterId),
                    getFilterVersions(filterId).catch(() => []),
                ])

                setFilter(filterData)
                setFilterVersions(versionsData as any[])

                // Select the latest version by default (newest by creation date)
                if ((versionsData as any[]).length > 0) {
                    const sortedVersions = (versionsData as any[]).sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                    setSelectedVersionId(sortedVersions[0].versionId)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
                setError('Failed to load filter data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [filterId, isAuthenticated])

    // Load version-specific data when version is selected
    useEffect(() => {
        if (!selectedVersionId || !filterId) return

        const loadVersionData = async () => {
            try {
                const [settingsData, versionData] = await Promise.all([
                    getFilterVersionSettings(filterId, selectedVersionId).catch(
                        () => ({
                            sections: [],
                            macroInputMappings: {},
                        })
                    ),
                    // Get the specific version to extract parsed macros
                    getFilterVersions(filterId).then((versions: any) =>
                        (versions as any[]).find(
                            (v: any) => v.versionId === selectedVersionId
                        )
                    ),
                ])

                setSettings(settingsData as FilterVersionSettings)
                setCurrentVersionData(versionData)

                // Extract available macros from version data
                if (versionData && versionData.parsedMacros) {
                    try {
                        const macros = JSON.parse(versionData.parsedMacros)
                        // Convert array of {macroName, value} objects to Record<string, string>
                        const macroRecord: Record<string, string> = {}
                        if (Array.isArray(macros)) {
                            macros.forEach((macro: any) => {
                                if (
                                    macro.macroName &&
                                    macro.value !== undefined
                                ) {
                                    macroRecord[macro.macroName] = macro.value
                                }
                            })
                        } else if (
                            typeof macros === 'object' &&
                            macros !== null
                        ) {
                            // Handle case where it's already a Record<string, string>
                            Object.entries(macros).forEach(([key, value]) => {
                                if (typeof value === 'string') {
                                    macroRecord[key] = value
                                } else if (
                                    typeof value === 'object' &&
                                    value !== null &&
                                    'value' in value
                                ) {
                                    macroRecord[key] = (value as any).value
                                }
                            })
                        }
                        setAvailableMacros(macroRecord)
                    } catch (error) {
                        console.error('Failed to parse macros:', error)
                        setAvailableMacros({})
                    }
                }
            } catch (error) {
                console.error('Failed to load version data:', error)
                setError('Failed to load version data')
            }
        }

        loadVersionData()
    }, [selectedVersionId, filterId])

    const handleSave = async () => {
        if (!filterId || !selectedVersionId) return

        setSaving(true)
        try {
            await updateFilterVersionSettings(
                filterId,
                selectedVersionId,
                settings
            )
            navigate(`/filters/${filterId}`)
        } catch (error) {
            console.error('Failed to update filter settings:', error)
            setError('Failed to update filter settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        navigate(`/filters/${filterId}`)
    }

    const handleAddSection = () => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            name: 'New Section',
            description: '',
            visible: true,
            groups: [],
        }
        setSettings((prev) => ({
            ...prev,
            sections: [...prev.sections, newSection],
        }))
    }

    const handleAddGroup = (sectionId: string) => {
        const newGroup: Group = {
            id: crypto.randomUUID(),
            name: 'New Group',
            description: '',
            visible: true,
            macros: [],
        }
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? { ...section, groups: [...section.groups, newGroup] }
                    : section
            ),
        }))
    }

    const handleEditSection = (section: Section) => {
        setEditingSection(section)
        setEditingType('section')
        setEditDialogOpen(true)
    }

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group)
        setEditingType('group')
        setEditDialogOpen(true)
    }

    const handleDeleteSection = (sectionId: string) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.filter((s) => s.id !== sectionId),
        }))
    }

    const handleDeleteGroup = (sectionId: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          groups: section.groups.filter(
                              (g) => g.id !== groupId
                          ),
                      }
                    : section
            ),
        }))
    }

    const handleToggleSectionVisibility = (sectionId: string) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? { ...section, visible: !section.visible }
                    : section
            ),
        }))
    }

    const handleToggleGroupVisibility = (
        sectionId: string,
        groupId: string
    ) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                          ...section,
                          groups: section.groups.map((group) =>
                              group.id === groupId
                                  ? { ...group, visible: !group.visible }
                                  : group
                          ),
                      }
                    : section
            ),
        }))
    }

    const handleSaveEdit = () => {
        if (editingType === 'section' && editingSection) {
            setSettings((prev) => ({
                ...prev,
                sections: prev.sections.map((section) =>
                    section.id === editingSection.id ? editingSection : section
                ),
            }))
        } else if (editingType === 'group' && editingGroup) {
            setSettings((prev) => ({
                ...prev,
                sections: prev.sections.map((section) => ({
                    ...section,
                    groups: section.groups.map((group) =>
                        group.id === editingGroup.id ? editingGroup : group
                    ),
                })),
            }))
        }
        setEditDialogOpen(false)
        setEditingSection(null)
        setEditingGroup(null)
    }

    const handleCancelEdit = () => {
        setEditDialogOpen(false)
        setEditingSection(null)
        setEditingGroup(null)
    }

    const handleCreateVersion = () => {
        setCreateVersionDialogOpen(true)
        setNewVersionName('')
        setNewVersionRs2f(currentVersionData?.rawRs2f || '')
        setCopySettingsFromVersion(selectedVersionId)
        setCopySettingsEnabled(true)
    }

    const handleSaveNewVersion = async () => {
        if (!newVersionName.trim() || !newVersionRs2f.trim() || !filterId) {
            return
        }

        setSaving(true)
        try {
            // Determine which settings to use
            let settingsToUse = settings

            if (copySettingsEnabled && copySettingsFromVersion) {
                // Get settings from the selected version
                const sourceSettings = await getFilterVersionSettings(
                    filterId,
                    copySettingsFromVersion
                )
                settingsToUse = sourceSettings as FilterVersionSettings
            }

            // Create new version using the shared utility
            const versionResult = await createFilterVersionWithPrecompiling({
                filterId,
                versionName: newVersionName.trim(),
                rawRs2f: newVersionRs2f.trim(),
                settings: settingsToUse,
            })

            if (!versionResult.success) {
                throw new Error(
                    versionResult.error || 'Failed to create new version'
                )
            }

            // Refresh the versions list
            const updatedVersions = await getFilterVersions(filterId)
            setFilterVersions(updatedVersions as any[])

            // Select the new version
            if (versionResult.versionId) {
                setSelectedVersionId(versionResult.versionId)
            }

            setCreateVersionDialogOpen(false)
            setNewVersionName('')
            setNewVersionRs2f('')
            setCopySettingsFromVersion('')
            setCopySettingsEnabled(false)
        } catch (error) {
            console.error('Failed to create new version:', error)
            setError('Failed to create new version. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelCreateVersion = () => {
        setCreateVersionDialogOpen(false)
        setNewVersionName('')
        setNewVersionRs2f('')
    }

    const handleStartEditFilter = () => {
        setTempFilterName(filter.name)
        setTempFilterDescription(filter.description || '')
        setTempFilterPublic(filter.public)
        setTempCurrentVersionId(filter.currentVersionId || '')
        setEditingFilterProperties(true)
    }

    const handleSaveFilter = async () => {
        if (!filterId) return

        setSaving(true)
        try {
            await updateFilter(filterId, {
                name: tempFilterName,
                description: tempFilterDescription,
                public: tempFilterPublic,
                currentVersionId: tempCurrentVersionId,
            })

            // Update the local filter state
            setFilter((prev: any) => ({
                ...prev,
                name: tempFilterName,
                description: tempFilterDescription,
                public: tempFilterPublic,
                currentVersionId: tempCurrentVersionId,
            }))
            setEditingFilterProperties(false)
        } catch (error) {
            console.error('Failed to update filter:', error)
            setError('Failed to update filter properties. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEditFilter = () => {
        setEditingFilterProperties(false)
        setTempFilterName('')
        setTempFilterDescription('')
        setTempFilterPublic(false)
        setTempCurrentVersionId('')
    }

    const handleAddMacroToGroup = (macroName: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => ({
                ...section,
                groups: section.groups.map((group) =>
                    group.id === groupId
                        ? { ...group, macros: [...group.macros, macroName] }
                        : group
                ),
            })),
            // Also add the macro to macroInputMappings if it doesn't exist
            macroInputMappings: {
                ...prev.macroInputMappings,
                [macroName]: prev.macroInputMappings[macroName] || {
                    macroName,
                    inputType: 'raw_rs2f' as const,
                },
            },
        }))
    }

    const handleRemoveMacroFromGroup = (macroName: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => ({
                ...section,
                groups: section.groups.map((group) =>
                    group.id === groupId
                        ? {
                              ...group,
                              macros: group.macros.filter(
                                  (m) => m !== macroName
                              ),
                          }
                        : group
                ),
            })),
            // Remove the macro from macroInputMappings if it's not used in any other group
            macroInputMappings: (() => {
                const isMacroUsedElsewhere = prev.sections.some((section) =>
                    section.groups.some(
                        (group) =>
                            group.id !== groupId &&
                            group.macros.includes(macroName)
                    )
                )

                if (isMacroUsedElsewhere) {
                    return prev.macroInputMappings
                }

                const newMappings = { ...prev.macroInputMappings }
                delete newMappings[macroName]
                return newMappings
            })(),
        }))
    }

    // Get all groups from all sections for macro mapping
    const getAllGroups = (): Group[] => {
        return settings.sections.flatMap((section) => section.groups)
    }

    const handleUpdateMacroInputMapping = (
        macroName: string,
        mapping: MacroInputMapping
    ) => {
        setSettings((prev) => ({
            ...prev,
            macroInputMappings: {
                ...prev.macroInputMappings,
                [macroName]: mapping,
            },
        }))
    }

    // Show authentication error if not logged in
    if (!isAuthenticated) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Filter Settings
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    You must be logged in to configure filter settings. Please
                    log in to continue.
                </Alert>
            </Box>
        )
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error || !filter) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Filter Settings
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    {error || 'Filter not found'}
                </Alert>
            </Box>
        )
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleCancel}
                    sx={{ mb: 2 }}
                >
                    Back to Filter
                </Button>
                <Typography variant="h4" component="h1">
                    Filter: {filter.name}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1, mb: 2 }}
                >
                    Configure sections, groups, and macro bindings for your
                    filter
                </Typography>
                {selectedVersionId && (
                    <Typography variant="h6" color="primary">
                        Editing:{' '}
                        {filterVersions.find(
                            (v) => v.versionId === selectedVersionId
                        )?.name || 'Unnamed Version'}
                    </Typography>
                )}

                {/* Filter Properties Section */}
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
                        {!editingFilterProperties && (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleStartEditFilter}
                            >
                                Edit Properties
                            </Button>
                        )}
                    </Box>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            {editingFilterProperties ? (
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
                                            value={tempFilterName}
                                            onChange={(e) =>
                                                setTempFilterName(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>
                                                Current Version
                                            </InputLabel>
                                            <Select
                                                value={tempCurrentVersionId}
                                                onChange={(e) =>
                                                    setTempCurrentVersionId(
                                                        e.target.value
                                                    )
                                                }
                                                label="Current Version"
                                            >
                                                <MenuItem value="">
                                                    <em>No current version</em>
                                                </MenuItem>
                                                {filterVersions
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(
                                                                b.createdAt
                                                            ).getTime() -
                                                            new Date(
                                                                a.createdAt
                                                            ).getTime()
                                                    )
                                                    .map((version) => (
                                                        <MenuItem
                                                            key={
                                                                version.versionId
                                                            }
                                                            value={
                                                                version.versionId
                                                            }
                                                        >
                                                            {version.name ||
                                                                `Version ${new Date(version.createdAt).toLocaleDateString()}`}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={3}
                                        value={tempFilterDescription}
                                        onChange={(e) =>
                                            setTempFilterDescription(
                                                e.target.value
                                            )
                                        }
                                    />
                                    <FormControl>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={tempFilterPublic}
                                                    onChange={(e) =>
                                                        setTempFilterPublic(
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            }
                                            label="Make this filter public"
                                        />
                                    </FormControl>
                                    <Box
                                        sx={{ display: 'flex', gap: 2, mt: 2 }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={handleSaveFilter}
                                            disabled={saving}
                                        >
                                            {saving
                                                ? 'Saving...'
                                                : 'Save Changes'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancelEditFilter}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: '1fr 1fr',
                                            md: '1fr 1fr 1fr 1fr',
                                        },
                                        gap: 3,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ mb: 0.5 }}
                                        >
                                            Name
                                        </Typography>
                                        <Typography variant="body1">
                                            {filter.name}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ mb: 0.5 }}
                                        >
                                            Description
                                        </Typography>
                                        <Typography variant="body1">
                                            {filter.description ||
                                                'No description'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ mb: 0.5 }}
                                        >
                                            Visibility
                                        </Typography>
                                        <Chip
                                            label={
                                                filter.public
                                                    ? 'Public'
                                                    : 'Private'
                                            }
                                            color={
                                                filter.public
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ mb: 0.5 }}
                                        >
                                            Current Version
                                        </Typography>
                                        <Typography variant="body1">
                                            {filter.currentVersionId
                                                ? filterVersions.find(
                                                      (v) =>
                                                          v.versionId ===
                                                          filter.currentVersionId
                                                  )?.name ||
                                                  `Version ${filter.currentVersionId.slice(0, 8)}...`
                                                : 'No current version set'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Version Selection */}
                {filterVersions.length > 0 && (
                    <Box sx={{ mt: 4, mb: 4 }}>
                        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                            Version Settings
                        </Typography>
                        <Box sx={{ maxWidth: 600 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'flex-end',
                                }}
                            >
                                <FormControl sx={{ flex: 1 }}>
                                    <InputLabel>
                                        Select Version to Edit
                                    </InputLabel>
                                    <Select
                                        value={selectedVersionId}
                                        onChange={(e) =>
                                            setSelectedVersionId(e.target.value)
                                        }
                                        label="Select Version to Edit"
                                    >
                                        {filterVersions
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.createdAt
                                                    ).getTime() -
                                                    new Date(
                                                        a.createdAt
                                                    ).getTime()
                                            )
                                            .map((version) => (
                                                <MenuItem
                                                    key={version.versionId}
                                                    value={version.versionId}
                                                >
                                                    {version.name ||
                                                        `Version ${new Date(version.createdAt).toLocaleDateString()}`}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateVersion}
                                    disabled={!selectedVersionId}
                                >
                                    Create New Version
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Show message if no version is selected */}
            {!selectedVersionId && filterVersions.length === 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No versions available for this filter. Create a filter
                    version first.
                </Alert>
            )}

            {/* Create first version button when no versions exist */}
            {filterVersions.length === 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateVersion}
                    >
                        Create First Version
                    </Button>
                </Box>
            )}

            {/* Settings Content - only show when version is selected */}
            {selectedVersionId && (
                <>
                    {/* Sections Section */}
                    <Box sx={{ mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                            }}
                        >
                            <Typography variant="h6" component="h3">
                                Sections
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddSection}
                            >
                                Add Section
                            </Button>
                        </Box>

                        {settings.sections.length === 0 ? (
                            <Typography
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 4 }}
                            >
                                No sections configured. Add your first section
                                to get started.
                            </Typography>
                        ) : (
                            <List>
                                {settings.sections.map((section) => (
                                    <Card key={section.id} sx={{ mb: 2 }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Typography variant="h6">
                                                        {section.name}
                                                    </Typography>
                                                    <Chip
                                                        label={
                                                            section.visible
                                                                ? 'Visible'
                                                                : 'Hidden'
                                                        }
                                                        size="small"
                                                        color={
                                                            section.visible
                                                                ? 'success'
                                                                : 'default'
                                                        }
                                                        icon={
                                                            section.visible ? (
                                                                <VisibilityIcon />
                                                            ) : (
                                                                <VisibilityOffIcon />
                                                            )
                                                        }
                                                    />
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Tooltip title="Toggle Visibility">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleToggleSectionVisibility(
                                                                    section.id
                                                                )
                                                            }
                                                        >
                                                            {section.visible ? (
                                                                <VisibilityIcon />
                                                            ) : (
                                                                <VisibilityOffIcon />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Section">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleEditSection(
                                                                    section
                                                                )
                                                            }
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Section">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                handleDeleteSection(
                                                                    section.id
                                                                )
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            {section.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    {section.description}
                                                </Typography>
                                            )}

                                            {/* Groups */}
                                            <Box sx={{ ml: 2 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Typography variant="subtitle1">
                                                        Groups (
                                                        {section.groups.length})
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() =>
                                                            handleAddGroup(
                                                                section.id
                                                            )
                                                        }
                                                    >
                                                        Add Group
                                                    </Button>
                                                </Box>

                                                {section.groups.map((group) => (
                                                    <Card
                                                        key={group.id}
                                                        sx={{
                                                            mb: 1,
                                                            backgroundColor:
                                                                'action.hover',
                                                        }}
                                                    >
                                                        <CardContent
                                                            sx={{ p: 2 }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display:
                                                                        'flex',
                                                                    justifyContent:
                                                                        'space-between',
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    <Typography variant="subtitle2">
                                                                        {
                                                                            group.name
                                                                        }
                                                                    </Typography>
                                                                    <Chip
                                                                        label={
                                                                            group.visible
                                                                                ? 'Visible'
                                                                                : 'Hidden'
                                                                        }
                                                                        size="small"
                                                                        color={
                                                                            group.visible
                                                                                ? 'success'
                                                                                : 'default'
                                                                        }
                                                                        icon={
                                                                            group.visible ? (
                                                                                <VisibilityIcon />
                                                                            ) : (
                                                                                <VisibilityOffIcon />
                                                                            )
                                                                        }
                                                                    />
                                                                </Box>
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    <Tooltip title="Toggle Visibility">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleToggleGroupVisibility(
                                                                                    section.id,
                                                                                    group.id
                                                                                )
                                                                            }
                                                                        >
                                                                            {group.visible ? (
                                                                                <VisibilityIcon />
                                                                            ) : (
                                                                                <VisibilityOffIcon />
                                                                            )}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Edit Group">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() =>
                                                                                handleEditGroup(
                                                                                    group
                                                                                )
                                                                            }
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Group">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() =>
                                                                                handleDeleteGroup(
                                                                                    section.id,
                                                                                    group.id
                                                                                )
                                                                            }
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Box>

                                                            {group.description && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display:
                                                                            'block',
                                                                        mb: 1,
                                                                    }}
                                                                >
                                                                    {
                                                                        group.description
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                            >
                                                                Macros:{' '}
                                                                {
                                                                    group.macros
                                                                        .length
                                                                }
                                                            </Typography>

                                                            {group.macros
                                                                .length > 0 && (
                                                                <Box
                                                                    sx={{
                                                                        display:
                                                                            'flex',
                                                                        flexWrap:
                                                                            'wrap',
                                                                        gap: 0.5,
                                                                        mt: 1,
                                                                    }}
                                                                >
                                                                    {group.macros.map(
                                                                        (
                                                                            macroName
                                                                        ) => (
                                                                            <Chip
                                                                                key={
                                                                                    macroName
                                                                                }
                                                                                label={
                                                                                    macroName
                                                                                }
                                                                                size="small"
                                                                                onDelete={() =>
                                                                                    handleRemoveMacroFromGroup(
                                                                                        macroName,
                                                                                        group.id
                                                                                    )
                                                                                }
                                                                                deleteIcon={
                                                                                    <DeleteIcon />
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Macro Mapping Section */}
                    {Object.keys(availableMacros).length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <MacroMapping
                                availableMacros={availableMacros}
                                sections={settings.sections}
                                macroInputMappings={settings.macroInputMappings}
                                onAddMacroToGroup={handleAddMacroToGroup}
                                onRemoveMacroFromGroup={
                                    handleRemoveMacroFromGroup
                                }
                                onUpdateMacroInputMapping={
                                    handleUpdateMacroInputMapping
                                }
                            />
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button onClick={handleCancel} variant="outlined">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </>
            )}

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCancelEdit}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit {editingType === 'section' ? 'Section' : 'Group'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={
                                editingType === 'section'
                                    ? editingSection?.name || ''
                                    : editingGroup?.name || ''
                            }
                            onChange={(e) => {
                                if (
                                    editingType === 'section' &&
                                    editingSection
                                ) {
                                    setEditingSection({
                                        ...editingSection,
                                        name: e.target.value,
                                    })
                                } else if (
                                    editingType === 'group' &&
                                    editingGroup
                                ) {
                                    setEditingGroup({
                                        ...editingGroup,
                                        name: e.target.value,
                                    })
                                }
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            value={
                                editingType === 'section'
                                    ? editingSection?.description || ''
                                    : editingGroup?.description || ''
                            }
                            onChange={(e) => {
                                if (
                                    editingType === 'section' &&
                                    editingSection
                                ) {
                                    setEditingSection({
                                        ...editingSection,
                                        description: e.target.value,
                                    })
                                } else if (
                                    editingType === 'group' &&
                                    editingGroup
                                ) {
                                    setEditingGroup({
                                        ...editingGroup,
                                        description: e.target.value,
                                    })
                                }
                            }}
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={
                                            editingType === 'section'
                                                ? editingSection?.visible ||
                                                  false
                                                : editingGroup?.visible || false
                                        }
                                        onChange={(e) => {
                                            if (
                                                editingType === 'section' &&
                                                editingSection
                                            ) {
                                                setEditingSection({
                                                    ...editingSection,
                                                    visible: e.target.checked,
                                                })
                                            } else if (
                                                editingType === 'group' &&
                                                editingGroup
                                            ) {
                                                setEditingGroup({
                                                    ...editingGroup,
                                                    visible: e.target.checked,
                                                })
                                            }
                                        }}
                                    />
                                }
                                label="Visible"
                            />
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create New Version Dialog */}
            <Dialog
                open={createVersionDialogOpen}
                onClose={handleCancelCreateVersion}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Create New Version</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Version Name"
                            value={newVersionName}
                            onChange={(e) => setNewVersionName(e.target.value)}
                            placeholder="Enter a name for the new version"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="RS2F Content"
                            multiline
                            rows={12}
                            value={newVersionRs2f}
                            onChange={(e) => setNewVersionRs2f(e.target.value)}
                            placeholder="Enter the RS2F filter content"
                            sx={{ mb: 2 }}
                        />

                        {/* Copy Settings Section */}
                        <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={copySettingsEnabled}
                                        onChange={(e) =>
                                            setCopySettingsEnabled(
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Copy settings from another version"
                            />

                            {copySettingsEnabled && (
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <InputLabel>
                                        Copy settings from version
                                    </InputLabel>
                                    <Select
                                        value={copySettingsFromVersion}
                                        onChange={(e) =>
                                            setCopySettingsFromVersion(
                                                e.target.value
                                            )
                                        }
                                        label="Copy settings from version"
                                    >
                                        {filterVersions
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.createdAt
                                                    ).getTime() -
                                                    new Date(
                                                        a.createdAt
                                                    ).getTime()
                                            )
                                            .map((version) => (
                                                <MenuItem
                                                    key={version.versionId}
                                                    value={version.versionId}
                                                >
                                                    {version.name ||
                                                        `Version ${new Date(version.createdAt).toLocaleDateString()}`}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            This will create a new version with the provided
                            RS2F content{' '}
                            {copySettingsEnabled
                                ? 'and settings from the selected version'
                                : 'and current settings'}
                            . The RS2F content will be precompiled
                            automatically.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelCreateVersion}>Cancel</Button>
                    <Button
                        onClick={handleSaveNewVersion}
                        variant="contained"
                        disabled={
                            !newVersionName.trim() ||
                            !newVersionRs2f.trim() ||
                            saving
                        }
                    >
                        {saving ? 'Creating...' : 'Create Version'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
