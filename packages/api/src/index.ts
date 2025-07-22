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
