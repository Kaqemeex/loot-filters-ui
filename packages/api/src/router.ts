import { Env } from './env'

export type Route = {
    path: RegExp
    method: string
    handler: (
        request: Request,
        match: RegExpMatchArray,
        env: Env
    ) => Promise<Response>
}

export class Router {
    private routes: Route[] = []
    constructor(private env: Env) {}

    public registerRoute(route: Route) {
        console.log('Registering route', route.path)
        this.routes.push(route)
    }

    public async handle(request: Request): Promise<Response> {
        const url = new URL(request.url)
        console.log('Handling request', request.url)
        for (const route of this.routes) {
            const match = url.pathname.match(route.path)
            if (match && route.method === request.method) {
                return route.handler(request, match, this.env)
            }
        }
        console.log('No route found for', request.method, request.url)
        return Promise.resolve(new Response('Not found', { status: 404 }))
    }
}
