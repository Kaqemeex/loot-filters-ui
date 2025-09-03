import { Group } from '@loot-filters/core'
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
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material'

interface GroupManagementProps {
    groups: Group[]
    onAddGroup: () => void
    onEditGroup: (group: Group) => void
    onDeleteGroup: (groupId: string) => void
}

export const GroupManagement: React.FC<GroupManagementProps> = ({
    groups,
    onAddGroup,
    onEditGroup,
    onDeleteGroup,
}) => {
    return (
        <Box sx={{ ml: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="subtitle1">
                    Groups ({groups.length})
                </Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={onAddGroup}
                >
                    Add Group
                </Button>
            </Box>

            {groups.map((group) => (
                <Card
                    key={group.id}
                    sx={{
                        mb: 1,
                        backgroundColor: 'action.hover',
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle2">
                                    {group.name}
                                </Typography>
                                {group.description && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {group.description}
                                    </Typography>
                                )}
                                <Typography variant="caption" display="block">
                                    Macros: {group.macros.length}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Edit Group">
                                    <IconButton
                                        size="small"
                                        onClick={() => onEditGroup(group)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Group">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => onDeleteGroup(group.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}
