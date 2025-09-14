import { useState } from 'react'
import { FilterList } from '../../components/FilterList'
import { useListPublicFilters } from '../../utils/api'

export const PublicFiltersPage: React.FC = () => {
    const {
        data: filters,
        apiCall: fetchPublicFilters,
        isLoading: loading,
    } = useListPublicFilters()

    const [error, setError] = useState<string | null>(null)
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    if (!loading && !filters) {
        setError(null)

        fetchPublicFilters(undefined).catch((err) => {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to fetch public filters'
            )
        })
    }

    const handleToggleFavorite = (filterId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(filterId)) {
                newFavorites.delete(filterId)
            } else {
                newFavorites.add(filterId)
            }
            return newFavorites
        })
        // TODO: Implement actual favorite functionality with API
    }

    return (
        <FilterList
            filters={filters || undefined}
            loading={loading}
            error={error}
            title="Public Filters"
            subtitle="Discover and download filters created by the community"
            showFavorites={true}
            showDownload={true}
            emptyStateTitle="No public filters available"
            emptyStateDescription="Check back later for community-created filters"
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            gridColumns={{ xs: 1, md: 2, lg: 3 }}
        />
    )
}
