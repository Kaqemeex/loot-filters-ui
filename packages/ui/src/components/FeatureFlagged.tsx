import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { idbStorage } from '../store/idbStorage'

export const FLAG_NAMES = ['themes'] as const

type FlagName = (typeof FLAG_NAMES)[number]

export interface FeatureFlaggedStore {
    themes: boolean
    checkFeatureFlag: (featureFlag: FlagName) => boolean
    setFeatureFlag: (featureFlag: FlagName, value: boolean) => void
}

export const useFeatureFlagStore = create<FeatureFlaggedStore>()(
    devtools(
        persist(
            (set, get) => ({
                themes: false,
                checkFeatureFlag: (featureFlag: FlagName) => {
                    return get()[featureFlag] ?? false
                },
                setFeatureFlag: (featureFlag: FlagName, value: boolean) => {
                    set((state) => ({
                        ...state,
                        [featureFlag]: value,
                    }))
                },
            }),
            {
                name: 'feature-flags',
                version: 1,
                storage: idbStorage,
            }
        )
    )
)

export const FeatureFlagged: React.FC<{
    featureFlag: FlagName
    children: React.ReactNode
}> = ({ featureFlag, children }) => {
    const isEnabled = useFeatureFlagStore
        .getState()
        .checkFeatureFlag(featureFlag)

    if (!isEnabled) {
        return null
    }

    return <>{children}</>
}
