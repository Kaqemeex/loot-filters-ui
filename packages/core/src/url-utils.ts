import { z } from 'zod'

export const ContentSourceSchema = z.union([
    z.object({
        type: z.literal('url'),
        url: z.string().url(),
    }),
    z.object({
        type: z.literal('raw'),
        rawRs2f: z.string(),
    }),
])

export type ContentSource = z.infer<typeof ContentSourceSchema>

/**
 * Fetches content from a URL or returns raw content
 */
export const fetchContent = async (
    contentSource: ContentSource
): Promise<string> => {
    if (contentSource.type === 'raw') {
        return contentSource.rawRs2f
    }

    if (contentSource.type === 'url') {
        try {
            const response = await fetch(contentSource.url)
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch content from URL: ${response.statusText}`
                )
            }
            return await response.text()
        } catch (error) {
            throw new Error(
                `Failed to fetch content from URL: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }
    }

    throw new Error('Invalid content source type')
}

/**
 * Validates that a URL is accessible and returns text content
 */
export const validateUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok
    } catch {
        return false
    }
}
