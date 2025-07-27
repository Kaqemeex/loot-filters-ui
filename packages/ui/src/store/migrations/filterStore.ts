import { Filter, parseAsync as parse } from '@loot-filters/models'
import { FilterStoreState } from '../filterStore'
import { legacyFilterUrls } from './MigrateLegacyData'

export const migrateFilterStore = async (
    state: FilterStoreState,
    version: number
) => {
    let updated = { ...state }
    if (version < 2) {
        toV2(updated)
    }

    if (version < 3) {
        await toV3(updated)
    }

    if (version < 4) {
        await toV4(updated)
    }
    return updated
}

/**
 * Corrects the missing source url in filters in the store, copies the source url from the legacy data
 */

const toV2 = (state: FilterStoreState) => {
    const data = JSON.parse(
        localStorage.getItem('modular-filter-storage') ?? '{}'
    )
    const filters = Object.values(data.state.importedModularFilters)

    filters.forEach(({ id, source: { owner, repo } }: any) => {
        const url = legacyFilterUrls[`${owner}:${repo}`]
        if (!url) {
            return
        }

        state.filters[id] = {
            ...state.filters[id],
            source: url,
        }
    })
}

/**
 * We moved back to having the rs2f stored on each module (though the whole thing also remains on the filter)
 */
const toV3 = async (state: FilterStoreState) => {
    const updatedFilters = await Promise.all(
        Object.values(state.filters).map(async (filter: Filter) => {
            const parsed = await parse(filter.rs2f, true)

            if (parsed.errors) {
                console.error(parsed.errors)
                throw Error('Error parsing filter during migration')
            }

            const updatedFilter = { ...parsed.filter!! }

            // Preserve certain fields off the original
            // Ensures configurations still map correctly
            updatedFilter.id = filter.id
            // User can edit these
            updatedFilter.active = filter.active
            updatedFilter.name = filter.name
            updatedFilter.description = filter.description

            // We parsed from raw text- no url; so copy over source & date
            updatedFilter.source = filter.source
            updatedFilter.importedOn = filter.importedOn
            // preserve original hash so that we don't immediately re-check for an
            //  update for a filter that doesn't start with a module declaration.
            updatedFilter.rs2fHash = filter.rs2fHash

            return updatedFilter
        })
    )

    state.filters = Object.fromEntries(
        updatedFilters.map((filter) => [filter.id, filter])
    )
}

const toV4 = async (state: FilterStoreState) => {
    const updatedFilters = await Promise.all(
        Object.values(state.filters).map(async (filter: Filter) => {
            const parsed = await parse(filter.rs2f, true)

            if (parsed.errors) {
                console.error(parsed.errors)
                throw Error('Error parsing filter during migration')
            }

            const updatedFilter = { ...parsed.filter!! }

            // Preserve certain fields off the original
            // Ensures configurations still map correctly
            updatedFilter.id = filter.id
            // User can edit these
            updatedFilter.active = filter.active
            updatedFilter.name = filter.name
            updatedFilter.description = filter.description

            // We parsed from raw text- no url; so copy over source & date
            updatedFilter.source = filter.source
            updatedFilter.importedOn = filter.importedOn
            // preserve original hash so that we don't immediately re-check for an
            //  update for a filter that doesn't start with a module declaration.
            updatedFilter.rs2fHash = filter.rs2fHash

            return updatedFilter
        })
    )

    state.filters = Object.fromEntries(
        updatedFilters.map((filter) => [filter.id, filter])
    )
}
