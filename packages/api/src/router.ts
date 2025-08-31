import { AutoRouter } from 'itty-router'
import { doDiscordLogin, withAuthenticatedUser } from './auth/discordAuth'

const router = AutoRouter()

router.options('*', () => {
    return new Response('', {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
})

// Options needs to be before auth middleware
router.all('/users', withAuthenticatedUser)

router.get('/login', async (req, env) => {
    const state = req.query.state
    return new Response(null, {
        status: 302,
        headers: { Location: env.DISCORD_LOGIN_URI + `&state=${state}` },
    })
})

router.get('/login/oauth/discord', async (req, env) => {
    try {
        return await doDiscordLogin(req, env)
    } catch (err) {
        console.error('Error logging in with Discord', err)
        return new Response('Internal Server Error', { status: 500 })
    }
})

export default { ...router }
