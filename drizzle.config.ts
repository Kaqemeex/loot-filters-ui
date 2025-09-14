import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './packages/api/src/db/schema.ts',
    out: './packages/api/migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'dummy',
        databaseId: process.env.CLOUDFLARE_DATABASE_ID || 'dummy',
        token: process.env.CLOUDFLARE_API_TOKEN || 'dummy',
    },
})
