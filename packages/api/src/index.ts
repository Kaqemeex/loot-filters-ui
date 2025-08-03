import { Env } from './env'
import {
    getShortLinkRoute,
    saveShortLinkRoute,
} from './handlers/shortLinkRoute'
import { statsRoute } from './handlers/statsRoute'
import { Router } from './router'

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        console.log('Fetching request', request.url)
        const router = new Router(env)

        router.registerRoute({
            path: /^.*/,
            method: 'OPTIONS',
            handler: async () => {
                return new Response(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods':
                            'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                })
            },
        })

        router.registerRoute(statsRoute)
        router.registerRoute(getShortLinkRoute)
        router.registerRoute(saveShortLinkRoute)

        return router.handle(request)
    },
}
