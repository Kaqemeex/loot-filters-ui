import { useUiStore } from '../../store/store'
import { ListDiff, ListOption, StringListInput } from '../../types/InputsSpec'
import { FilterId, UiFilterModule } from '../../types/ModularFilterSpec'
import { applyDiff, convertToListDiff } from '../../utils/ListDiffUtils'
import { Option, UISelect } from './UISelect'

export const StringListInputComponent: React.FC<{
    activeFilterId: FilterId
    module: UiFilterModule
    input: StringListInput
}> = ({ activeFilterId, module, input }) => {
    const setFilterConfiguration = useUiStore(
        (state) => state.setFilterConfiguration
    )

    const activeConfig = useUiStore(
        (state) => state.filterConfigurations[activeFilterId]
    )

    const configuredDiff = activeConfig?.inputConfigs?.[input.macroName] as
        | ListDiff
        | undefined

    const currentValues = applyDiff(input.default, configuredDiff)

    const options: Option[] = input.default.map(
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
        <UISelect
            options={options}
            label={input.label}
            multiple={true}
            freeSolo={true}
            value={currentValues.map((value: string | ListOption) => {
                if (typeof value === 'string') {
                    const found = options.find((o) => o.value === value)
                    if (found) {
                        return found
                    }
                    return {
                        label: value,
                        value: value,
                    }
                }
                return value
            })}
            onChange={(newValue) => {
                const values = ((newValue as Option[]) || []).map(
                    (option) => option.value
                )
                setFilterConfiguration(
                    activeFilterId,
                    input.macroName,
                    convertToListDiff(values, input.default)
                )
            }}
        />
    )
}
