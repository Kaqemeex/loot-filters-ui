import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const FILTERS_TABLE = sqliteTable('filters', {
    filterId: text('id').primaryKey().notNull(),
    ownerDiscordId: text('owner_discord_id').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    public: integer('public', { mode: 'boolean' }).notNull(),
    currentVersionId: text('current_version_id').notNull(),
})

export const filterVersions = sqliteTable('filter_versions', {
    versionId: text('version_id').primaryKey().notNull(),
    filterId: text('filter_id').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    rawRs2f: text('raw_rs2f').notNull(),
    precompiledRs2f: text('precompiled_rs2f').notNull(),
    parsedMacros: text('parsed_macros').notNull(), // JSON stored as text
})

export const FILTER_SETTINGS_TABLE = sqliteTable('filter_settings', {
    filterId: text('filter_id').primaryKey().notNull(),
    settings: text('settings').notNull(), // JSON stored as text
})
