import { Editor } from '@monaco-editor/react'
import {
    Box,
    FormHelperText,
    Grid2,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useModuleStore } from '../store/modules'
import { UiFilterModule } from '../types/ModularFilterSpec'

const ModuleDetailsEditor: React.FC<{ id: string; active: boolean }> = ({
    id,
    active,
}) => {
    const { setModule, modules } = useModuleStore()
    const module: UiFilterModule = modules[id]

    const undefinedIfEmpty = (str: string) => (str ? str : undefined)

    return (
        <Box display={active ? 'block' : 'none'}>
            <Grid2 container spacing={2}>
                <Grid2 size={5}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Module Name"
                        value={module.name}
                        helperText={
                            undefinedIfEmpty(module.name)
                                ? "The module's name"
                                : 'Name cannot be empty'
                        }
                        error={undefinedIfEmpty(module.name) === undefined}
                        onChange={(event) => {
                            setModule({
                                ...module,
                                name: event.target.value.trim(),
                            })
                        }}
                    />
                </Grid2>
                <Grid2 size={7}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Module Subtitle"
                        value={module.subtitle || ''}
                        helperText="A short description to explain the module's purpose"
                        onChange={(event) => {
                            setModule({
                                ...module,
                                subtitle: undefinedIfEmpty(
                                    event.target.value.trim()
                                ),
                            })
                        }}
                    />
                </Grid2>
                <Grid2 size={12}>
                    <FormHelperText></FormHelperText>
                    <TextField
                        multiline
                        minRows={4}
                        size="small"
                        fullWidth
                        label="Module Description"
                        value={module.description || ''}
                        helperText="A longer description of the module and how it may work. "
                        onChange={(event) => {
                            setModule({
                                ...module,
                                description: undefinedIfEmpty(
                                    event.target.value.trim()
                                ),
                            })
                        }}
                    />
                </Grid2>
            </Grid2>
        </Box>
    )
}

export const ModuleEditPage: React.FC = () => {
    const id = useParams().id as string
    const { setModule, removeModule, modules, backfill } = useModuleStore()

    const thisModule = modules[id]
    if (thisModule === undefined) {
        return (
            <Typography color="secondary" variant="h3">
                Module not found
            </Typography>
        )
    }

    const [activeTab, setActiveTab] = useState('module')

    return (
        <Grid2 container gap={2}>
            <Grid2 size={1}>
                <Tabs
                    orientation="vertical"
                    value={activeTab}
                    onChange={(_, value) => {
                        setActiveTab(value)
                    }}
                >
                    <Tab value="module" label="Module Info" />
                    <Tab value="inputs" label="Inputs" />
                    <Tab value="rs2f" label="Rs2f" />
                </Tabs>
            </Grid2>
            <Grid2 size={10}>
                <ModuleDetailsEditor active={activeTab === 'module'} id={id} />

                {activeTab === 'rs2f' ? (
                    <Editor
                        height="70vh"
                        language="cpp"
                        theme="vs-dark"
                        options={{
                            minimap: {
                                enabled: false,
                            },
                        }}
                        value={thisModule.rs2fText}
                        onChange={(value) => {
                            setModule({ ...thisModule, rs2fText: value ?? '' })
                        }}
                    />
                ) : null}
            </Grid2>
        </Grid2>
    )
}
