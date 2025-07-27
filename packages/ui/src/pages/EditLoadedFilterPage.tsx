import { FormControlLabel, Switch, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Rs2fEditor } from '../components/Rs2fEditor'
import { parse, parseModules, FilterConfiguration } from '@loot-filters/core'
import { useFilterConfigStore } from '../store/filterConfigurationStore'
import { useFilterStore } from '../store/filterStore'
import { colors } from '../styles/MuiTheme'
import { applyModule } from '@loot-filters/core'

const DOC_LINK_COMMENT =
    '// For docs visit https://github.com/Kaqemeex/loot-filters-ui/blob/main/module-system-docs/modular-filters-book/Readme.md'

const raise = (error: Error) => {
    throw error
}

export const EditorLoadedFilterPage: React.FC = () => {
    const { filterId } = useParams()
    const { filterConfigurations, setFilterConfiguration } =
        useFilterConfigStore()
    const { filters, updateFilter } = useFilterStore()
    const [searchParams] = useSearchParams()
    const initialFile = searchParams.get('initialFile')

    if (!filterId || !filters[filterId]) {
        return (
            <ErrorBoundary
                error={new Error(`Filter with id ${filterId} not found.`)}
            >
                <div>No filter id</div>
            </ErrorBoundary>
        )
    }

    const config = filterConfigurations[filterId]

    const defaultContent = {
        prefixRs2f:
            '/*@ define:module:prefix\nname: A Prefix Module\n*/\n' +
            DOC_LINK_COMMENT,
        suffixRs2f:
            '/*@ define:module:suffix\nname: A Suffix Module\n*/\n' +
            DOC_LINK_COMMENT,
    }

    const filesContent = {
        ...defaultContent,
        ...(config?.prefixRs2f ? { prefixRs2f: config.prefixRs2f } : {}),
        ...(config?.suffixRs2f ? { suffixRs2f: config.suffixRs2f } : {}),
        ...(filters[filterId] ? { filterRs2f: filters[filterId].rs2f } : {}),
    }

    const initialFileValid = [
        'filterRs2f',
        'prefixRs2f',
        'suffixRs2f',
    ].includes(initialFile || '')
    const [selected, setSelected] = useState<
        'filterRs2f' | 'prefixRs2f' | 'suffixRs2f'
    >(
        initialFileValid
            ? (initialFile as 'filterRs2f' | 'prefixRs2f' | 'suffixRs2f')
            : 'prefixRs2f'
    )
    const setContent = (id: string, content: string) => {
        if (id === 'filterRs2f') {
            const filter = parse(content, false, { name: 'update' })
            const newFilter = {
                ...filters[filterId],
                ...filter.filter,
                name: filters[filterId].name,
                id: filters[filterId].id,
                // ...(modules.modules ? { modules: modules.modules } : {}),
                rs2f: content,
            }
            updateFilter(newFilter)
        } else if (id === 'prefixRs2f' || id === 'suffixRs2f') {
            setFilterConfiguration(filterId, {
                ...config,
                [id]: content,
            })
        } else {
            // nothing
        }
    }

    const selectedModules =
        parseModules(filesContent[selected!!] || '')?.modules || []

    return (
        <Rs2fEditor
            selected={selected}
            setEditorContent={setContent}
            setSelected={setSelected as (selected: string | null) => void}
            filesContent={filesContent}
            configOnChange={(config: FilterConfiguration) => {
                const content: string | undefined = filesContent[selected!!]
                if (!content) {
                    return
                }
                if (selectedModules) {
                    const newContent = selectedModules
                        .map((m) => {
                            return applyModule(
                                m,
                                config.inputConfigs,
                                undefined
                            )
                        })
                        .join('')

                    setContent(selected, newContent)
                }
            }}
            warningComponent={
                <Typography variant="h5" color="error">
                    {selected === 'filterRs2f' && filters[filterId].source
                        ? 'Changes will not carry forward if filter updates'
                        : null}
                </Typography>
            }
            extraTabComponent={
                <div
                    style={{
                        width: '80%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Filter Name"
                        value={filters[filterId].name}
                        onChange={(e) => {
                            updateFilter({
                                ...filters[filterId],
                                name: e.target.value,
                            })
                        }}
                    />
                    <TextField
                        sx={{ ml: 2, width: '20rem' }}
                        label="Filter Description"
                        value={filters[filterId].description}
                        onChange={(e) => {
                            updateFilter({
                                ...filters[filterId],
                                description: e.target.value,
                            })
                        }}
                    />
                </div>
            }
            options={[
                { label: 'Prefix', value: 'prefixRs2f' },
                { label: 'Filter', value: 'filterRs2f' },
                { label: 'Suffix', value: 'suffixRs2f' },
            ]}
        />
    )
}
