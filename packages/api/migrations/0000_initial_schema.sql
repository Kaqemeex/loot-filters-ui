-- Migration: 0000_initial_schema
-- Description: Initial database schema with users, loot_filters, and user_sessions tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    discord_username TEXT NOT NULL,
    refresh_token TEXT,
    auth_token TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id TEXT PRIMARY KEY NOT NULL,
    discord_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
