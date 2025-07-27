import {
    FilterConfiguration,
    NumberInput,
    NumberInputDefaultSpec,
    Theme,
} from '@loot-filters/models'
import { TextField, Typography } from '@mui/material'

export const NumberInputComponent: React.FC<{
    config: FilterConfiguration
    theme?: Theme
    input: NumberInput
    readonly: boolean
    onChange: (number: number) => void
}> = ({ config, theme, input, readonly, onChange }) => {
    const activeConfigValue = config?.inputConfigs?.[input.macroName]
    const userConfigValue =
        activeConfigValue || activeConfigValue === 0
            ? NumberInputDefaultSpec.optional().parse(activeConfigValue)
            : undefined

    const currentSetting =
        userConfigValue ??
        theme?.config?.inputConfigs?.[input.macroName] ??
        input.default

    return (
        <div>
            <Typography variant="h6" color="primary">
                {input.label}
            </Typography>
            <TextField
                disabled={readonly}
                type="text"
                value={(currentSetting || 0).toLocaleString('en-us')}
                onChange={(event) => {
                    const value = event.target.value
                    onChange(parseInt(value.replaceAll(',', '')) || 0)
                }}
            />
        </div>
    )
}
