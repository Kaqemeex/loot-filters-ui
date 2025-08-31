import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
    discordId: text('discord_id').primaryKey(),
    discordUsername: text('discord_username').notNull(),
    refreshToken: text('refresh_token'),
    authToken: text('auth_token'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const userSessions = sqliteTable('user_sessions', {
    sessionId: text('session_id').primaryKey(),
    discordId: text('discord_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})
