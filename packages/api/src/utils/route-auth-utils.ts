import { eq } from 'drizzle-orm'
import { IRequest } from 'itty-router'
import { FILTERS_TABLE } from '../db/filters'
import { userSessions } from '../db/users'
import { Env } from '../env'
import {
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
} from './http-errors'

const doAuth = async (
    req: IRequest,
    env: Env,
    throwOnError: boolean = true
) => {
    const sessionId = req.headers.get('Authorization')?.split(' ')[1]
    if (!sessionId) {
        if (throwOnError) {
            throw new AuthenticationError()
        } else {
            return
        }
    }

    const result = await env.DB.select()
        .from(userSessions)
        .where(eq(userSessions.sessionId, sessionId))
        .limit(1)
        .get()

    if (result && result.expiresAt > Date.now()) {
        req.auth = {
            sessionId,
            discordId: result.discordId,
        }
        return
    }

    if (throwOnError) {
        throw new AuthenticationError()
    } else {
        return
    }
}

export const withAuthenticatedUser = async (req: IRequest, env: Env) => {
    await doAuth(req, env, true)
}

export const withAuthenticatedUserIfPresent = async (
    req: IRequest,
    env: Env
) => {
    await doAuth(req, env, false)
}

export const getFilterAndCheckOwnership = async (
    req: IRequest,
    env: Env,
    filterId: string,
    skipOwnershipCheckIfPublic: boolean = false
) => {
    const filter = await env.DB.select()
        .from(FILTERS_TABLE)
        .where(eq(FILTERS_TABLE.filterId, filterId))
        .get()

    if (!filter) {
        throw new NotFoundError()
    }

    if (skipOwnershipCheckIfPublic && filter.public) {
        return filter
    }

    if (filter.ownerDiscordId !== req.auth.discordId) {
        throw new AuthorizationError()
    }

    return filter
}
