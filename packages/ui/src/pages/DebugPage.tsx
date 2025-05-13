import { Editor } from '@monaco-editor/react'
import { Delete, Download, Upload } from '@mui/icons-material'
import { Box, Button, Container, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadFile, localState, localStorageKeys } from '../utils/file'

const FilterStoreTabs = ({
    filterStoreTab,
    setFilterStoreTab,
}: {
    filterStoreTab: string
    setFilterStoreTab: (tab: string) => void
}) => {
    const filterStore = JSON.parse(localStorage.getItem('filter-store') ?? '{}')

    if (Object.keys(filterStore).length === 0) {
        return null
    }

    return (
        <Tabs
            value={filterStoreTab}
            onChange={(_, newValue) => setFilterStoreTab(newValue)}
        >
            <Tab value="everything" label="Everything" />
            {Object.keys(filterStore['state']['filters']).map((key, i) => {
                return (
                    <Tab
                        key={i}
                        value={key}
                        label={filterStore['state']['filters'][key].name}
                    />
                )
            })}
        </Tabs>
    )
}

const renderContent = (tab: string, filterStoreTab: string) => {
    const content = localStorage.getItem(tab)

    if (!content) {
        return 'No data found for this tab'
    }

    if (!content.startsWith('{')) {
        return content
    }

    let json = JSON.parse(content)

    if (tab === 'filter-store' && filterStoreTab !== 'everything') {
        json = json['state']['filters'][filterStoreTab]
    } else if (
        tab === 'filter-configuration-store' &&
        filterStoreTab !== 'everything'
    ) {
        json = json['state']['filterConfigurations'][filterStoreTab]
    }

    return JSON.stringify(json, null, 2)
}

export const DebugPage = () => {
    const navigator = useNavigate()
    const [tab, setTab] = useState('filter-store')
    const [filterStoreTab, setFilterStoreTab] = useState('everything')
    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    mt: 5,
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Button
                    sx={{ width: '250px' }}
                    variant="outlined"
                    onClick={() => {
                        const state = localState()
                        const fileName = `filterscape_state_${Date.now()
                            .toString()
                            .replaceAll('/', '-')}.json`
                        const file = new File(
                            [JSON.stringify(state)],
                            fileName,
                            {
                                type: 'text/plain',
                            }
                        )
                        downloadFile(file)
                    }}
                >
                    <Download sx={{ fontSize: '20px' }} />
                    Download Local State
                </Button>

                <Button
                    sx={{ width: '250px' }}
                    variant="outlined"
                    component="label"
                >
                    <Upload sx={{ fontSize: '20px' }} />
                    Upload Local State
                    <input
                        type="file"
                        hidden
                        accept=".json"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const reader = new FileReader()
                            reader.onload = (e) => {
                                const content = e.target?.result as string
                                const state = JSON.parse(content)
                                Object.entries(state).forEach(
                                    ([key, value]) => {
                                        localStorage.setItem(
                                            key,
                                            (value as string) ?? null
                                        )
                                    }
                                )
                                window.location.href = `${window.location.protocol}://${window.location.host}`
                            }
                            reader.readAsText(file)
                        }}
                    />
                </Button>
                <Button
                    sx={{ width: '250px', color: 'red' }}
                    variant="outlined"
                    onClick={() => {
                        localStorage.clear()
                        window.location.href = `${window.location.protocol}://${window.location.host}`
                    }}
                >
                    <Delete sx={{ fontSize: '20px' }} />
                    Delete All Stored Data
                </Button>
            </Box>
            <Box>
                <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
                    {localStorageKeys.map((key, i) => {
                        return <Tab key={i} value={key} label={key} />
                    })}
                </Tabs>
                {(tab === 'filter-store' ||
                    tab === 'filter-configuration-store') && (
                    <FilterStoreTabs
                        filterStoreTab={filterStoreTab}
                        setFilterStoreTab={setFilterStoreTab}
                    />
                )}

                <Editor
                    height="70vh"
                    language={
                        (localStorage.getItem(tab) ?? '').startsWith('{')
                            ? 'json'
                            : 'text'
                    }
                    theme="vs-dark"
                    options={{
                        minimap: {
                            enabled: false,
                        },
                        readOnly: true,
                    }}
                    value={renderContent(tab, filterStoreTab)}
                />
            </Box>
        </Container>
    )
}
