import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { BackgroundImage } from '../types/Images'

interface BackgroundStoreState {
    background: BackgroundImage
    updateBackground: (background: BackgroundImage) => void
}

export const useBackgroundStore = create<BackgroundStoreState>()(
    devtools(
        persist(
            (set) => ({
                background: BackgroundImage.Default,
                updateBackground: (background) =>
                    set((state) => ({ background })),
            }),
            {
                name: 'background-image-selected',
                version: 1,
            }
        )
    )
)
