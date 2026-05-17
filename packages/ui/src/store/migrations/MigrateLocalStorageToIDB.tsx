import { CircularProgress, Typography } from '@mui/material'
import { useEffect } from 'react'
import { idbStorage } from '../idbStorage'

const ZUSTAND_LS_KEYS = [
    'filter-store',
    'filter-configuration-store',
    'editor-content',
    'onboarding-complete',
    'background-image-selected',
    'feature-flags',
]

export const requiresLocalStorageMigration = (): boolean => {
    if (localStorage.getItem('idb-migration-done')) return false
    return ZUSTAND_LS_KEYS.some((key) => localStorage.getItem(key) !== null)
}

export const MigrateLocalStorageToIDB: React.FC = () => {
    useEffect(() => {
        const run = async () => {
            for (const key of ZUSTAND_LS_KEYS) {
                const raw = localStorage.getItem(key)
                if (raw !== null) {
                    await idbStorage.setItem(key, JSON.parse(raw))
                    localStorage.removeItem(key)
                }
            }
            localStorage.setItem('idb-migration-done', 'true')
            window.location.reload()
        }
        run()
    }, [])

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <div>
                <Typography variant="h6" color="primary">
                    Upgrading storage... <CircularProgress />
                </Typography>
                <Typography variant="h6" color="primary">
                    Page will reload when done.
                </Typography>
            </div>
        </div>
    )
}
