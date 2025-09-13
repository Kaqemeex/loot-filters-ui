import { AutoRouter } from 'itty-router'
import { configureAuthRoutes } from './routes/discordAuth'
import { HttpError } from './utils/http-errors'
import { bindApi } from './routes/router-binding'

const router = AutoRouter({
    catch: (err: Error) => {
        if (err instanceof HttpError) {
            return new Response(JSON.stringify(err), { status: err.status })
        }
        console.error('Error in router', err)
        return new Response(JSON.stringify(err), { status: 500 })
    },
})

router.options('*', () => {
    return new Response('', {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
})

configureAuthRoutes(router)
bindApi(router)

export default { ...router }
