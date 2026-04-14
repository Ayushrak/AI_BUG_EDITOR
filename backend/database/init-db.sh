#!/bin/bash
# Database initialization script for CodeGuardian AI
# This script initializes the PostgreSQL database with the schema

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CodeGuardian AI Database Initialization ===${NC}"

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-codeguardian_ai}
SCHEMA_FILE="${1:-schema.sql}"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
  echo -e "${RED}Error: Schema file not found: $SCHEMA_FILE${NC}"
  exit 1
fi

# Set environment for psql
export PGPASSWORD=$DB_PASSWORD

echo -e "${BLUE}Connecting to PostgreSQL at $DB_HOST:$DB_PORT...${NC}"

# Create database if it doesn't exist
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8';"

echo -e "${GREEN}✓ Database '$DB_NAME' ready${NC}"

# Apply schema
echo -e "${BLUE}Applying schema from $SCHEMA_FILE...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SCHEMA_FILE"

echo -e "${GREEN}✓ Schema applied successfully${NC}"

# Verify key tables
echo -e "${BLUE}Verifying tables...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"

echo -e "${GREEN}✓ Database initialization complete!${NC}"
echo -e "${BLUE}Connection string: postgresql://$DB_USER:****@$DB_HOST:$DB_PORT/$DB_NAME${NC}"
