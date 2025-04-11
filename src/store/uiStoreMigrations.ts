import { GitHubFilterSource } from '../types/GitHubFilterSource'
import {
    EnumListInput,
    Input,
    InputConfig,
    MacroName,
    StringListInput,
} from '../types/InputsSpec'
import {
    FilterId,
    FilterSource,
    ModularFilterConfigurationV2,
} from '../types/ModularFilterSpec'
import { convertToListDiff } from '../utils/ListDiffUtils'
import {
    DeleteFilterSlice,
    FilterConfigurationSlice,
    ImportedFilterSlice,
    SiteConfigSlice,
} from './store'

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

type V2PersistedState = Pick<SiteConfigSlice, 'siteConfig'> &
    ImportedFilterSlice & {
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
                [key: MacroName]: InputConfig<Input>
            }[] = Object.values(config).map((macros) => {
                return Object.entries(macros)
                    .map(
                        ([macroName, data]: [
                            MacroName,
                            InputConfig<Input>,
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

const v1toV2Migration = (
    persistedState: V1PersistedState
): V2PersistedState => {
    console.log('Migrating v1 to v2', persistedState)
    const persistedInputConfigs = persistedState.importedModularFilters

    const newInputConfigs = Object.entries(
        persistedState.filterConfigurations
    ).map(([filterId, config]) => {
        const newConfig = Object.entries(config.inputConfigs).map(
            ([macroName, config]) => {
                if (Array.isArray(config)) {
                    const input = persistedInputConfigs[filterId].modules
                        .map((module) => module.inputs)
                        .flat()
                        .find((input) => {
                            return (
                                input.macroName === macroName ||
                                Object.values(input.macroName).includes(
                                    macroName
                                )
                            )
                        }) as StringListInput | EnumListInput

                    const listDiff = convertToListDiff(
                        config as string[],
                        input.default
                    )

                    return [macroName, listDiff]
                }
                return [macroName, config]
            }
        )
        return [
            filterId,
            {
                ...config,
                inputConfigs: Object.fromEntries(newConfig),
            },
        ]
    })

    return {
        ...persistedState,
        filterConfigurations: {
            ...Object.fromEntries(newInputConfigs),
        },
    } as unknown as V2PersistedState
}

type V3PersistedState = V2PersistedState

const v2toV3Migration = (
    persistedState: V2PersistedState
): V3PersistedState => {
    console.log('Migrating v2 to v3', persistedState)

    const rebuildSource = (
        source: FilterSource | undefined
    ): FilterSource | undefined => {
        if (!source) {
            return undefined
        }

        if (!('filterUrl' in source)) {
            return source
        }

        const url = source.filterUrl
        const urlObj = new URL(url)
        if (urlObj.host !== 'raw.githubusercontent.com') {
            return source
        }

        // https://raw.githubusercontent.com/riktenx/filterscape/c60bafc2caa3ad7f64b26a2377151ad51ac509d7/index.json

        const pathParts = urlObj.pathname.split('/')
        const owner = pathParts[1]
        const repo = pathParts[2]
        let branch = 'main'
        let filterPath = undefined
        if (pathParts[3].length === 40) {
            // it's a hash
            branch = 'main'
            filterPath = pathParts.slice(4).join('/')
        } else if (pathParts[3] === 'refs' && pathParts[4] === 'heads') {
            branch = pathParts[5]
            filterPath = pathParts.slice(6).join('/')
        } else {
            return source
        }

        const gh: GitHubFilterSource = {
            owner,
            repo,
            branch,
            filterPath,
            updateMeta: {
                updatedAt: new Date(0).toISOString(),
                sha: 'noSha',
            },
        }

        return gh
    }

    return {
        ...persistedState,
        importedModularFilters: Object.fromEntries(
            Object.entries(persistedState.importedModularFilters).map(
                ([filterId, filter]) => {
                    return [
                        filterId,
                        { ...filter, source: rebuildSource(filter.source) },
                    ]
                }
            )
        ),
    } as V3PersistedState
}

export const migrate = (
    persistedState: unknown,
    version: number
): V1PersistedState => {
    let state = persistedState as any
    try {
        if (version <= 0) {
            state = v0toV1Migration(
                persistedState as unknown as V0PersistedState
            )
        }
        if (version <= 1) {
            state = v1toV2Migration(
                persistedState as unknown as V1PersistedState
            )
        }
        if (version <= 2) {
            state = v2toV3Migration(
                persistedState as unknown as V2PersistedState
            )
        }
    } catch (e) {
        console.error('Error migrating', e)
        throw e
    }

    return state as V1PersistedState
}
