import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        databaseId: '23e9d8d1-5f16-42a8-8d7b-2345c75cc04d',
        token: process.env.CLOUDFLARE_API_TOKEN || '',
    },
})
