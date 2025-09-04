import { Group, MacroInputMapping, Section } from '@loot-filters/core'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
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
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useState } from 'react'

interface MacroMappingProps {
    availableMacros: Record<string, string>
    sections: Section[]
    macroInputMappings: Record<string, MacroInputMapping>
    onAddMacroToGroup: (macroName: string, groupId: string) => void
    onRemoveMacroFromGroup: (macroName: string, groupId: string) => void
    onUpdateMacroInputMapping: (
        macroName: string,
        mapping: MacroInputMapping
    ) => void
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
    const [editingInputType, setEditingInputType] =
        useState<'raw_rs2f'>('raw_rs2f')

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
        setEditingInputType(currentMapping?.inputType || 'raw_rs2f')
        setEditDialogOpen(true)
    }

    const handleSaveMacroInputMapping = () => {
        if (editingMacro) {
            onUpdateMacroInputMapping(editingMacro, {
                macroName: editingMacro,
                inputType: editingInputType,
            })
        }
        setEditDialogOpen(false)
        setEditingMacro('')
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
                                            selectedGroup ? (
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
                                                        onClick={() =>
                                                            handleToggleMacroInGroup(
                                                                macroName
                                                            )
                                                        }
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
                                            ) : null
                                        }
                                    >
                                        <ListItemButton>
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
                                                    </Box>
                                                }
                                                secondary={
                                                    availableMacros[
                                                        macroName
                                                    ] || 'No value'
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
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Macro Input Type: {editingMacro}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Input Type</InputLabel>
                            <Select
                                value={editingInputType}
                                onChange={(e) =>
                                    setEditingInputType(
                                        e.target.value as 'raw_rs2f'
                                    )
                                }
                                label="Input Type"
                            >
                                <MenuItem value="raw_rs2f">Raw RS2F</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelEdit}>Cancel</Button>
                    <Button
                        onClick={handleSaveMacroInputMapping}
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
