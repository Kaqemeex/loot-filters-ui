import { Box } from '@mui/material'
import { useUiStore } from '../../store/store'
import { IncludeExcludeListInput, ListOption } from '../../types/InputsSpec'
import { FilterId, UiFilterModule } from '../../types/ModularFilterSpec'
import { Option, UISelect } from './UISelect'

export const IncludeExcludeListInputComponent: React.FC<{
    activeFilterId: FilterId
    module: UiFilterModule
    input: IncludeExcludeListInput
}> = ({ activeFilterId, module, input }) => {
    const setFilterConfiguration = useUiStore(
        (state) => state.setFilterConfiguration
    )

    const activeConfig = useUiStore(
        (state) => state.filterConfigurations[activeFilterId]
    )

    const currentIncludes =
        (activeConfig?.inputConfigs?.[input.macroName.includes] as
            | string[]
            | undefined) ?? input.default.includes
    const currentExcludes =
        (activeConfig?.inputConfigs?.[input.macroName.excludes] as
            | string[]
            | undefined) ?? input.default.excludes

    const includeOptions: Option[] = input.default.includes.map(
        (option: string | ListOption) => {
            if (typeof option === 'string') {
                return {
                    label: option,
                    value: option,
                }
            }
            return option
        }
    )

    const excludeOptions: Option[] = input.default.excludes.map(
        (option: string | ListOption) => {
            if (typeof option === 'string') {
                return {
                    label: option,
                    value: option,
                }
            }
            return option
        }
    )

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <UISelect
                options={includeOptions}
                label={`${input.label} includes`}
                multiple={true}
                freeSolo={true}
                value={currentIncludes.map((include: string | ListOption) => {
                    if (typeof include === 'string') {
                        const found = includeOptions.find(
                            (o) => o.value === include
                        )
                        if (found) {
                            return found
                        }
                        return {
                            label: include,
                            value: include,
                        }
                    }
                    return include
                })}
                onChange={(newValue) => {
                    const includes = ((newValue as Option[]) || []).map(
                        (option) => option.value
                    )
                    setFilterConfiguration(
                        activeFilterId,
                        input.macroName.includes,
                        includes
                    )
                }}
            />
            <UISelect
                options={excludeOptions}
                label={`${input.label} excludes`}
                multiple={true}
                freeSolo={true}
                value={currentExcludes.map((exclude: string | ListOption) => {
                    if (typeof exclude === 'string') {
                        const found = excludeOptions.find(
                            (o) => o.value === exclude
                        )
                        if (found) {
                            return found
                        }
                        return {
                            label: exclude,
                            value: exclude,
                        }
                    }
                    return exclude
                })}
                onChange={(newValue) => {
                    const excludes = ((newValue as Option[]) || []).map(
                        (option) => option.value
                    )
                    setFilterConfiguration(
                        activeFilterId,
                        input.macroName.excludes,
                        excludes
                    )
                }}
            />
        </Box>
    )
}
