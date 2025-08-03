import { generateId } from '@loot-filters/core/src/idgen'
import { Env } from '../env'
import { Route } from '../router'

const getShortLinkHandler = async (
    _: Request,
    match: RegExpMatchArray,
    env: Env
) => {
    const filterId = match[1]

    // Get the filter from R2
    const filterData = await load(filterId, env)
    return new Response(JSON.stringify(filterData), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    })
}

export const getShortLinkRoute: Route = {
    path: /^\/filter\/([^\/]+)$/,
    method: 'GET',
    handler: getShortLinkHandler,
}

const saveShortLinkHandler = async (
    request: Request,
    _: RegExpMatchArray,
    env: Env
) => {
    const filter = (await request.json()) as SaveForLinkRequest
    const response = await saveForLink(filter, env)
    return new Response(JSON.stringify({ response: { id: response.id } }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    })
}

export const saveShortLinkRoute: Route = {
    path: /^\/filter\/save$/,
    method: 'POST',
    handler: saveShortLinkHandler,
}

const getAndDecompress = async (key: string, env: Env): Promise<string> => {
    const blob = await env.FILTERS_BUCKET.get(key)
    if (!blob) {
        throw new Error(`Blob ${key} not found`)
    }

    // Get the array buffer and decompress it properly
    const arrayBuffer = await blob.arrayBuffer()
    const decompressedStream = new Response(arrayBuffer).body?.pipeThrough(
        new DecompressionStream('gzip')
    )
    const decompressedContent = await new Response(
        decompressedStream
    ).arrayBuffer()

    return new TextDecoder().decode(decompressedContent)
}

export const load = async (id: string, env: Env) => {
    // CF R2 will automatically decompress the config if it's gzipped
    const config: SavedConfig = JSON.parse(
        await getAndDecompress(`configs/${id}.json.gz`, env)
    )
    const filter = await getAndDecompress(config.filterKey, env)

    return {
        filter: JSON.parse(filter) as SavedFilter,
        config: config.data,
    }
}

const compress = async (text: string) => {
    const compressedStream = await new Response(text).body?.pipeThrough(
        new CompressionStream('gzip')
    )
    const compressedContent = await new Response(compressedStream).arrayBuffer()
    if (!compressedContent) {
        throw new Error('Failed to gzip rs2f')
    }
    return compressedContent
}

export type SavedFilter = {
    rs2f: string
    expectedRs2fHash: string
    sourceUrl: string
}

export type SavedConfig = {
    id: string
    filterKey: string
    configKey: string
    data?: object
}

type SaveForLinkRequest = {
    filter: SavedFilter
    config?: object
}

// We hash and store the rs2f separately to avoid storing multiple copies of the same rs2f
// Since the majority of users are using Rikten's or Joe's filters this means we're really only ever storing 1 version of each.
export const saveForLink = async (toStore: SaveForLinkRequest, env: Env) => {
    try {
        const id = generateId()

        // Check that the rs2f hash matches the expected hash then something is wrong with the request.
        const rs2fHash = await hashRs2f(toStore.filter.rs2f)
        if (toStore.filter.expectedRs2fHash !== rs2fHash) {
            throw new Error(
                `Filter rs2f hash does not match; expected ${toStore.filter.expectedRs2fHash} but got ${rs2fHash}`
            )
        }

        // Upsert the rs2f if it doesn't exist
        const filterKey = `filters/${rs2fHash}.json.gz`
        const filterExists = await env.FILTERS_BUCKET.head(filterKey)
        if (!filterExists) {
            // store filter, with source url and expected hash
            const compressedContent = await compress(
                JSON.stringify(toStore.filter)
            )
            if (compressedContent.byteLength > 1024 * 1024 * 2) {
                throw new Error(
                    `Filter is too large; size ${compressedContent.byteLength} limit 2Mb`
                )
            }
            await env.FILTERS_BUCKET.put(filterKey, compressedContent, {
                httpMetadata: {
                    contentEncoding: 'gzip',
                },
            })
        } else {
            console.log(
                `Key ${filterKey} already exists, skipping filter upload`
            )
        }

        // Store the config; but only if it's smol
        const configKey = `configs/${id}.json.gz`
        const configExists = await env.FILTERS_BUCKET.head(configKey)
        if (configExists) {
            throw new Error(`Config ${configKey} already exists`)
        }

        const savedConfig: SavedConfig = {
            id,
            filterKey,
            configKey,
            data: toStore.config,
        }
        const configJson = await compress(JSON.stringify(savedConfig))
        if (configJson.byteLength > 1024 * 5) {
            // configs in excess of 5kb compressed is ... wild
            throw new Error(
                `Filter config is too large; size ${configJson.byteLength} limit 5kb`
            )
        }

        await env.FILTERS_BUCKET.put(configKey, configJson, {
            httpMetadata: {
                contentEncoding: 'gzip',
            },
        })

        return {
            id,
            filterKey,
            configKey,
        }
    } catch (error) {
        console.error('Error saving filter to R2:', error)
        throw error
    }
}

export const writeToR2 = async (id: string, filter: string, env: Env) => {
    return await env.FILTERS_BUCKET.put(`${id}.json`, filter)
}

export const hashRs2f = async (filter: string) => {
    const filterBytes = new TextEncoder().encode(filter)
    const hashBuffer = await crypto.subtle.digest('SHA-1', filterBytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const rs2fHash = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    return rs2fHash
}
