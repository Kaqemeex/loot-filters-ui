import { Editor } from '@monaco-editor/react'
import { useUiStore } from '../../store/store'
import { renderFilter } from '../../utils/render'

const RenderFilterComponent: React.FC = () => {
    const activeFilter = useUiStore((state) =>
        Object.values(state.importedModularFilters).find((f) => f.active)
    )
    const activeConfig = useUiStore((state) =>
        activeFilter ? state.filterConfigurations[activeFilter.id] : undefined
    )

    return (
        <>
            <Editor
                height="70vh"
                language="cpp"
                theme="vs-dark"
                options={{
                    minimap: {
                        enabled: false,
                    },
                    readOnly: true,
                }}
                value={
                    activeFilter
                        ? renderFilter(activeFilter, activeConfig)
                        : 'no filter selected'
                }
            />
        </>
    )
}

export const RenderedFilterTab: React.FC = () => {
    return <RenderFilterComponent />
}
