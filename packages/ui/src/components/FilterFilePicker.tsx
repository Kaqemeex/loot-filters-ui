import { Button } from '@mui/material'
import React, { useRef } from 'react'

import { Filter } from '../parsing/UiTypesSpec'
import { parse } from '../parsing/parse'

export const FilterFilePicker: React.FC<{
    onFilter: (f: Filter) => void
    onError: (e: Error) => void
}> = ({ onFilter, onError }) => {
    const ref = useRef<HTMLInputElement | null>(null)

    return (
        <Button
            variant="main-action"
            onClick={() => {
                ref.current?.click()
            }}
        >
            Choose file...
            <input
                ref={ref}
                type="file"
                accept=".rs2f"
                hidden
                onChange={(e) => {
                    if (!e.target.files || e.target.files.length === 0) {
                        return
                    }

                    const reader = new FileReader()
                    reader.onload = async () => {
                        if (typeof reader.result !== 'string') {
                            onError(new Error('could not read file'))
                            return
                        }

                        const parsed = parse(reader.result)
                        if (!!parsed.errors) {
                            onError(parsed.errors[0].error)
                            return
                        }

                        onFilter(parsed.filter!!)
                    }
                    reader.onerror = () => {
                        onError(new Error('could not read file'))
                    }

                    reader.readAsText(e.target.files[0])
                }}
            />
        </Button>
    )
}
