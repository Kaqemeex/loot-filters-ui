import { D1Database } from '@cloudflare/workers-types'
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'

// Types for the Worker environment
export interface IEnv {
    DB: D1Database
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
}

export class Env {
    DB: DrizzleD1Database
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string

    constructor(IEnv: IEnv) {
        this.DB = drizzle(IEnv.DB)
        this.DISCORD_CLIENT_ID = IEnv.DISCORD_CLIENT_ID
        this.DISCORD_CLIENT_SECRET = IEnv.DISCORD_CLIENT_SECRET
    }
}
