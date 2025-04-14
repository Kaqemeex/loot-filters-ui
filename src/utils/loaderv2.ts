import { parse } from '../parsing/parse'
import { Filter } from '../parsing/UiTypesSpec'

export const loadFilterFromUrl = async (url: string): Promise<Filter> => {
    const response = await fetch(url, { mode: 'no-cors', redirect: 'follow' })
    const filterText = await response.text()

    console.log(filterText.slice(0, 100))
    const { errors, filter } = await parse(filterText)
    console.log(errors, filter)

    if (errors && errors.length > 0) {
        throw Error('Failed to parse filter: ' + JSON.stringify(errors))
    }

    if (filter == null) {
        throw Error('This should be impossible')
    }

    return filter
}
