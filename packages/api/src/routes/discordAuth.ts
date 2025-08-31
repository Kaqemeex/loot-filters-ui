import { and, eq, lt } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { AutoRouterType, IRequest } from 'itty-router'
import { users, userSessions } from '../db/users'
import { Env } from '../env'

const second = 1000
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

const sessionDuration = 1 * day - 1 * hour

export type DiscordOAuthData = {
    token_type: 'bearer'
    access_token: string
    expires_in: number
    refresh_token: string
    scope: 'identify'
}

export const doDiscordLogin = async (req: IRequest, env: Env) => {
    const code = req.query.code as string

    console.log('code', code)
    const result = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            code,
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            redirect_uri: env.DISCORD_REDIRECT_URI,
            grant_type: 'authorization_code',
            scope: 'identify',
        }).toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    const oauthData = (await result.json()) as DiscordOAuthData
    const userReq = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
    })

    const user = (await userReq.json()) as { id: string; username: string }
    await env.DB.insert(users)
        .values({
            discordId: user.id,
            discordUsername: user.username,
            refreshToken: oauthData.refresh_token,
            authToken: oauthData.access_token,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [users.discordId],
            set: {
                authToken: oauthData.access_token,
                refreshToken: oauthData.refresh_token,
                updatedAt: new Date(),
            },
        })

    await env.DB.delete(userSessions).where(
        and(
            eq(userSessions.discordId, user.id),
            lt(userSessions.expiresAt, new Date())
        )
    )

    const sessionId = crypto.randomUUID()
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + sessionDuration)
    await env.DB.insert(userSessions).values({
        sessionId,
        discordId: user.id,
        expiresAt,
        createdAt,
    })

    return Response.json(
        {
            username: user.username,
            sessionId,
            sessionExpiresAt: expiresAt,
        },
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                // TODO: add 'Secure' -- can't for localdev
                'set-cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Expires=${expiresAt.toUTCString()}`,
            },
        }
    )
}

export const configureAuthRoutes = (router: AutoRouterType) => {
    router
        .get('/login', async (req: IRequest, env: Env) => {
            const state = req.query.state
            return new Response(null, {
                status: 302,
                headers: {
                    Location: env.DISCORD_LOGIN_URI + `&state=${state}`,
                },
            })
        })
        .get('/login/oauth/discord', async (req: IRequest, env: Env) => {
            try {
                return await doDiscordLogin(req, env)
            } catch (err) {
                console.error('Error logging in with Discord', err)
                return new Response('Internal Server Error', { status: 500 })
            }
        })
}
