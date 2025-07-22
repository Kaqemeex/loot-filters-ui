import { Env } from './env'
import { SavedConfig, SavedFilter } from './save'

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
