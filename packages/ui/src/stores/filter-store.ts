import { Filter, FilterVersion } from '@loot-filters/core'
import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { create } from 'zustand'
import { useListFilterVersions, useReadFilter } from '../utils/api'

export type FilterState = {
    currentFilter: Filter | null
    isLoadingFilter: boolean

    currentFilterVersions: FilterVersion[] | null
    isLoadingFilterVersions: boolean
}

type FilterActions = {
    setCurrentFilter: (filter: Filter | null) => void
    setLoadingFilter: (loading: boolean) => void

    setFilterVersions: (versions: FilterVersion[] | null) => void
    setLoadingFilterVersions: (loading: boolean) => void
}

export type FilterStore = FilterState & FilterActions

const useFilterStore = create<FilterStore>()((set, get) => ({
    currentFilter: null,
    isLoadingFilter: false,
    currentFilterVersions: null,
    isLoadingFilterVersions: false,

    setCurrentFilter: (filter: Filter | null) => {
        set({
            currentFilter: filter,
        })
    },
    setLoadingFilter: (loading: boolean) => {
        set({ isLoadingFilter: loading })
    },
    getFilter: () => {
        return get().currentFilter
    },

    setFilterVersions: (versions: FilterVersion[] | null) => {
        set({ currentFilterVersions: versions })
    },
    setLoadingFilterVersions: (loading: boolean) => {
        set({ isLoadingFilterVersions: loading })
    },
    getFilterVersions: () => {
        return get().currentFilterVersions
    },
}))

export const useFilterFromRouteStore = () => {
    const { filterId: pathFilterId } = useParams<{ filterId: string }>()
    const store = useFilterStore()
    const readFilter = useReadFilter()
    const listFilterVersions = useListFilterVersions()

    const loadData = useCallback(async () => {
        store.setLoadingFilter(true)
        store.setLoadingFilterVersions(true)
        await Promise.all([
            readFilter.apiCall({ filterId: pathFilterId! }),
            listFilterVersions.apiCall({ filterId: pathFilterId! }),
        ]).then(([filter, versions]) => {
            store.setCurrentFilter(filter)
            store.setFilterVersions(versions)
            store.setLoadingFilter(false)
            store.setLoadingFilterVersions(false)
        })
    }, [readFilter, listFilterVersions, pathFilterId])

    const ret = {
        isLoadingFilter: store.isLoadingFilter,
        isLoadingFilterVersions: store.isLoadingFilterVersions,
        filter: store.currentFilter,
        versions: store.currentFilterVersions,
        isLoading: store.isLoadingFilter || store.isLoadingFilterVersions,
        forceLoadData: loadData,
    }

    if (store.isLoadingFilter || store.isLoadingFilterVersions) {
        return ret
    }

    if (pathFilterId && pathFilterId !== store.currentFilter?.filterId) {
        loadData()
    }

    if (!pathFilterId && store.currentFilter?.filterId) {
        store.setCurrentFilter(null)
        store.setFilterVersions(null)
    }

    return ret
}
