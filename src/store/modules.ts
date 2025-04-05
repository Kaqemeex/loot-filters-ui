import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { UiFilterModule } from '../types/ModularFilterSpec'

interface ModuleStoreState {
    modules: UiFilterModule[]
    setModule: (moudle: UiFilterModule) => void
    removeModule: (id: string) => void
    backfill: (modules: UiFilterModule[]) => void
}

export const useModuleStore = create<ModuleStoreState>()(
    devtools(
        persist(
            (set) => {
                return {
                    modules: [],
                    backfill: (modules: UiFilterModule[]) => {
                        set((state) => {
                            return {
                                ...state,
                                modules: [...state.modules, ...modules],
                            }
                        })
                    },
                    setModule: (module: UiFilterModule) =>
                        set((state) => {
                            const newMoudles = [
                                ...state.modules.filter(
                                    (m) => m.id !== module.id
                                ),
                                module,
                            ]
                            return { ...state, modules: newMoudles }
                        }),
                    removeModule: (id: string) =>
                        set((state) => {
                            return {
                                ...state,
                                modules: state.modules.filter(
                                    (m) => m.id !== id
                                ),
                            }
                        }),
                }
            },
            { name: 'ui-filter-modules' }
        )
    )
)
