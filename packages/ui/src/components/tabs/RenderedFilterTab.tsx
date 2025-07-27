import { renderFilter } from '@loot-filters/core'
import { Editor } from '@monaco-editor/react'
import { useFilterConfigStore } from '../../store/filterConfigurationStore'
import { useFilterStore } from '../../store/filterStore'
export const RenderedFilterTab: React.FC<{
    extraComponent?: React.ReactNode
}> = ({ extraComponent }) => {
    const activeFilter = useFilterStore((state) =>
        Object.values(state.filters).find((f) => f.active)
    )
    const activeConfig = useFilterConfigStore((state) =>
        activeFilter ? state.filterConfigurations[activeFilter.id] : undefined
    )

    return (
        <>
            {extraComponent}
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
