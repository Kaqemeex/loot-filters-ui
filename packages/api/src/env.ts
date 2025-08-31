import { D1Database } from '@cloudflare/workers-types'

// Types for the Worker environment
export interface Env {
    DB: D1Database
    ENVIRONMENT: string
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
    DISCORD_REDIRECT_URI: string
}
