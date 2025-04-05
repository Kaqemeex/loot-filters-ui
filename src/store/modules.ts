import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { UiFilterModule } from '../types/ModularFilterSpec'

interface ModuleStoreState {
    modules: { [key: string]: UiFilterModule }
    setModule: (moudle: UiFilterModule) => void
    removeModule: (id: string) => void
    backfill: (modules: UiFilterModule[]) => void
}

export const useModuleStore = create<ModuleStoreState>()(
    devtools(
        persist(
            (set) => {
                return {
                    modules: {},
                    backfill: (modules: UiFilterModule[]) => {
                        set((state) => {
                            if (Object.keys(state.modules).length === 0) {
                                return {
                                    ...state,
                                    modules: Object.fromEntries(
                                        modules.map((module) => [
                                            module.id,
                                            module,
                                        ])
                                    ),
                                }
                            } else {
                                return state
                            }
                        })
                    },
                    setModule: (module: UiFilterModule) =>
                        set((state) => {
                            const newMoudles = { ...state.modules }
                            newMoudles[module.id] = module
                            return { ...state, modules: newMoudles }
                        }),
                    removeModule: (id: string) =>
                        set((state) => {
                            return {
                                ...state,
                                modules: Object.fromEntries(
                                    Object.entries(state.modules).filter(
                                        ([key]) => key !== id
                                    )
                                ),
                            }
                        }),
                }
            },
            { name: 'ui-filter-modules' }
        )
    )
)
