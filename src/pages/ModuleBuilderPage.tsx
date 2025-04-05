import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid2 as Grid,
    TextField,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useModuleStore } from '../store/modules'
import { useUiStore } from '../store/store'
import { colors } from '../styles/MuiTheme'
import { UiFilterModule, UiModularFilter } from '../types/ModularFilterSpec'

const ModuleCard: React.FC<{ module: UiFilterModule }> = ({ module }) => {
    const nav = useNavigate()
    const { removeModule } = useModuleStore()
    return (
        <Card>
            <CardContent
                style={{
                    minHeight: '10em',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5em',
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {module.name}
                </Typography>
                <Typography
                    sx={{
                        color: colors.rsDarkYellow,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    variant="body2"
                >
                    {module.subtitle}
                </Typography>

                <Typography
                    sx={{
                        color: colors.rsDarkOrange,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                    variant="body2"
                >
                    {module.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button
                    onClick={() => {
                        nav('/modules/' + module.id)
                    }}
                >
                    Edit
                </Button>
                <Button
                    onClick={() => {
                        removeModule(module.id)
                    }}
                >
                    Delete
                </Button>
            </CardActions>
        </Card>
    )
}

export const ModulesNav: React.FC<{
    onSearchChange: (s: string) => void
}> = ({ onSearchChange }) => {
    const [searchParams] = useSearchParams()
    const query = decodeURIComponent(searchParams.get('q') || '')
    const [search, setSearch] = useState(query)

    useEffect(() => {
        var newurl =
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname +
            '?q=' +
            encodeURIComponent(search)
        window.history.pushState({ path: newurl }, '', newurl)
        onSearchChange(search)
    }, [search])

    const { setModule, removeModule, modules, backfill } = useModuleStore()
    const importedFilters: Record<string, UiModularFilter> = useUiStore(
        (state) => state.importedModularFilters
    )

    return (
        <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
            <TextField
                label="Search"
                size="small"
                value={search}
                onChange={(event) => {
                    setSearch(event.target.value)
                }}
            />
            <Button
                size="small"
                variant="outlined"
                onClick={() => {
                    backfill(
                        Object.entries(importedFilters).flatMap(
                            // TODO I don't understand why I have to cast here
                            ([id, filter]) =>
                                filter.modules as UiFilterModule[],
                            []
                        )
                    )
                }}
            >
                Import Moudles
            </Button>
            <Button
                size="small"
                variant="outlined"
                onClick={() => {
                    setModule({
                        name: 'New Module',
                        id: crypto.randomUUID(),
                        rs2fText: '',
                        inputs: [],
                    })
                }}
            >
                Create Module
            </Button>
        </div>
    )
}

export const ModuleBuilderPage: React.FC = () => {
    const { modules } = useModuleStore()
    const [searchParams] = useSearchParams()

    const [search, setSearch] = useState(
        decodeURIComponent(searchParams.get('q') || '')
    )

    return (
        <>
            <ModulesNav onSearchChange={setSearch} />
            <Grid container spacing={2}>
                {Object.values(modules)
                    .filter((module) => {
                        if (search.trim() !== '') {
                            return (
                                module.name
                                    .toLowerCase()
                                    .includes(search.toLowerCase()) ||
                                module.description
                                    ?.toLowerCase()
                                    .includes(search.toLowerCase()) ||
                                module.subtitle
                                    ?.toLowerCase()
                                    .includes(search.toLowerCase())
                            )
                        }
                        return true
                    })
                    .map((module) => {
                        return (
                            <Grid size={3} key={module.id}>
                                <ModuleCard module={module} />
                            </Grid>
                        )
                    })}
            </Grid>
        </>
    )
}
