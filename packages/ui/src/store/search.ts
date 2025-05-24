import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface SearchStore {
    search: string
    setSearch: (search: string) => void
}

export const useSearchStore = create<SearchStore>()(
    devtools((set) => ({
        search: '',
        setSearch: (search) => set((_) => ({ search })),
    }))
)
