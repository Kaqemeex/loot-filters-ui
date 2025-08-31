import { Env, IEnv } from './env'
import router from './router'

export default {
    async fetch(request: Request, env: IEnv, ctx: ExecutionContext) {
        return await router
            .fetch(request, new Env(env), ctx)
            .then(async (response) => {
                response.headers.set('Access-Control-Allow-Origin', '*')
                if (request.url.startsWith('/login')) {
                    response.headers.set(
                        'Access-Control-Allow-Credentials',
                        'true'
                    )
                }
                return response
            })
    },
}
