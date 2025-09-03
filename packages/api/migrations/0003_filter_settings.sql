-- Migration: 0002_filter_versions
-- Description: Add filters table to database


-- Create filter_versions table
CREATE TABLE IF NOT EXISTS filter_settings (
    filter_id TEXT PRIMARY KEY NOT NULL,
    settings TEXT NOT NULL
);

