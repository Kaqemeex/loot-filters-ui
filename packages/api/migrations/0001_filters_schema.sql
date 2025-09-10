-- Migration: 0001_filters_schema
-- Description: Add filters table to database

-- Create filters table
CREATE TABLE IF NOT EXISTS filters (
    id TEXT PRIMARY KEY NOT NULL,
    owner_discord_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    public BOOLEAN NOT NULL,
    current_version_id TEXT NOT NULL
);
