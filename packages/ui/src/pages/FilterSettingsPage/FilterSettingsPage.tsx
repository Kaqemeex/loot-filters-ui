import { FilterVersionSettings, Section } from '@loot-filters/core'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthState } from '../../auth/useAuth'
import { FilterVersionCreator } from '../../components/FilterVersionCreator'
import {
    useListFilterVersions,
    useReadCurrentFilterVersionSettings,
    useReadFilter,
    useUpdateFilter,
    useUpdateSettingsOnFilterVersion,
} from '../../utils/api'
import { FilterHeader } from './FilterHeader'
import { FilterPropertiesEditor } from './FilterPropertiesEditor'
import { MacroMapping } from './MacroMapping'
import { SectionEditorDialog } from './SectionEditorDialog'
import { SettingsEditor } from './SettingsEditor'
import { VersionSelector } from './VersionSelector'

export const FilterSettingsPage: React.FC = () => {
    const { filterId } = useParams<{ filterId: string }>()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthState()

    // API hooks
    const {
        data: filter,
        apiCall: fetchFilter,
        isLoading: isLoadingFilter,
    } = useReadFilter()
    const {
        data: filterVersions,
        apiCall: fetchFilterVersions,
        isLoading: isLoadingVersions,
    } = useListFilterVersions()
    const {
        data: currentVersionSettings,
        apiCall: fetchCurrentVersionSettings,
        isLoading: isLoadingSettings,
    } = useReadCurrentFilterVersionSettings()
    const {
        apiCall: updateFilterVersionSettings,
        isLoading: isUpdatingSettings,
    } = useUpdateSettingsOnFilterVersion()
    const { apiCall: updateFilter, isLoading: isUpdatingFilter } =
        useUpdateFilter()

    // State
    const [selectedVersionId, setSelectedVersionId] = useState<string>('')
    const [settings, setSettings] = useState<FilterVersionSettings>({
        sections: [],
        macroInputMappings: {},
    })
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingSection, setEditingSection] = useState<Section | null>(null)
    const [editingSectionIndex, setEditingSectionIndex] = useState<number>(-1)
    const [editingType, setEditingType] = useState<'section' | 'group'>(
        'section'
    )
    const [availableMacros, setAvailableMacros] = useState<
        Record<string, string>
    >({})
    const [createVersionDialogOpen, setCreateVersionDialogOpen] =
        useState(false)
    const [currentVersionData, setCurrentVersionData] = useState<any>(null)

    // Form state objects

    const [versionForm, setVersionForm] = useState({
        copySettingsFromVersion: '',
        copySettingsEnabled: true,
    })

    const loading = isLoadingFilter || isLoadingVersions || isLoadingSettings
    const saving = isUpdatingSettings || isUpdatingFilter

    // Load initial data when component mounts
    useEffect(() => {
        console.log('FilterSettingsPage: Initial data useEffect triggered', {
            filterId,
            isAuthenticated,
        })
        if (!filterId || !isAuthenticated) return

        console.log('FilterSettingsPage: Fetching filter and versions')
        fetchFilter({ filterId })
        fetchFilterVersions({ filterId })
    }, [filterId, isAuthenticated])

    // Auto-select latest version when versions are loaded
    useEffect(() => {
        if (filterVersions && filterVersions.length > 0 && !selectedVersionId) {
            const sortedVersions = filterVersions.sort(
                (a: any, b: any) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            setSelectedVersionId(sortedVersions[0].versionId)
        }
    }, [filterVersions, selectedVersionId])

    // Load settings and version data when version is selected
    useEffect(() => {
        console.log(
            'FilterSettingsPage: Version settings useEffect triggered',
            { selectedVersionId, filterId }
        )
        if (!selectedVersionId || !filterId) return

        console.log('FilterSettingsPage: Fetching current version settings')
        fetchCurrentVersionSettings({ filterId })

        // Find the selected version to extract macros
        const versionData = filterVersions?.find(
            (v: any) => v.versionId === selectedVersionId
        )
        setCurrentVersionData(versionData)

        // Extract available macros from version data
        if (versionData?.parsedMacros) {
            try {
                const macros =
                    typeof versionData.parsedMacros === 'string'
                        ? JSON.parse(versionData.parsedMacros)
                        : versionData.parsedMacros
                const macroRecord: Record<string, string> = {}

                if (Array.isArray(macros)) {
                    macros.forEach((macro: any) => {
                        if (macro.macroName && macro.value !== undefined) {
                            macroRecord[macro.macroName] = macro.value
                        }
                    })
                } else if (typeof macros === 'object' && macros !== null) {
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
    }, [selectedVersionId, filterId, filterVersions])

    // Update settings when current version settings are loaded
    useEffect(() => {
        if (
            currentVersionSettings &&
            'sections' in currentVersionSettings &&
            'macroInputMappings' in currentVersionSettings
        ) {
            setSettings(currentVersionSettings as FilterVersionSettings)
        }
    }, [currentVersionSettings])

    // Memoized values
    const sortedFilterVersions = useMemo(() => {
        return (
            filterVersions?.sort(
                (a: any, b: any) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            ) || []
        )
    }, [filterVersions])

    // Event handlers - memoized to prevent unnecessary re-renders
    const handleCancel = useCallback(() => {
        navigate(`/filters/${filterId}`)
    }, [navigate, filterId])

    const handleSaveFilter = useCallback(
        async (data: {
            name: string
            description: string
            public: boolean
            currentVersionId: string
        }) => {
            if (!filterId) return

            try {
                await updateFilter({
                    filterId,
                    name: data.name,
                    description: data.description,
                    public: data.public,
                    currentVersionId: data.currentVersionId || undefined,
                })
                // Refresh filter data
                fetchFilter({ filterId })
            } catch (error) {
                console.error('Failed to update filter:', error)
            }
        },
        [filterId, updateFilter, fetchFilter]
    )

    const handleVersionChange = useCallback((versionId: string) => {
        setSelectedVersionId(versionId)
    }, [])

    const handleCreateVersion = useCallback(() => {
        setCreateVersionDialogOpen(true)
    }, [])

    const handleCloseCreateVersion = useCallback(() => {
        setCreateVersionDialogOpen(false)
        setVersionForm({
            copySettingsFromVersion: '',
            copySettingsEnabled: true,
        })
    }, [])

    const handleAddSection = useCallback(() => {
        setEditingSection(null)
        setEditingSectionIndex(-1)
        setEditingType('section')
        setEditDialogOpen(true)
    }, [])

    const handleEditSection = useCallback((section: Section, index: number) => {
        setEditingSection(section)
        setEditingSectionIndex(index)
        setEditingType('section')
        setEditDialogOpen(true)
    }, [])

    const handleDeleteSection = useCallback((index: number) => {
        setSettings((prev) => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index),
        }))
    }, [])

    const handleSaveSection = useCallback(
        (section: Section) => {
            setSettings((prev) => {
                if (editingSectionIndex >= 0) {
                    // Update existing section
                    const newSections = [...prev.sections]
                    newSections[editingSectionIndex] = section
                    return { ...prev, sections: newSections }
                } else {
                    // Add new section
                    return { ...prev, sections: [...prev.sections, section] }
                }
            })
            setEditDialogOpen(false)
        },
        [editingSectionIndex]
    )

    const handleDeleteSectionFromDialog = useCallback(() => {
        if (editingSectionIndex >= 0) {
            setSettings((prev) => ({
                ...prev,
                sections: prev.sections.filter(
                    (_, i) => i !== editingSectionIndex
                ),
            }))
            setEditDialogOpen(false)
        }
    }, [editingSectionIndex])

    const handleSaveSettings = useCallback(async () => {
        if (!filterId || !selectedVersionId) return

        try {
            await updateFilterVersionSettings({
                filterId,
                versionId: selectedVersionId,
                settings,
            })
        } catch (error) {
            console.error('Failed to save settings:', error)
        }
    }, [filterId, selectedVersionId, settings, updateFilterVersionSettings])

    const handleMacroMappingChange = useCallback((mappings: any) => {
        setSettings((prev) => ({ ...prev, macroInputMappings: mappings }))
    }, [])

    // Memoized macro mapping handlers to prevent recreation
    const macroHandlers = useMemo(
        () => ({
            onAddMacroToGroup: (macroName: string, groupId: string) => {
                // Handle adding macro to group
            },
            onRemoveMacroFromGroup: (macroName: string, groupId: string) => {
                // Handle removing macro from group
            },
            onUpdateMacroInputMapping: (macroName: string, inputType: any) => {
                handleMacroMappingChange({
                    ...settings.macroInputMappings,
                    [macroName]: inputType,
                })
            },
        }),
        [settings.macroInputMappings, handleMacroMappingChange]
    )

    // Render loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    // Render authentication error
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

    // Render filter not found error
    if (!filter) {
        return (
            <Box>
                <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
                    Filter Settings
                </Typography>
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    Filter not found
                </Alert>
            </Box>
        )
    }

    return (
        <Box>
            <FilterHeader filterName={filter.name} onBackClick={handleCancel} />

            <FilterPropertiesEditor
                name={filter.name}
                description={filter.description}
                public={filter.public}
                currentVersionId={filter.currentVersionId || ''}
                filterVersions={sortedFilterVersions}
                onSave={handleSaveFilter}
                isSaving={saving}
            />

            <VersionSelector
                selectedVersionId={selectedVersionId}
                filterVersions={sortedFilterVersions}
                onVersionChange={handleVersionChange}
                onCreateVersion={handleCreateVersion}
            />

            {selectedVersionId && (
                <>
                    <SettingsEditor
                        settings={settings}
                        onAddSection={handleAddSection}
                        onEditSection={handleEditSection}
                        onDeleteSection={handleDeleteSection}
                        onSaveSettings={handleSaveSettings}
                        isSaving={saving}
                    />

                    <MacroMapping
                        availableMacros={availableMacros}
                        sections={settings.sections}
                        macroInputMappings={settings.macroInputMappings}
                        {...macroHandlers}
                    />
                </>
            )}

            <SectionEditorDialog
                open={editDialogOpen}
                section={editingSection}
                editingType={editingType}
                onClose={() => setEditDialogOpen(false)}
                onSave={handleSaveSection}
                onDelete={handleDeleteSectionFromDialog}
                isEditing={editingSectionIndex >= 0}
            />

            <FilterVersionCreator
                open={createVersionDialogOpen}
                onCancel={handleCloseCreateVersion}
                filterId={filterId!}
                onVersionCreated={() => {
                    handleCloseCreateVersion()
                    fetchFilterVersions({ filterId: filterId! })
                }}
            />
        </Box>
    )
}
