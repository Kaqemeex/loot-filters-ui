import { Checkbox, Typography } from '@mui/material'
import {
    BooleanInput,
    BooleanInputDefaultSpec,
    FilterConfiguration,
    Theme,
} from '@loot-filters/models'

export const BooleanInputComponent: React.FC<{
    input: BooleanInput
    config: FilterConfiguration
    theme?: Theme
    onChange: (boolean: boolean) => void
    readonly: boolean
}> = ({ input, config, theme, onChange, readonly }) => {
    const currentSetting = BooleanInputDefaultSpec.parse(
        config?.inputConfigs?.[input.macroName] ??
            theme?.config?.inputConfigs?.[input.macroName] ??
            input.default
    )

    return (
        <div>
            <Typography variant="h6" color="primary">
                {input.label}
            </Typography>
            <Checkbox
                disabled={readonly}
                checked={currentSetting}
                onChange={(event) => {
                    const value = event.target.checked
                    onChange(value)
                }}
            />
        </div>
    )
}
