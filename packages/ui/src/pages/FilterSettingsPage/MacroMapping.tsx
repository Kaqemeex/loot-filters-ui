import { Group } from '@loot-filters/core'
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
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
    groups: Group[]
    onAddMacroToGroup: (macroName: string, groupId: string) => void
    onRemoveMacroFromGroup: (macroName: string, groupId: string) => void
    onAddGroup: () => void
}

export const MacroMapping: React.FC<MacroMappingProps> = ({
    availableMacros,
    groups,
    onAddMacroToGroup,
    onRemoveMacroFromGroup,
    onAddGroup,
}) => {
    const [selectedGroup, setSelectedGroup] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')

    const macroNames = Object.keys(availableMacros)
    const filteredMacros = macroNames.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getMacrosInGroup = (groupId: string): string[] => {
        const group = groups.find((g) => g.id === groupId)
        return group?.macros || []
    }

    const getUnmappedMacros = (): string[] => {
        const allMappedMacros = groups.flatMap((group) => group.macros)
        return macroNames.filter((macro) => !allMappedMacros.includes(macro))
    }

    const handleAddMacroToGroup = (macroName: string) => {
        if (selectedGroup) {
            onAddMacroToGroup(macroName, selectedGroup)
        }
    }

    const handleRemoveMacroFromGroup = (macroName: string, groupId: string) => {
        onRemoveMacroFromGroup(macroName, groupId)
    }

    const unmappedMacros = getUnmappedMacros()
    const filteredUnmappedMacros = unmappedMacros.filter((name) =>
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
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={onAddGroup}
                    variant="outlined"
                >
                    Add Group
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                    gap: 3,
                }}
            >
                {/* Available Macros */}
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Available Macros ({filteredUnmappedMacros.length})
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
                                {groups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {filteredUnmappedMacros.map((macroName) => (
                                <ListItem
                                    key={macroName}
                                    disablePadding
                                    secondaryAction={
                                        <Tooltip title="Add to Group">
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={() =>
                                                    handleAddMacroToGroup(
                                                        macroName
                                                    )
                                                }
                                                disabled={!selectedGroup}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <DragIndicatorIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={macroName}
                                            secondary={
                                                availableMacros[macroName] ||
                                                'No value'
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>

                        {filteredUnmappedMacros.length === 0 && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 2 }}
                            >
                                {searchTerm
                                    ? 'No macros match your search'
                                    : 'All macros have been mapped to groups'}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                {/* Group Mappings */}
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Group Mappings
                        </Typography>

                        {groups.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: 'center', py: 2 }}
                            >
                                No groups created yet. Create a group to start
                                mapping macros.
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                {groups.map((group) => {
                                    const groupMacros = getMacrosInGroup(
                                        group.id
                                    )
                                    return (
                                        <Card
                                            key={group.id}
                                            variant="outlined"
                                            sx={{
                                                backgroundColor: 'action.hover',
                                            }}
                                        >
                                            <CardContent sx={{ p: 2 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Typography variant="subtitle2">
                                                        {group.name}
                                                    </Typography>
                                                    <Chip
                                                        label={`${groupMacros.length} macros`}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                                {group.description && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: 'block',
                                                            mb: 1,
                                                        }}
                                                    >
                                                        {group.description}
                                                    </Typography>
                                                )}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    {groupMacros.map(
                                                        (macroName) => (
                                                            <Chip
                                                                key={macroName}
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
                                                {groupMacros.length === 0 && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        No macros assigned to
                                                        this group
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
