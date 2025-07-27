import { TextField, Typography } from '@mui/material'
import {
    FilterConfiguration,
    TextInput,
    Theme,
} from '@loot-filters/models'

export const TextInputComponent: React.FC<{
    input: TextInput
    config: FilterConfiguration
    theme?: Theme
    onChange: (str: string) => void
    readonly: boolean
}> = ({ input, config, theme, onChange, readonly }) => {
    const userConfigValue = config?.inputConfigs?.[input.macroName]
    const currentSetting =
        userConfigValue ??
        theme?.config?.inputConfigs?.[input.macroName] ??
        input?.default

    return (
        <div>
            <Typography variant="h6" color="primary">
                {input.label}
            </Typography>
            <TextField
                disabled={readonly}
                value={currentSetting}
                onChange={(event) => {
                    const value = event.target.value
                    onChange(value)
                }}
                fullWidth
            />
        </div>
    )
}
