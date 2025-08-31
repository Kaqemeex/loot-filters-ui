import { eq } from 'drizzle-orm'
import { IRequest } from 'itty-router'
import { FILTERS_TABLE } from '../db/filters'
import { userSessions } from '../db/users'
import { Env } from '../env'

export const withAuthenticatedUser = async (req: IRequest, env: Env) => {
    let sessionId = req.headers.get('Cookie')?.split('=')[1]

    if (!sessionId) {
        sessionId = req.headers.get('Authorization')?.split(' ')[1]
    }

    if (!sessionId) {
        return new Response('Unauthorized', { status: 401 })
    }

    const result = await env.DB.select()
        .from(userSessions)
        .where(eq(userSessions.sessionId, sessionId))
        .limit(1)
        .get()

    if (result && result.expiresAt > new Date()) {
        req.auth = {
            sessionId,
            discordId: result.discordId,
        }
        return
    }

    return new Response('Unauthorized', { status: 401 })
}

export const withFilterOwner = async (req: IRequest, env: Env) => {
    await withAuthenticatedUser(req, env)

    const filterId = req.params.filterId
    const filter = await env.DB.select()
        .from(FILTERS_TABLE)
        .where(eq(FILTERS_TABLE.filterId, filterId))
        .limit(1)
        .get()

    if (!filter) {
        return new Response('Filter not found', { status: 404 })
    }
    if (filter.ownerDiscordId !== req.auth.discordId) {
        return new Response('Unauthorized', { status: 401 })
    }

    req.filter = filter
    return
}
