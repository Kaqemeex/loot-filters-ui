import { Env } from '../env'
import { Route } from '../router'

const statsHandler = async (_: Request, env: Env) => {
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
}

export const statsRoute: Route = {
    path: /^\/stats$/,
    method: 'GET',
    handler: statsHandler,
}
