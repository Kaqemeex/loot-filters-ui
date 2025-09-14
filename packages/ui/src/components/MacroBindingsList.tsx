import { MacroBinding } from '@loot-filters/core'
import {
    Code as CodeIcon,
    ContentCopy as CopyIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Collapse,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useState } from 'react'

interface MacroBindingsListProps {
    macroBindings: MacroBinding[]
    isLoading?: boolean
}

export const MacroBindingsList: React.FC<MacroBindingsListProps> = ({
    macroBindings,
    isLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedMacro, setExpandedMacro] = useState<string | null>(null)
    const [copiedMacro, setCopiedMacro] = useState<string | null>(null)

    const filteredBindings = macroBindings.filter(
        (binding) =>
            binding.macroName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (binding.value &&
                binding.value.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleExpandMacro = (macroName: string) => {
        setExpandedMacro(expandedMacro === macroName ? null : macroName)
    }

    const handleCopyMacro = async (
        macroName: string,
        value: string | undefined
    ) => {
        const textToCopy = value
            ? `#define ${macroName} ${value}`
            : `#define ${macroName}`
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopiedMacro(macroName)
            setTimeout(() => setCopiedMacro(null), 2000)
        } catch (err) {
            console.error('Failed to copy macro:', err)
        }
    }

    const getValueType = (value: string | undefined): string => {
        if (!value) return 'undefined'
        if (value === 'true' || value === 'false') return 'boolean'
        if (!isNaN(Number(value))) return 'number'
        if (value.startsWith('[') && value.endsWith(']')) return 'list'
        return 'string'
    }

    const getValueTypeColor = (
        type: string
    ):
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning' => {
        switch (type) {
            case 'boolean':
                return 'success'
            case 'number':
                return 'primary'
            case 'list':
                return 'info'
            case 'string':
                return 'default'
            case 'undefined':
                return 'error'
            default:
                return 'default'
        }
    }

    const formatValue = (value: string | undefined): string => {
        if (!value) return 'No value defined'
        if (value.length > 100) {
            return value.substring(0, 100) + '...'
        }
        return value
    }

    const formatValueForDisplay = (value: string | undefined): string => {
        if (!value) return 'No value defined'
        return value
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Macro Bindings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Loading macro bindings...
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    if (macroBindings.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Macro Bindings
                    </Typography>
                    <Alert severity="info">
                        No macro bindings found in this filter.
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h6" component="h3">
                        Macro Bindings ({filteredBindings.length})
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search macro bindings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {filteredBindings.map((binding, index) => {
                        const isExpanded = expandedMacro === binding.macroName
                        const valueType = getValueType(binding.value)
                        const isCopied = copiedMacro === binding.macroName

                        return (
                            <Box key={binding.macroName}>
                                <ListItem
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                        bgcolor: 'background.paper',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {binding.macroName}
                                                </Typography>
                                                <Chip
                                                    label={valueType}
                                                    size="small"
                                                    color={getValueTypeColor(
                                                        valueType
                                                    )}
                                                    variant="outlined"
                                                />
                                                {isCopied && (
                                                    <Chip
                                                        label="Copied!"
                                                        size="small"
                                                        color="success"
                                                        variant="filled"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mb: 1 }}
                                                >
                                                    {formatValue(binding.value)}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Tooltip title="Copy macro definition">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleCopyMacro(
                                                                    binding.macroName,
                                                                    binding.value
                                                                )
                                                            }
                                                        >
                                                            <CopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            isExpanded
                                                                ? 'Collapse details'
                                                                : 'Expand details'
                                                        }
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleExpandMacro(
                                                                    binding.macroName
                                                                )
                                                            }
                                                        >
                                                            {isExpanded ? (
                                                                <ExpandLessIcon />
                                                            ) : (
                                                                <ExpandMoreIcon />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItem>

                                <Collapse
                                    in={isExpanded}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <Box sx={{ ml: 2, mr: 2, mb: 2 }}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ p: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        mb: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <CodeIcon fontSize="small" />
                                                    Full Definition
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor:
                                                            'grey.100',
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'grey.300',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.875rem',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                    }}
                                                >
                                                    {formatValueForDisplay(
                                                        binding.value
                                                    )}
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 1,
                                                        display: 'block',
                                                    }}
                                                >
                                                    Type: {valueType} | Length:{' '}
                                                    {binding.value?.length || 0}{' '}
                                                    characters
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Collapse>

                                {index < filteredBindings.length - 1 && (
                                    <Divider sx={{ my: 1 }} />
                                )}
                            </Box>
                        )
                    })}
                </List>

                {filteredBindings.length === 0 && searchTerm && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No macro bindings match your search term "{searchTerm}".
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}
