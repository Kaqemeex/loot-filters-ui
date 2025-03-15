import { mapObject } from 'underscore'
import { create, StateCreator, StoreApi, useStore } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Input, InputDefault, MacroName } from '../types/InputsSpec'
import {
    FilterId,
    ModularFilterConfigurationV2,
    ModuleId,
    UiModularFilter,
} from '../types/ModularFilterSpec'
import { SiteConfig } from '../types/SiteConfig'

export interface ImportedFilterSlice {
    importedModularFilters: Record<string, UiModularFilter>
    addImportedModularFilter: (filter: UiModularFilter) => void
    removeImportedModularFilter: (filterId: FilterId) => void
    setActiveFilterId: (filterId: FilterId) => void
}

export interface FilterConfigurationSlice {
    filterConfigurations: { [key: FilterId]: ModularFilterConfigurationV2 }
    setEnabledModule: (
        filterId: FilterId,
        moduleId: ModuleId,
        enabled: boolean
    ) => void
    setFilterConfiguration: (
        filterId: FilterId,
        macroName: string,
        data: Partial<InputDefault<Input>>
    ) => void
    clearConfiguration: (filterId: FilterId, macros: string[]) => void
    addFilterConfiguration: (
        filterId: FilterId,
        config: ModularFilterConfigurationV2
    ) => void
}

const createImportedFilterSlice: StateCreator<
    ImportedFilterSlice & FilterConfigurationSlice,
    [],
    [],
    ImportedFilterSlice
> = (set) => ({
    importedModularFilters: {},
    addImportedModularFilter: (filter: UiModularFilter) =>
        set((state) => ({
            importedModularFilters: {
                ...state.importedModularFilters,
                [filter.id]: filter,
            },
        })),
    removeImportedModularFilter: (filterId: FilterId) =>
        set((state) => ({
            importedModularFilters: Object.fromEntries(
                Object.entries(state.importedModularFilters).filter(
                    ([key]) => key !== filterId
                )
            ),
            filterConfigurations: Object.fromEntries(
                Object.entries(state.filterConfigurations).filter(
                    ([key]) => key !== filterId
                )
            ),
        })),
    setActiveFilterId: (filterId: FilterId) =>
        set((state) => ({
            importedModularFilters: {
                ...mapObject(state.importedModularFilters, (filter) => ({
                    ...filter,
                    active: filter.id === filterId,
                })),
            },
        })),
})

const createFilterConfigurationSlice: StateCreator<
    FilterConfigurationSlice,
    [],
    [],
    FilterConfigurationSlice
> = (set) => ({
    filterConfigurations: {},
    setFilterConfiguration: (
        filterId: FilterId,
        macroName: string,
        data: Partial<InputDefault<Input>>
    ) => {
        set((state) => {
            let newConfig = data
            if (Array.isArray(data)) {
                // For arrays, replace the entire value
                newConfig = data
            } else if (typeof data === 'object' && data !== null) {
                const currentData =
                    state.filterConfigurations?.[filterId]?.inputConfigs?.[
                        macroName
                    ] ?? {}
                // For objects, merge with existing config
                newConfig = { ...(currentData as object), ...data }
            } else {
                // For primitives (string, number, boolean), use the value directly
                newConfig = data
            }

            return {
                filterConfigurations: {
                    ...state.filterConfigurations,
                    [filterId]: {
                        ...(state.filterConfigurations[filterId] ?? {}),
                        inputConfigs: {
                            ...(state.filterConfigurations[filterId]
                                ?.inputConfigs ?? {}),
                            [macroName]: newConfig,
                        },
                    },
                },
            } as Partial<FilterConfigurationSlice>
        })
    },
    addFilterConfiguration: (
        filterId: FilterId,
        config: ModularFilterConfigurationV2
    ) => {
        set((state) => ({
            filterConfigurations: {
                ...state.filterConfigurations,
                [filterId]: config,
            },
        }))
    },
    setEnabledModule: (
        filterId: FilterId,
        moduleId: ModuleId,
        enabled: boolean
    ) => {
        console.log('setEnabledModule', moduleId, enabled)
        set(
            (state) =>
                ({
                    filterConfigurations: {
                        ...state.filterConfigurations,
                        [filterId]: {
                            ...state.filterConfigurations[filterId],
                            enabledModules: {
                                ...(state.filterConfigurations[filterId]
                                    ?.enabledModules ?? {}),
                                [moduleId]: enabled,
                            },
                        },
                    },
                }) as Partial<FilterConfigurationSlice>
        )
    },
    clearConfiguration: (filterId: FilterId, macros: string[]) => {
        return set(
            (state) => ({
                ...state,
                filterConfigurations: {
                    ...state.filterConfigurations,
                    [filterId]: {
                        ...state.filterConfigurations[filterId],
                        inputConfigs: {
                            ...(state.filterConfigurations[filterId]
                                ?.inputConfigs ?? {}),
                            ...Object.fromEntries(
                                macros.map((macro) => {
                                    return [macro, {}]
                                })
                            ),
                        },
                    },
                },
            }),
            true
        )
    },
})

export interface DeleteFilterSlice {
    deleteFilter: (filterId: FilterId) => void
}

const createDeleteFilterSlice: StateCreator<
    ImportedFilterSlice & FilterConfigurationSlice & DeleteFilterSlice,
    [],
    [],
    DeleteFilterSlice
> = (set) => ({
    deleteFilter: (filterId: FilterId) =>
        set((state) => ({
            importedModularFilters: Object.fromEntries(
                Object.entries(state.importedModularFilters).filter(
                    ([key]) => key !== filterId
                )
            ),
            filterConfigurations: Object.fromEntries(
                Object.entries(state.filterConfigurations).filter(
                    ([key]) => key !== filterId
                )
            ),
        })),
})

export interface SiteConfigSlice {
    siteConfig: SiteConfig
    setSiteConfig: (config: Partial<SiteConfig>) => void
}

const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

const createSiteConfigSlice: StateCreator<
    SiteConfigSlice &
        ImportedFilterSlice &
        FilterConfigurationSlice &
        DeleteFilterSlice,
    [],
    [],
    SiteConfigSlice
> = (set) => ({
    siteConfig: {
        devMode: isLocal,
        isLocal: isLocal,
    },
    setSiteConfig: (config: Partial<SiteConfig>) =>
        set((state) => ({
            siteConfig: { ...state.siteConfig, ...config },
        })),
})

type V0PersistedState = Pick<SiteConfigSlice, 'siteConfig'> &
    Pick<ImportedFilterSlice, 'importedModularFilters'> &
    Pick<FilterConfigurationSlice, 'filterConfigurations'> &
    Pick<DeleteFilterSlice, 'deleteFilter'>

type V1PersistedState = Pick<SiteConfigSlice, 'siteConfig'> &
    Pick<ImportedFilterSlice, 'importedModularFilters'> & {
        filterConfigurations: {
            [key: FilterId]: ModularFilterConfigurationV2
        }
    }

const v0toV1Migration = (
    persistedState: V0PersistedState
): V1PersistedState => {
    console.log('Migrating v0 to v1', persistedState)

    const newState = {
        ...persistedState,
        filterConfigurations: {},
    }

    Object.entries(persistedState.filterConfigurations).forEach(
        ([filterId, config]) => {
            const enabledModules = Object.entries(config)
                .filter(([_, macros]) => {
                    return macros.enabled
                })
                .map(([moduleId]) => moduleId)

            const inputConfigs: {
                [key: MacroName]: Partial<InputDefault<Input>>
            }[] = Object.values(config).map((macros) => {
                return Object.entries(macros)
                    .map(
                        ([macroName, data]: [
                            MacroName,
                            Partial<InputDefault<Input>>,
                        ]) => {
                            return {
                                [macroName]: data,
                            }
                        }
                    )
                    .reduce((acc, curr) => {
                        return { ...acc, ...curr }
                    }, {})
            })

            ;(newState as V1PersistedState).filterConfigurations[filterId] = {
                enabledModules,
                inputConfigs: inputConfigs.reduce((acc, curr) => {
                    return { ...acc, ...curr }
                }, {}),
            } as unknown as ModularFilterConfigurationV2
        }
    )

    return newState as V1PersistedState
}

const migrate = (
    persistedState: unknown,
    version: number
): V1PersistedState => {
    let state = persistedState as any
    if (version <= 0) {
        state = v0toV1Migration(persistedState as unknown as V0PersistedState)
    }
    console.warn('No migration found for persisted state', persistedState)
    return state as V1PersistedState
}

const uiStore = create<
    SiteConfigSlice &
        ImportedFilterSlice &
        FilterConfigurationSlice &
        DeleteFilterSlice
>()(
    devtools(
        persist(
            (...a) => ({
                ...createSiteConfigSlice(...a),
                ...createImportedFilterSlice(...a),
                ...createFilterConfigurationSlice(...a),
                ...createDeleteFilterSlice(...a),
            }),
            {
                name: 'modular-filter-storage',
                version: 1,
                migrate,
            }
        )
    )
)

const createBoundedUseStore = ((store) => (selector) =>
    useStore(store, selector)) as <S extends StoreApi<unknown>>(
    store: S
) => {
    (): ExtractState<S>
    <T>(selector: (state: ExtractState<S>) => T): T
}

type ExtractState<S> = S extends { getState: () => infer X } ? X : never

export const useUiStore = createBoundedUseStore(uiStore)
