import { addRs2fHash, parseAsync as parse } from '../parsing/parse'
import { Filter } from '../parsing/UiTypesSpec'
import { resolveFilterSource } from './filterSource'

const stringifyErrors = (errors: Error[]) => {
    return errors.map((e) => e.message).join('\n')
}

export const loadFilterFromUrl = async (
    url: string,
    revision?: { revisionUrl: string; commit?: string }
): Promise<Filter> => {
    const resolved = revision ?? (await resolveFilterSource(url))
    if (!['http:', 'https:'].includes(new URL(resolved.revisionUrl).protocol)) {
        throw new Error('Filter revision must be an HTTP or HTTPS URL')
    }
    const response = await fetch(resolved.revisionUrl)
    if (!response.ok)
        throw new Error(`Failed to load filter (${response.status})`)

    const filterText = await response.text()

    const start = new Date().getTime()
    const { errors, filter } = await parse(filterText, true)
    const end = new Date().getTime()

    if (errors && errors.length > 0) {
        throw Error(
            'Failed to parse filter: ' +
                stringifyErrors(errors as unknown as Error[])
        )
    }

    if (filter == null) {
        throw Error('This should be impossible')
    }

    console.log(`parsed "${filter.name}" in`, end - start, 'ms')

    filter.source = url
    filter.commit = resolved.commit
    filter.revisionUrl = resolved.revisionUrl
    return addRs2fHash(filter)
}
