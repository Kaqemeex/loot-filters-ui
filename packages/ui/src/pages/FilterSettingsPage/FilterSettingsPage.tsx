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
    List,
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
    getFilterSettings,
    updateFilterSettings,
} from '../../utils/api'

import {
    FilterSettings,
    filterSettingsSchema,
    Group,
    Module,
} from '@loot-filters/core'
import { GroupManagement } from './GroupManagement'
import { MacroMapping } from './MacroMapping'

export const FilterSettingsPage: React.FC = () => {
    const { filterId } = useParams<{ filterId: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()
    const [filter, setFilter] = useState<any>(null)
    const [settings, setSettings] = useState<FilterSettings>({ modules: [] })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingModule, setEditingModule] = useState<Module | null>(null)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [editingType, setEditingType] = useState<'module' | 'group'>('module')
    const [availableMacros, setAvailableMacros] = useState<
        Record<string, string>
    >({})

    useEffect(() => {
        if (!filterId || !isAuthenticated) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            // Fetch filter and settings in parallel
            const [filterData, settingsData] = await Promise.all([
                getFilter(filterId),
                getFilterSettings(filterId).then((settings) => {
                    console.log('settings', settings)
                    return filterSettingsSchema.parse(settings)
                }),
            ])

            setFilter(filterData)
            setSettings((settingsData as FilterSettings) || { modules: [] })
            console.log('filterData', filterData)

            // Extract available macros from filter data
            if (filterData && (filterData as any).parsedMacros) {
                try {
                    const macros = JSON.parse((filterData as any).parsedMacros)
                    setAvailableMacros(macros)
                } catch (error) {
                    console.error('Failed to parse macros:', error)
                    setAvailableMacros({})
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [filterId, isAuthenticated])

    const handleSave = async () => {
        if (!filterId) return

        setSaving(true)
        try {
            await updateFilterSettings(filterId, settings)
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

    const handleAddModule = () => {
        const newModule: Module = {
            id: crypto.randomUUID(),
            name: 'New Module',
            description: '',
            visible: true,
            groups: [],
        }
        setSettings((prev) => ({
            ...prev,
            modules: [...prev.modules, newModule],
        }))
    }

    const handleAddGroup = (moduleId: string) => {
        const newGroup: Group = {
            id: crypto.randomUUID(),
            name: 'New Group',
            description: '',
            macros: [],
        }
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.map((module) =>
                module.id === moduleId
                    ? { ...module, groups: [...module.groups, newGroup] }
                    : module
            ),
        }))
    }

    const handleEditModule = (module: Module) => {
        setEditingModule(module)
        setEditingType('module')
        setEditDialogOpen(true)
    }

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group)
        setEditingType('group')
        setEditDialogOpen(true)
    }

    const handleDeleteModule = (moduleId: string) => {
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.filter((m) => m.id !== moduleId),
        }))
    }

    const handleDeleteGroup = (moduleId: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.map((module) =>
                module.id === moduleId
                    ? {
                          ...module,
                          groups: module.groups.filter((g) => g.id !== groupId),
                      }
                    : module
            ),
        }))
    }

    const handleToggleModuleVisibility = (moduleId: string) => {
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.map((module) =>
                module.id === moduleId
                    ? { ...module, visible: !module.visible }
                    : module
            ),
        }))
    }

    const handleSaveEdit = () => {
        if (editingType === 'module' && editingModule) {
            setSettings((prev) => ({
                ...prev,
                modules: prev.modules.map((module) =>
                    module.id === editingModule.id ? editingModule : module
                ),
            }))
        } else if (editingType === 'group' && editingGroup) {
            setSettings((prev) => ({
                ...prev,
                modules: prev.modules.map((module) => ({
                    ...module,
                    groups: module.groups.map((group) =>
                        group.id === editingGroup.id ? editingGroup : group
                    ),
                })),
            }))
        }
        setEditDialogOpen(false)
        setEditingModule(null)
        setEditingGroup(null)
    }

    const handleCancelEdit = () => {
        setEditDialogOpen(false)
        setEditingModule(null)
        setEditingGroup(null)
    }

    const handleAddMacroToGroup = (macroName: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.map((module) => ({
                ...module,
                groups: module.groups.map((group) =>
                    group.id === groupId
                        ? { ...group, macros: [...group.macros, macroName] }
                        : group
                ),
            })),
        }))
    }

    const handleRemoveMacroFromGroup = (macroName: string, groupId: string) => {
        setSettings((prev) => ({
            ...prev,
            modules: prev.modules.map((module) => ({
                ...module,
                groups: module.groups.map((group) =>
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
        }))
    }

    const handleAddGroupForMacroMapping = () => {
        // Create a new module if none exist, or add to the first module
        if (settings.modules.length === 0) {
            const newModule: Module = {
                id: crypto.randomUUID(),
                name: 'Default Module',
                description: 'Default module for macro mapping',
                visible: true,
                groups: [],
            }
            setSettings((prev) => ({
                ...prev,
                modules: [...prev.modules, newModule],
            }))
        }
    }

    // Get all groups from all modules for macro mapping
    const getAllGroups = (): Group[] => {
        return settings.modules.flatMap((module) => module.groups)
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
                    Filter Settings: {filter.name}
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    Configure modules, groups, and macro bindings for your
                    filter
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Modules Section */}
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
                        Modules
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddModule}
                    >
                        Add Module
                    </Button>
                </Box>

                {settings.modules.length === 0 ? (
                    <Typography
                        color="text.secondary"
                        sx={{ textAlign: 'center', py: 4 }}
                    >
                        No modules configured. Add your first module to get
                        started.
                    </Typography>
                ) : (
                    <List>
                        {settings.modules.map((module) => (
                            <Card key={module.id} sx={{ mb: 2 }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
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
                                                {module.name}
                                            </Typography>
                                            <Chip
                                                label={
                                                    module.visible
                                                        ? 'Visible'
                                                        : 'Hidden'
                                                }
                                                size="small"
                                                color={
                                                    module.visible
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                icon={
                                                    module.visible ? (
                                                        <VisibilityIcon />
                                                    ) : (
                                                        <VisibilityOffIcon />
                                                    )
                                                }
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Toggle Visibility">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleToggleModuleVisibility(
                                                            module.id
                                                        )
                                                    }
                                                >
                                                    {module.visible ? (
                                                        <VisibilityIcon />
                                                    ) : (
                                                        <VisibilityOffIcon />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Module">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleEditModule(module)
                                                    }
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Module">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeleteModule(
                                                            module.id
                                                        )
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {module.description && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            {module.description}
                                        </Typography>
                                    )}

                                    {/* Groups */}
                                    <GroupManagement
                                        groups={module.groups}
                                        onAddGroup={() =>
                                            handleAddGroup(module.id)
                                        }
                                        onEditGroup={handleEditGroup}
                                        onDeleteGroup={(groupId) =>
                                            handleDeleteGroup(
                                                module.id,
                                                groupId
                                            )
                                        }
                                    />
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
                        groups={getAllGroups()}
                        onAddMacroToGroup={handleAddMacroToGroup}
                        onRemoveMacroFromGroup={handleRemoveMacroFromGroup}
                        onAddGroup={handleAddGroupForMacroMapping}
                    />
                </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCancelEdit}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Edit {editingType === 'module' ? 'Module' : 'Group'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={
                                editingType === 'module'
                                    ? editingModule?.name || ''
                                    : editingGroup?.name || ''
                            }
                            onChange={(e) => {
                                if (editingType === 'module' && editingModule) {
                                    setEditingModule({
                                        ...editingModule,
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
                                editingType === 'module'
                                    ? editingModule?.description || ''
                                    : editingGroup?.description || ''
                            }
                            onChange={(e) => {
                                if (editingType === 'module' && editingModule) {
                                    setEditingModule({
                                        ...editingModule,
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
                        {editingType === 'module' && (
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                editingModule?.visible || false
                                            }
                                            onChange={(e) => {
                                                if (editingModule) {
                                                    setEditingModule({
                                                        ...editingModule,
                                                        visible:
                                                            e.target.checked,
                                                    })
                                                }
                                            }}
                                        />
                                    }
                                    label="Visible"
                                />
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
