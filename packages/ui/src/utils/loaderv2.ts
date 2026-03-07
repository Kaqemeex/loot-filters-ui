import { addRs2fHash, parseAsync as parse } from '../parsing/parse'
import { Filter } from '../parsing/UiTypesSpec'

const stringifyErrors = (errors: Error[]) => {
    return errors.map((e) => e.message).join('\n')
}

export const loadFilterFromUrl = async (url: string): Promise<Filter> => {
    const response = await fetch(url)
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
    return addRs2fHash(filter)
}
