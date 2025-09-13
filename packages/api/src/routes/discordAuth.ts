import { and, eq, lt } from 'drizzle-orm'
import { AutoRouterType, IRequest } from 'itty-router'
import { users, userSessions } from '../db/users'
import { Env } from '../env'
import { generateId } from '../utils/id_generation'

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
    const result = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
            code,
            client_id: env.DISCORD_CLIENT_ID,
            client_secret: env.DISCORD_CLIENT_SECRET,
            redirect_uri: `${req.headers.get('origin')}/login/redirect`,
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
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        })
        .onConflictDoUpdate({
            target: [users.discordId],
            set: {
                authToken: oauthData.access_token,
                refreshToken: oauthData.refresh_token,
                updatedAt: new Date().getTime(),
            },
        })

    await env.DB.delete(userSessions).where(
        and(
            eq(userSessions.discordId, user.id),
            lt(userSessions.expiresAt, new Date().getTime() - 600 * 1000)
        )
    )

    const sessionId = generateId('session')
    const createdAt = new Date().getTime()
    const expiresAt = new Date(createdAt + sessionDuration).getTime()
    await env.DB.insert(userSessions).values({
        sessionId,
        discordId: user.id,
        expiresAt: expiresAt,
        createdAt: createdAt,
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
                'set-cookie': `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}`,
            },
        }
    )
}

const discordLoginLinks: Record<string, string> = {
    'https://v2.kaqemeex.net/':
        'https://discord.com/oauth2/authorize?client_id=1411366696979009567&response_type=code&redirect_uri=https%3A%2F%2Fv2.kaqemeex.net%2Flogin%2Fredirect&scope=identify',
    'http://localhost:3000/':
        'https://discord.com/oauth2/authorize?client_id=1411366696979009567&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogin%2Fredirect&scope=identify',
}

export const configureAuthRoutes = (router: AutoRouterType) => {
    router
        .get('/login', async (req: IRequest, env: Env) => {
            const state = req.query.state
            const referer = req.headers.get('Referer') || '_missing_referer_'
            const discordLoginLink = discordLoginLinks[referer]
            if (!discordLoginLink) {
                return new Response('Invalid referer', { status: 400 })
            }

            return new Response(null, {
                status: 302,
                headers: {
                    Location: discordLoginLink + `&state=${state}`,
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
