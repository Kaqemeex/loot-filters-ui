import { Autocomplete, SxProps, TextField, Theme } from '@mui/material'
import React from 'react'

export interface Option<T = string> {
    label: string
    value: T
}

type UISelectPropsBase<T> = {
    options: Option<T>[]
    label?: string
    freeSolo?: boolean
    disabled?: boolean
    error?: boolean
    helperText?: string
    disableClearable?: boolean
    sx?: SxProps<Theme>
}

type SingleSelectProps<T> = UISelectPropsBase<T> & {
    multiple?: false
    value: Option<T> | null
    onChange: (value: Option<T> | null) => void
}

type MultiSelectProps<T> = UISelectPropsBase<T> & {
    multiple: true
    value: Option<T>[] | null
    onChange: (value: Option<T>[] | null) => void
}

export type UISelectProps<T = string> =
    | SingleSelectProps<T>
    | MultiSelectProps<T>

export const UISelect = <T = string,>({
    options,
    value,
    onChange,
    label,
    multiple = false,
    freeSolo = false,
    disabled = false,
    disableClearable = false,
    error = false,
    helperText,
    sx,
}: UISelectProps<T>) => {
    const getOptionLabel = (option: Option<T> | string) => {
        if (typeof option === 'string') {
            const found = options.find((o) => o.value === option)
            if (found) {
                return found.label
            }
            return option
        }
        return option.label
    }

    const isOptionEqualToValue = (option: Option<T>, value: Option<T>) => {
        return option.value === value.value
    }

    const handleChange = (
        _: React.SyntheticEvent,
        newValue:
            | Option<T>
            | Option<T>[]
            | string
            | (string | Option<T>)[]
            | null
    ) => {
        if (newValue === null) {
            onChange(null)
            return
        }

        if (Array.isArray(newValue)) {
            const processedValue = newValue.map((item) =>
                typeof item === 'string'
                    ? { label: item, value: item as T }
                    : item
            )
            ;(onChange as (value: Option<T>[] | null) => void)(
                processedValue as Option<T>[]
            )
            return
        }

        if (typeof newValue === 'string') {
            ;(onChange as (value: Option<T> | null) => void)({
                label: newValue,
                value: newValue as T,
            })
            return
        }

        ;(onChange as (value: Option<T> | null) => void)(newValue)
    }

    return (
        <Autocomplete<Option<T>, boolean, boolean, boolean>
            sx={{
                minWidth: '8rem',
                ...sx,
            }}
            multiple={multiple}
            freeSolo={freeSolo}
            options={options}
            disableClearable={disableClearable}
            value={value}
            onChange={handleChange}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={isOptionEqualToValue}
            disabled={disabled}
            disableCloseOnSelect={multiple}
            renderOption={(props, option) => {
                return (
                    <li {...props} key={`${option.value}`}>
                        {option.label}
                    </li>
                )
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    placeholder="Select an option"
                />
            )}
        />
    )
}
