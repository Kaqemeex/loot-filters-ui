-- Migration: 0002_filter_versions
-- Description: Add filters table to database


-- Create filter_versions table
CREATE TABLE IF NOT EXISTS filter_versions (
    version_id TEXT PRIMARY KEY NOT NULL,
    filter_id TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    raw_rs2f TEXT NOT NULL,
    precompiled_rs2f TEXT NOT NULL,
    parsed_macros TEXT NOT NULL
);

