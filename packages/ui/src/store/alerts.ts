import { AlertProps } from '@mui/material'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AlertStoreState {
    alerts: AlertProps[]
    addAlert: (alert: AlertProps) => void
    removeAlert: (index: number) => void
}

export const useAlertStore = create<AlertStoreState>()(
    devtools((set) => ({
        alerts: [],
        addAlert: (alert) =>
            set((state) => ({ alerts: [...state.alerts, alert] })),
        removeAlert: (alert_index) =>
            set((state) => ({
                alerts: state.alerts.filter((_, i) => i !== alert_index),
            })),
    }))
)
