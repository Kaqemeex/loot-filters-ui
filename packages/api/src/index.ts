import { Env } from './env'
import router from './router'

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return router.fetch(request, env, ctx).then((response) => {
            response.headers.set('Access-Control-Allow-Origin', '*')
            if (request.url.startsWith('/login')) {
                response.headers.set('Access-Control-Allow-Credentials', 'true')
            }
            return response
        })
    },
}
