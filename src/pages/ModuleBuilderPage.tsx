import {
    Button,
    Card,
    CardActions,
    CardContent,
    Container,
    Grid2 as Grid,
    Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useModuleStore } from '../store/modules'
import { useUiStore } from '../store/store'
import { UiFilterModule, UiModularFilter } from '../types/ModularFilterSpec'

const ModuleCard: React.FC<{ module: UiFilterModule }> = ({ module }) => {
    const nav = useNavigate()
    return (
        <Card>
            <CardContent>
                <Typography variant="h3">{module.name}</Typography>
                <Typography variant="body2">{module.description}</Typography>
            </CardContent>
            <CardActions>
                <Button
                    onClick={() => {
                        nav('/modules/' + module.id)
                    }}
                >
                    Edit
                </Button>
            </CardActions>
        </Card>
    )
}

export const ModuleBuilderPage: React.FC = () => {
    const { setModule, removeModule, modules, backfill } = useModuleStore()
    const importedFilters: Record<string, UiModularFilter> = useUiStore(
        (state) => state.importedModularFilters
    )

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                onClick={() => {
                    if (Object.entries(modules).length === 0) {
                        backfill(
                            Object.entries(importedFilters).flatMap(
                                // TODO I don't understand why I have to cast here
                                ([id, filter]) =>
                                    filter.modules as UiFilterModule[],
                                []
                            )
                        )
                    }
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
            <Grid container>
                {Object.values(modules).map((module) => {
                    return (
                        <Grid key={module.id}>
                            <ModuleCard module={module} />
                        </Grid>
                    )
                })}
            </Grid>
        </>
    )
}
