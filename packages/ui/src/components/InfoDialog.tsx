import React from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material'

import { useInfoDialogStore } from '../store/infoDialog'

export const InfoDialog: React.FC<{}> = () => {
    const { show, content, setShow } = useInfoDialogStore()
    return (
        <Dialog open={show} onClose={() => setShow(false)}>
            <DialogTitle>Info</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={() => setShow(false)}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export const InfoLink: React.FC<{
    content: React.ReactNode
    children: React.ReactNode
}> = ({ content, children }) => {
    const { setShow, setContent } = useInfoDialogStore()
    return (
        <span
            style={{ cursor: 'pointer' }}
            onClick={() => {
                setShow(true)
                setContent(content)
            }}
        >
            {children}
        </span>
    )
}
