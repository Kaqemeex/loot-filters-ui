import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface InfoDialogStore {
    show: boolean
    content: React.ReactNode
    setShow: (show: boolean) => void
    setContent: (content: React.ReactNode) => void
}

export const useInfoDialogStore = create<InfoDialogStore>()(
    devtools((set) => ({
        show: false,
        content: undefined,
        setShow: (show) => set(() => ({ show })),
        setContent: (content) => set(() => ({ content })),
    }))
)
