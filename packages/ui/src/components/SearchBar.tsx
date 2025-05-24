import React, { useState, useEffect } from 'react'
import { Search, Clear } from '@mui/icons-material'
import { TextField, InputAdornment, IconButton } from '@mui/material'

import { useSearchStore } from '../store/search'

export const SearchBar: React.FC<{}> = () => {
    const { search, setSearch } = useSearchStore()

    const [searchText, setSearchText] = useState(search)
    useEffect(() => {
        const timeout = setTimeout(() => setSearch(searchText), 250)
        return () => clearTimeout(timeout)
    }, [searchText])

    return (
        <TextField
            sx={{ minWidth: '20rem' }}
            label="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search color="primary" />
                        </InputAdornment>
                    ),
                    endAdornment: search !== '' && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => {
                                    setSearch('') // skip debounce
                                    setSearchText('')
                                }}
                            >
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    )
}
