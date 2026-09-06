import { renderFilter } from './render'
import { deriveConfig, deriveUrl } from '../parsing/deriveConfig'
import { parse, parseSiteMetadata } from '../parsing/parse'
import {
    Filter,
    FilterConfiguration,
    FilterConfigurationSpec,
} from '../parsing/UiTypesSpec'
import { loadFilterFromUrl } from './loaderv2'
import { resolveFilterSource } from './filterSource'

export const restoreFilter = async (imported: Filter) => {
    const parsed = parseSiteMetadata(imported.rs2f)
    if (parsed.errors?.length)
        throw new Error('Invalid filter restoration metadata')
    const metadata = parsed.metadata
    const source = metadata?.source ?? deriveUrl(imported)
    if (!source) throw new Error('Could not determine original filter source')
    const revision = metadata?.revisionUrl
        ? { revisionUrl: metadata.revisionUrl, commit: metadata.commit }
        : metadata?.commit
          ? await resolveFilterSource(source, metadata.commit)
          : undefined
    const base = await loadFilterFromUrl(source, revision)
    if (metadata?.sourceHash && base.rs2fHash !== metadata.sourceHash) {
        throw new Error(
            'The original filter content has changed. Exact restoration is unavailable; use Debug to re-associate it with a source manually.'
        )
    }
    const config = metadata?.config
        ? FilterConfigurationSpec.parse(metadata.config)
        : deriveConfig(base, imported)
    return {
        filter: {
            ...base,
            name: metadata?.name ?? imported.name,
            description: metadata?.description ?? imported.description,
        },
        config,
    }
}

// A manual repair keeps this filter's identity and explicit settings. Derive
// baked-in customizations from its stored source before applying those settings.
export const reassociateFilter = async (
    existing: Filter,
    config: FilterConfiguration | undefined,
    source: string,
    commit?: string,
    revisionUrl?: string
) => {
    const revision = revisionUrl
        ? { revisionUrl, commit }
        : await resolveFilterSource(source, commit)
    const base = await loadFilterFromUrl(source, revision)
    const configured = parse(
        renderFilter(existing, {
            ...config,
            enabledModules: Object.fromEntries(
                existing.modules.map((module) => [module.id, true])
            ),
            inputConfigs: config?.inputConfigs ?? {},
            selectedThemeId: undefined,
            prefixRs2f: undefined,
            suffixRs2f: undefined,
        })
    )
    if (!configured.filter)
        throw new Error('Could not read the current filter settings')
    const derived = deriveConfig(base, configured.filter)
    const enabledModules = Object.fromEntries(
        base.modules
            .filter(
                (module) =>
                    !existing.modules.some((old) => old.id === module.id)
            )
            .map((module) => [module.id, false])
    )
    return {
        filter: {
            ...base,
            id: existing.id,
            name: existing.name,
            description: existing.description,
            active: existing.active,
            importedOn: existing.importedOn,
            updatedOn: new Date().toISOString(),
        },
        config: {
            ...derived,
            ...config,
            enabledModules: { ...enabledModules, ...config?.enabledModules },
            inputConfigs: { ...config?.inputConfigs, ...derived.inputConfigs },
        },
    }
}
