import { CircularProgress } from '@mui/material'

import { Typography } from '@mui/material'
import { useState } from 'react'
import { loadFilterFromUrl } from '../../utils/loaderv2'
import { useFilterConfigStore } from '../filterConfigurationStore'
import { useFilterStore } from '../filterStore'

export const legacyFilterUrls: Record<string, string> = {
    'riktenx:filterscape':
        'https://raw.githubusercontent.com/riktenx/filterscape/refs/heads/main/filter.rs2f',
    'typical-whack:loot-filters-modules':
        'https://raw.githubusercontent.com/typical-whack/loot-filters-modules/refs/heads/main/filter.rs2f',
    'Blooprnt:ClearLoot':
        'https://raw.githubusercontent.com/Blooprnt/ClearLoot/refs/heads/main/clearloot.rs2f',
}

const LAST_MIGRATION_DATE = '2025-04-19'
export const requiresMigration = () => {
    console.log('Checking for migration')
    const legacyData = localStorage.getItem('modular-filter-storage')

    if (!legacyData) {
        return false
    }

    const migrated = localStorage.getItem('modular-filter-storage-migrated')

    if (!migrated) {
        console.log('No migration date found, requiring migration')
        return true
    }

    console.log('Migration date found:', migrated)

    try {
        const date = Date.parse(migrated)
        if (date < new Date(LAST_MIGRATION_DATE).getTime() || isNaN(date)) {
            console.log(
                `Migration date is before ${LAST_MIGRATION_DATE}, requiring migration`
            )
            return true
        }
        return false
    } catch (error) {
        console.error('error checking for migration', error)
        return true
    }
}

export const MigrateLegacyData: React.FC = () => {
    console.log('Migrating legacy data')
    const { setFilterConfiguration } = useFilterConfigStore()
    const { filters, updateFilter } = useFilterStore()

    const data = localStorage.getItem('modular-filter-storage')!!
    const legacyData = JSON.parse(data).state

    const [migrationsStarted, setMigrationsStarted] = useState<string[]>([])

    Object.values(legacyData.importedModularFilters).forEach(
        ({ id, name, active, source }: any, index: number) => {
            let url = null
            if (typeof source === 'string') {
                url = source
            } else if (
                typeof source === 'object' &&
                source.owner &&
                source.repo
            ) {
                url = legacyFilterUrls[`${source.owner}:${source.repo}`]
            }

            if (!url || migrationsStarted.includes(id)) {
                return
            }

            setMigrationsStarted((prev) => [...prev, id])
            const configs = legacyData.filterConfigurations[id] ?? {}
            loadFilterFromUrl(url)
                .then((filter) => {
                    setMigrationsStarted((prev) =>
                        prev.filter((id) => id !== id)
                    )
                    // Only migrate if the filter doesn't exist yet
                    // to avoid overwriting any changes
                    if (filters[id] === undefined) {
                        updateFilter({ ...filter, id: id, name, active })
                        setFilterConfiguration(id, configs)
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
        }
    )

    const checkMigrations = () => {
        if (migrationsStarted.length === 0) {
            localStorage.setItem(
                'modular-filter-storage-migrated',
                new Date().toISOString()
            )
            window.location.reload()
        } else {
            setTimeout(checkMigrations, 1000)
        }
    }

    setTimeout(checkMigrations, 1000)

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <div>
                <Typography variant="h6" color="primary">
                    Legacy data detected, migrating...
                    <CircularProgress />
                </Typography>
                <Typography variant="h6" color="primary">
                    Page will reload when done.
                </Typography>
            </div>
        </div>
    )
}
