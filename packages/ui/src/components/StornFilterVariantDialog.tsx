import {
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid2,
    Typography,
} from '@mui/material'
import React from 'react'

export const IRON_FILTER =
    'https://raw.githubusercontent.com/Storn42/Iron-Filter/refs/heads/main/Iron-Filter.rs2f'
export const IRON_FILTER_BLANK =
    'https://raw.githubusercontent.com/Storn42/Iron-Filter/refs/heads/main/Iron-Filter-Blank.rs2f'
export const STORN_FILTER =
    'https://raw.githubusercontent.com/Storn42/Storn-Filter/refs/heads/main/filter.rs2f'

interface StornFilterVariantDialogProps {
    open: boolean
    onClose: () => void
    onSelect: (url: string) => void
    loading: boolean
}

export const StornFilterVariantDialog: React.FC<
    StornFilterVariantDialogProps
> = ({ open, onClose, onSelect, loading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Typography fontSize="32px">Choose a variant</Typography>
            </DialogTitle>
            <DialogContent>
                <Grid2
                    container
                    spacing={2}
                    justifyContent="center"
                    display="flex"
                >
                    <Grid2 size={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontSize="28px"
                                    component="div"
                                >
                                    Main Filter
                                </Typography>
                                <Typography variant="subtitle2">
                                    by Storn42
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '20px',
                                        minHeight: '3lh',
                                    }}
                                >
                                    Storn's main filter for all players.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="main-action"
                                    disabled={loading}
                                    onClick={() => onSelect(STORN_FILTER)}
                                >
                                    Select this filter
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid2>
                    <Grid2 size={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontSize="28px"
                                    component="div"
                                >
                                    Iron Filter
                                </Typography>
                                <Typography variant="subtitle2">
                                    by Storn42
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '20px',
                                        minHeight: '3lh',
                                    }}
                                >
                                    A full-featured loot filter designed for
                                    iron men.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="main-action"
                                    disabled={loading}
                                    onClick={() => onSelect(IRON_FILTER)}
                                >
                                    Select this filter
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid2>
                    <Grid2 size={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontSize="28px"
                                    component="div"
                                >
                                    Iron Filter (Blank)
                                </Typography>
                                <Typography variant="subtitle2">
                                    by Storn42
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '20px',
                                        minHeight: '3lh',
                                    }}
                                >
                                    Iron Filter with a blank slate — all
                                    settings cleared for full customization.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="main-action"
                                    disabled={loading}
                                    onClick={() => onSelect(IRON_FILTER_BLANK)}
                                >
                                    Select this filter
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid2>
                </Grid2>
            </DialogContent>
        </Dialog>
    )
}
