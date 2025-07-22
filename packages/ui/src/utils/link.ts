import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { Filter, FilterConfiguration } from '../parsing/UiTypesSpec'
type CreateLinkRequest = {
    filter: {
        rs2f: string
        expectedRs2fHash: string
        sourceUrl: string
    }
    config: {
        data?: object
    }
}
export const createLink = (
    filterOrUrl: Filter | string,
    config: FilterConfiguration | undefined
) => {
    if (typeof filterOrUrl === 'string') {
        return createLegacyLink(filterOrUrl, config)
    }

    const filter = filterOrUrl

    const data: CreateLinkRequest = {
        filter: {
            rs2f: filter.rs2f,
            expectedRs2fHash: filter.rs2fHash,
            sourceUrl: filter.source ?? '',
        },
        config: {
            data: config,
        },
    }

    return fetch('https://api.kaqemeex.net/save', {
        method: 'POST',
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(({ response }) => {
            console.log(response)
            return `${window.location.protocol}//${window.location.host}/import?filterId=${response.id}`
        })
}

export const parseComponent = async (
    component: string
): Promise<{
    filterUrl: string
    config: FilterConfiguration
}> => {
    const data = decompressFromEncodedURIComponent(component)
    const parsedData = JSON.parse(data)
    return parsedData
}

export const createLegacyLink = (
    filterUrl: string,
    config: FilterConfiguration | undefined
) => {
    const data = {
        filterUrl,
        config: config,
    }

    const component = compressToEncodedURIComponent(JSON.stringify(data))

    if (component.length >= 15 * 1024) {
        return Promise.reject(new Error('Link is too long'))
    }

    return Promise.resolve(
        `${window.location.protocol}//${window.location.host}/import?importData=${component}`
    )
}
