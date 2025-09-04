import { AutoRouter } from 'itty-router'
import { configureAuthRoutes } from './routes/discordAuth'
import { configureFilterApis } from './routes/filters'
import { configureFilterVersionApis } from './routes/filterVersions'

const router = AutoRouter({
    catch: (err: Error) => {
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
configureFilterApis(router)
configureFilterVersionApis(router)

export default { ...router }
