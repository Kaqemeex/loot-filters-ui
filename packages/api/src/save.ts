import { Env } from './env'
import { generateId } from './idgen'

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

// We hash and store the rs2f separately to avoid storing multiple copies of the same rs2f
// Since the majority of users are using Rikten's or Joe's filters this means we're really only ever storing 1 version of each.
export const save = async (
    toStore: {
        filter: SavedFilter
        config?: object
    },
    env: Env
) => {
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
        const filterKey = `filters/${id}.json.gz`
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
