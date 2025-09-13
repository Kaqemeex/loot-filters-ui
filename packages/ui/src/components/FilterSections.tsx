import { Filter, FilterVersion } from "@loot-filters/core"
import { Alert } from "@mui/material"
import { useState } from "react"
import { getFilterVersions } from "../utils/api"



interface ConfigurableFilterProps {
    filter: Filter
    version: string
}

export const ConfigurableFilter : React.FC<ConfigurableFilterProps> = (
    {
        filter: Filter
    }
) => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filterVersion, setFilterVersion] = useState<FilterVersion | null>(null)

    if (!loading && !error && !filterVersion) {
        setLoading(true)
        setError(null)
        const filterVersion = getFilterVersions
        setFilterVersion(filterVersion)
        setLoading(false)
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    return <div>FilterSections</div>
}