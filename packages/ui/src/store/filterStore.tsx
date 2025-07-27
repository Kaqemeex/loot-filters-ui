import { Filter } from '@loot-filters/models'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { migrateFilterStore } from './migrations/filterStore'

export interface FilterStoreState {
    filters: Record<string, Filter>
    updateFilter: (filter: Filter) => void
    removeFilter: (filterId: string) => void
    setActiveFilter: (filterId: string) => void
}

export const useFilterStore = create<FilterStoreState>()(
    devtools(
        persist(
            (set) => {
                return {
                    filters: {},
                    updateFilter: (filter) =>
                        set((state) => ({
                            filters: {
                                ...state.filters,
                                [filter.id]: filter,
                            },
                        })),
                    removeFilter: (filterId: string) =>
                        set((state) => ({
                            filters: Object.fromEntries(
                                Object.entries(state.filters).filter(
                                    ([key]) => key !== filterId
                                )
                            ),
                        })),
                    setActiveFilter: (filterId: string) =>
                        set((state) => ({
                            filters: Object.fromEntries(
                                Object.entries(state.filters).map(
                                    ([key, filter]) => [
                                        key,
                                        {
                                            ...filter,
                                            active: key === filterId,
                                        },
                                    ]
                                )
                            ),
                        })),
                }
            },
            {
                name: 'filter-store',
                version: 4,
                migrate: async (state: unknown, version: number) => {
                    return await migrateFilterStore(
                        state as FilterStoreState,
                        version
                    )
                },
            }
        )
    )
)
