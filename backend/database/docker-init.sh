#!/bin/bash
# Docker entrypoint initialization script
# This script is called by docker-compose when PostgreSQL starts

set -e

echo "Initializing CodeGuardian AI database..."

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create the initial extension if needed
psql -U postgres -d postgres -c "CREATE DATABASE codeguardian_ai ENCODING 'UTF8';" 2>/dev/null || true

# Apply the schema
psql -U postgres -d codeguardian_ai < /docker-entrypoint-initdb.d/schema.sql

echo "Database initialization complete!"
