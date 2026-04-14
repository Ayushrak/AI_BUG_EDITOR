-- Migration 001: Initial Schema Creation
-- Created: 2024-01-XX
-- Description: Creates the complete CodeGuardian AI database schema

-- This migration file references the main schema.sql file
-- In production, use:
-- psql -U postgres -d codeguardian_ai < /path/to/schema.sql

-- To track migrations, this file documents the migration history
-- Run migrations in order: 001, 002, 003, etc.

-- Schema version table for tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT INTO schema_migrations (version, name)
VALUES (1, 'initial_schema')
ON CONFLICT DO NOTHING;
