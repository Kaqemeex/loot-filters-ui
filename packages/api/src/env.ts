import { D1Database } from '@cloudflare/workers-types'
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'

// Types for the Worker environment
export interface IEnv {
    DB: D1Database
    ENVIRONMENT: string
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
    DISCORD_REDIRECT_URI: string
    DISCORD_LOGIN_URI: string
}

export class Env {
    DB: DrizzleD1Database
    ENVIRONMENT: string
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
    DISCORD_REDIRECT_URI: string
    DISCORD_LOGIN_URI: string

    constructor(IEnv: IEnv) {
        this.DB = drizzle(IEnv.DB)
        this.ENVIRONMENT = IEnv.ENVIRONMENT
        this.DISCORD_CLIENT_ID = IEnv.DISCORD_CLIENT_ID
        this.DISCORD_CLIENT_SECRET = IEnv.DISCORD_CLIENT_SECRET
        this.DISCORD_REDIRECT_URI = IEnv.DISCORD_REDIRECT_URI
        this.DISCORD_LOGIN_URI = IEnv.DISCORD_LOGIN_URI
    }
}
