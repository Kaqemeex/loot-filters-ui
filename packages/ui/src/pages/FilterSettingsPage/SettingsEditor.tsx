import { FilterVersionSettings, Section } from '@loot-filters/core'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    List,
    Typography,
} from '@mui/material'

interface SettingsEditorProps {
    settings: FilterVersionSettings
    onAddSection: () => void
    onEditSection: (section: Section, index: number) => void
    onDeleteSection: (index: number) => void
    onSaveSettings: () => void
    isSaving: boolean
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
    settings,
    onAddSection,
    onEditSection,
    onDeleteSection,
    onSaveSettings,
    isSaving,
}) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h6" component="h3">
                    Filter Sections
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={onAddSection}
                    >
                        Add Section
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={onSaveSettings}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <CircularProgress size={16} />
                        ) : (
                            'Save Settings'
                        )}
                    </Button>
                </Box>
            </Box>

            <Card>
                <CardContent sx={{ p: 3 }}>
                    {settings.sections.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 4,
                                color: 'text.secondary',
                            }}
                        >
                            <Typography variant="body1" gutterBottom>
                                No sections configured
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Add your first section to get started
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={onAddSection}
                            >
                                Add Section
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {settings.sections.map((section, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 2,
                                        borderBottom:
                                            index < settings.sections.length - 1
                                                ? 1
                                                : 0,
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {section.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {section.description ||
                                                'No description'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {section.groups?.length || 0} groups
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() =>
                                                onEditSection(section, index)
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() =>
                                                onDeleteSection(index)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}
