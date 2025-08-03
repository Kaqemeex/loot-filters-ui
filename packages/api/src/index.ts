import {
    parse,
    render,
    renderFilter,
    RenderOptimizedRs2f,
} from '@loot-filters/core'
import { Env } from './env'
import { load } from './load'
import { save } from './save'

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        const path = url.pathname

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods':
                        'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            })
        }

        // Handle /stats endpoint
        if (path === '/stats' && request.method === 'GET') {
            try {
                // Count files in filters/ folder
                const filtersList = await env.FILTERS_BUCKET.list({
                    prefix: 'filters/',
                })
                const filtersCount = filtersList.objects.length

                // Count files in configs/ folder
                const configsList = await env.FILTERS_BUCKET.list({
                    prefix: 'configs/',
                })
                const configsCount = configsList.objects.length

                return new Response(
                    JSON.stringify({
                        filterVariants: filtersCount,
                        configVariants: configsCount,
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            } catch (error) {
                console.error('Error fetching stats:', error)
                return new Response(
                    JSON.stringify({ error: 'Internal server error' }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            }
        }

        // Handle /render/{id} endpoint
        const renderMatch = path.match(/^\/render\/([^\/]+)$/)
        if (renderMatch && request.method === 'GET') {
            const filterId = renderMatch[1]

            try {
                // Get the filter from R2
                const filterData = await load(filterId, env)

                // Parse the RS2F content to create a proper Filter object
                const parseResult = parse(filterData.filter.rs2f, false, {
                    name: filterData.filter.sourceUrl || 'Unknown Filter',
                })

                if (parseResult.errors) {
                    return new Response(
                        JSON.stringify({
                            error: 'Failed to parse filter',
                            details: parseResult.errors
                                .map((e) => e.error.message)
                                .join(', '),
                        }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        }
                    )
                }

                if (!parseResult.filter) {
                    return new Response(
                        JSON.stringify({ error: 'Failed to parse filter' }),
                        {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',
                            },
                        }
                    )
                }

                // Render the filter using the core package
                const renderedFilter = renderFilter(
                    parseResult.filter,
                    filterData.config as any
                )

                return new Response(renderedFilter, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': '*',
                    },
                })
            } catch (error) {
                console.error('Error rendering filter:', error)
                return new Response(
                    JSON.stringify({ error: 'Internal server error' }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            }
        }

        // Handle /filter/{id} endpoint
        const filterMatch = path.match(/^\/filter\/([^\/]+)$/)
        if (filterMatch && request.method === 'GET') {
            const filterId = filterMatch[1]

            try {
                // Get the filter from R2
                const filterData = await load(filterId, env)
                return new Response(JSON.stringify(filterData), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                })
            } catch (error) {
                console.error('Error fetching filter:', error)
                return new Response(
                    JSON.stringify({ error: 'Internal server error' }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            }
        }

        if (path === '/render/compiled' && request.method === 'POST') {
            try {
                const filter = (await request.json()) as RenderOptimizedRs2f & {
                    prefix?: RenderOptimizedRs2f
                    prefixMacroOverrides: Record<string, string>
                    suffix?: RenderOptimizedRs2f
                    suffixMacroOverrides: Record<string, string>
                }
                const compiled = render(
                    filter,
                    {},
                    filter.prefix,
                    filter.prefixMacroOverrides,
                    filter.suffix,
                    filter.suffixMacroOverrides
                )
                return new Response(compiled, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Access-Control-Allow-Origin': '*',
                    },
                })
            } catch (error) {
                console.error('Error in save endpoint:', error)
            }
        }

        if (path === '/save' && request.method === 'POST') {
            try {
                console.log('Received save request')
                const filter = (await request.json()) as {
                    filter: {
                        rs2f: string
                        expectedRs2fHash: string
                        sourceUrl: string
                    }
                    config: {
                        data: object
                    }
                }
                console.log(
                    'Filter data received:',
                    typeof filter,
                    Object.keys(filter)
                )

                const response = await save(filter, env)
                console.log('Save completed successfully with ID:', response)
                return new Response(
                    JSON.stringify({ response: { id: response.id } }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            } catch (error) {
                console.error('Error in save endpoint:', error)
                return new Response(
                    JSON.stringify({
                        error: 'Failed to save filter',
                        details:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                    }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                    }
                )
            }
        }

        // Handle 404 for unknown routes
        return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
    },
}
