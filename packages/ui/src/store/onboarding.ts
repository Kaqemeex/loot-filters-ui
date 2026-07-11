import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { idbStorage } from './idbStorage'

interface OnboardingStoreState {
    onboardingComplete: boolean
    disableExportDialog: boolean
    setOnboardingComplete: (onboardingComplete: boolean) => void
    setDisableExportDialog: (disable: boolean) => void
}

export const useOboardingStore = create<OnboardingStoreState>()(
    devtools(
        persist(
            (set) => ({
                onboardingComplete: false,
                disableExportDialog: false,
                setOnboardingComplete: (onboardingComplete) =>
                    set((_) => ({ onboardingComplete })),
                setDisableExportDialog: (disableExportDialog) =>
                    set((_) => ({ disableExportDialog })),
            }),
            {
                name: 'onboarding-complete',
                version: 1,
                storage: idbStorage,
                partialize: ({
                    onboardingComplete,
                    disableExportDialog,
                }: OnboardingStoreState) => ({
                    onboardingComplete,
                    disableExportDialog,
                }),
            }
        )
    )
)
