import {
    BooleanInput,
    Group,
    InputType,
    ListInput,
    MacroInputMapping,
    NumberInput,
    RawRs2fInput,
    Section,
    getInputTypeNames,
} from '@loot-filters/core'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Select,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useState } from 'react'

interface MacroMappingProps {
    availableMacros: Record<string, string>
    sections: Section[]
    macroInputMappings: MacroInputMapping
    onAddMacroToGroup: (macroName: string, groupId: string) => void
    onRemoveMacroFromGroup: (macroName: string, groupId: string) => void
    onUpdateMacroInputMapping: (macroName: string, mapping: InputType) => void
}

export const MacroMapping: React.FC<MacroMappingProps> = ({
    availableMacros,
    sections,
    macroInputMappings,
    onAddMacroToGroup,
    onRemoveMacroFromGroup,
    onUpdateMacroInputMapping,
}) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingMacro, setEditingMacro] = useState<string>('')
    const [editingInputType, setEditingInputType] = useState<InputType>({
        type: 'raw_rs2f',
    } as RawRs2fInput)

    const macroNames = Object.keys(availableMacros)

    // Get all groups from all sections
    const getAllGroups = (): Group[] => {
        return sections.flatMap((section) => section.groups)
    }

    const isMacroInGroup = (macroName: string, groupId: string): boolean => {
        const group = getAllGroups().find((g) => g.id === groupId)
        return group?.macros.includes(macroName) || false
    }

    const getGroupsForMacro = (macroName: string): string[] => {
        return getAllGroups()
            .filter((group) => group.macros.includes(macroName))
            .map((group) => group.id)
    }

    const getInputTypeDisplayName = (inputType: InputType): string => {
        if (inputType.type === 'list') {
            return `list (${inputType.itemTypes})`
        }
        return inputType.type
    }

    const handleToggleMacroInGroup = (macroName: string) => {
        if (selectedGroup) {
            if (isMacroInGroup(macroName, selectedGroup)) {
                onRemoveMacroFromGroup(macroName, selectedGroup)
            } else {
                onAddMacroToGroup(macroName, selectedGroup)
            }
        }
    }

    const handleRemoveMacroFromGroup = (macroName: string, groupId: string) => {
        onRemoveMacroFromGroup(macroName, groupId)
    }

    const handleEditMacroInputMapping = (macroName: string) => {
        const currentMapping = macroInputMappings[macroName]
        setEditingMacro(macroName)
        setEditingInputType(currentMapping || { type: 'raw_rs2f' })
        setEditDialogOpen(true)
    }

    const handleSaveMacroInputMapping = () => {
        if (editingMacro) {
            onUpdateMacroInputMapping(editingMacro, editingInputType)
        }
        setEditDialogOpen(false)
        setEditingMacro('')
    }

    const handleInputTypeChange = (newType: string) => {
        // Create a new input type object based on the selected type
        const createInputType = (type: string): InputType => {
            switch (type) {
                case 'raw_rs2f':
                    return { type: 'raw_rs2f' } as RawRs2fInput
                case 'number':
                    return { type: 'number' } as NumberInput
                case 'boolean':
                    return { type: 'boolean' } as BooleanInput
                case 'list':
                    return {
                        type: 'list',
                        itemTypes: 'string',
                        allowCustomItems: true,
                    } as ListInput
                default:
                    return { type: 'raw_rs2f' } as RawRs2fInput
            }
        }
        setEditingInputType(createInputType(newType))
    }

    const updateInputTypeProperty = (property: string, value: any) => {
        setEditingInputType((prev) => ({
            ...prev,
            [property]: value,
        }))
    }

    const handleCancelEdit = () => {
        setEditDialogOpen(false)
        setEditingMacro('')
    }

    const filteredMacros = macroNames.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h6" component="h3">
                    Macro Mapping
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                }}
            >
                {/* Available Macros */}
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            All Macros ({filteredMacros.length})
                        </Typography>

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search macros..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Select Group</InputLabel>
                            <Select
                                value={selectedGroup}
                                onChange={(e) =>
                                    setSelectedGroup(e.target.value)
                                }
                                label="Select Group"
                            >
                                {sections.map((section) =>
                                    section.groups.map((group) => (
                                        <MenuItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {section.name} - {group.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        {!selectedGroup && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mb: 2,
                                    textAlign: 'center',
                                }}
                            >
                                Select a group above to add/remove macros
                            </Typography>
                        )}

                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {filteredMacros.map((macroName) => {
                                const isInSelectedGroup = selectedGroup
                                    ? isMacroInGroup(macroName, selectedGroup)
                                    : false
                                const mappedGroups =
                                    getGroupsForMacro(macroName)
                                const isUnmapped = mappedGroups.length === 0

                                return (
                                    <ListItem
                                        key={macroName}
                                        disablePadding
                                        secondaryAction={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <Tooltip title="Edit Macro Configuration">
                                                    <IconButton
                                                        className="edit-icon"
                                                        size="medium"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleEditMacroInputMapping(
                                                                macroName
                                                            )
                                                        }}
                                                        sx={{
                                                            opacity: 0,
                                                            transition:
                                                                'opacity 0.2s ease-in-out',
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {selectedGroup && (
                                                    <Tooltip
                                                        title={
                                                            isInSelectedGroup
                                                                ? 'Remove from Group'
                                                                : 'Add to Group'
                                                        }
                                                    >
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleToggleMacroInGroup(
                                                                    macroName
                                                                )
                                                            }}
                                                            color={
                                                                isInSelectedGroup
                                                                    ? 'error'
                                                                    : 'primary'
                                                            }
                                                        >
                                                            {isInSelectedGroup ? (
                                                                <DeleteIcon />
                                                            ) : (
                                                                <AddIcon />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            '&:hover .edit-icon': {
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() =>
                                                handleEditMacroInputMapping(
                                                    macroName
                                                )
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Typography variant="body2">
                                                            {macroName}
                                                        </Typography>
                                                        {isInSelectedGroup && (
                                                            <Chip
                                                                label="In Selected Group"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                        {!isUnmapped &&
                                                            !isInSelectedGroup && (
                                                                <Chip
                                                                    label={`Mapped to ${mappedGroups.length} group${mappedGroups.length > 1 ? 's' : ''}`}
                                                                    size="small"
                                                                    color="info"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        {macroInputMappings[
                                                            macroName
                                                        ] && (
                                                            <Chip
                                                                label={getInputTypeDisplayName(
                                                                    macroInputMappings[
                                                                        macroName
                                                                    ]
                                                                )}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="caption">
                                                        {availableMacros[
                                                            macroName
                                                        ] || 'No value'}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                        </List>

                        {filteredMacros.length === 0 && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 2 }}
                            >
                                {searchTerm
                                    ? 'No macros match your search'
                                    : 'No macros available'}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Edit Macro Input Mapping Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCancelEdit}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Configure Input Type: {editingMacro}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Current Macro Value Display */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Current Value:
                            </Typography>
                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {availableMacros[editingMacro] ||
                                        'No value'}
                                </Typography>
                            </Box>
                        </Box>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Input Type</InputLabel>
                            <Select
                                value={editingInputType.type}
                                onChange={(e) =>
                                    handleInputTypeChange(e.target.value)
                                }
                                label="Input Type"
                            >
                                {getInputTypeNames().map((inputType) => (
                                    <MenuItem
                                        key={inputType.value}
                                        value={inputType.value}
                                    >
                                        {inputType.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider sx={{ mb: 3 }} />

                        {/* Input Type Specific Configuration */}
                        {editingInputType.type === 'raw_rs2f' && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    Raw RS2F Configuration
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Raw RS2F inputs accept a string value only.
                                </Typography>
                            </Box>
                        )}

                        {editingInputType.type === 'number' && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    Number Input Configuration
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Number inputs accept numeric values only.
                                </Typography>
                            </Box>
                        )}

                        {editingInputType.type === 'boolean' && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    Boolean Input Configuration
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Boolean inputs accept true/false values
                                    only.
                                </Typography>
                            </Box>
                        )}

                        {editingInputType.type === 'list' && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Typography variant="subtitle2">
                                    List Input Configuration
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    List inputs allow users to select from
                                    predefined options or enter custom values.
                                </Typography>

                                {/* Item Type Selection */}
                                <Box sx={{ mt: 2 }}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Item Type</InputLabel>
                                        <Select
                                            value={
                                                (editingInputType as ListInput)
                                                    .itemTypes
                                            }
                                            onChange={(e) =>
                                                updateInputTypeProperty(
                                                    'itemTypes',
                                                    e.target.value
                                                )
                                            }
                                            label="Item Type"
                                        >
                                            <MenuItem value="string">
                                                String
                                            </MenuItem>
                                            <MenuItem value="number">
                                                Number
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Allow Custom Items Toggle */}
                                <Box sx={{ mt: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    (
                                                        editingInputType as ListInput
                                                    ).allowCustomItems
                                                }
                                                onChange={(e) =>
                                                    updateInputTypeProperty(
                                                        'allowCustomItems',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Allow custom values (users can enter values not in the list)"
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button
                        onClick={handleSaveMacroInputMapping}
                        variant="contained"
                    >
                        Save Configuration
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
