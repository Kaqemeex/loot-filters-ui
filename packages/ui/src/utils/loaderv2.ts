import { addRs2fHash, Filter, parseAsync as parse } from '@loot-filters/models'

const stringifyErrors = (errors: Error[]) => {
    return errors.map((e) => e.message).join('\n')
}

export const loadFilterFromUrl = async (url: string): Promise<Filter> => {
    const response = await fetch(url)
    const filterText = await response.text()

    const { errors, filter } = await parse(filterText, true)

    if (errors && errors.length > 0) {
        throw Error(
            'Failed to parse filter: ' +
                stringifyErrors(errors as unknown as Error[])
        )
    }

    if (filter == null) {
        throw Error('This should be impossible')
    }

    filter.source = url
    return addRs2fHash(filter)
}
