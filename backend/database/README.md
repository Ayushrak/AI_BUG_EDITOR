# CodeGuardian AI Database Schema

Complete PostgreSQL 15+ database schema for the CodeGuardian AI platform.

## Overview

This schema defines the complete data model for the CodeGuardian AI code review and bug detection platform. It supports:

- **Multi-tenancy**: User accounts with subscriptions and API keys
- **Code Scanning**: File uploads, analysis tracking, and result storage
- **Issue Detection**: Security, performance, architecture, and style issues
- **AI Agents**: Business logic validation, edge case detection, test generation
- **Chat/RAG**: Conversations and message history for code Q&A
- **Billing**: Subscription management and usage tracking
- **Integrations**: GitHub, OAuth2, webhooks, and Slack

## Files

### `schema.sql` (Main Schema)

Complete database schema with all tables, indexes, views, and functions:

**Core Tables:**

- `users` - User accounts with subscription and OAuth info
- `sessions` - Active user sessions with JWT tokens
- `code_scans` - Uploaded codebases for analysis
- `analysis_results` - Scoring and aggregated findings
- `issues` - Individual findings (bugs, security, performance, etc.)
- `business_requirements` - Custom validation rules
- `generated_test_cases` - AI-generated test cases
- `conversations` - Chat history for RAG queries
- `chat_messages` - Individual messages in conversations
- `subscription_plans` - Pricing tiers
- `user_subscriptions` - User subscription records
- `usage_metrics` - Daily usage tracking
- `notifications` - System notifications
- `api_keys` - API key management
- `github_integrations` - GitHub repo connections
- `audit_logs` - Complete audit trail

**Features:**

- UUID primary keys for security and scalability
- Comprehensive indexing for query performance
- JSONB columns for flexible metadata storage
- Foreign key constraints with CASCADE/SET NULL
- Audit triggers for timestamp updates
- Helper views for common queries

### `migrations/001_initial_schema.sql`

Migration file tracking the initial schema version.

### `init-db.sh`

Shell script for initializing PostgreSQL database locally:

```bash
./init-db.sh schema.sql
```

### `docker-init.sh`

Docker initialization script (auto-runs in docker-compose).

## Schema Highlights

### Users & Authentication

```
users (core account table)
├── Subscription tracking (Free/Pro/Team/Enterprise)
├── OAuth2 integration (GitHub, Google)
├── Sessions with JWT tokens
```

### Code Analysis

```
code_scans (uploaded code)
├── analysis_results (scores + aggregated findings)
│   ├── issues (individual findings)
│   │   ├── Security issues
│   │   ├── Performance issues
│   │   ├── Architecture issues
│   │   └── Style issues
│   ├── business_requirements (custom validation)
│   └── generated_test_cases (AI test gen)
```

### AI Features

```
conversations (chat sessions)
├── chat_messages (user/assistant messages)
└── code_context (linked to code in scans)

business_requirements (custom rules)
├── validation_report (JSONB results)
└── missing_cases (edge case array)
```

### Subscription & Usage

```
subscription_plans (pricing tiers)
├── users → user_subscriptions (active tier)
└── usage_metrics (daily tracking)
```

## Quick Start

### 1. Linux/Mac - Initialize locally:

```bash
cd backend/database
chmod +x init-db.sh
./init-db.sh schema.sql
```

### 2. Docker - Use docker-compose:

```bash
docker-compose up postgres
# Database auto-initializes from schema.sql
```

### 3. Connect:

```bash
psql postgresql://postgres:password@localhost:5432/codeguardian_ai
```

## Key Design Decisions

### UUIDs

- All primary keys are UUIDs for security and distributed systems
- Supports microservices replication and sharding

### JSONB Columns

- `analysis_results.analysis_json` - Full analysis data
- `business_requirements.validation_report` - Validation details
- `subscription_plans.features` - Feature flags per tier
- Enables flexibility without schema migration

### Audit Logging

- `audit_logs` table tracks all changes
- Useful for compliance and debugging
- Timestamps on all tables

### Indexes

- Created on foreign keys for join performance
- Text search indexes on issues (title, description)
- JSONB indexes using GIN
- Composite indexes where needed

## Subscription Model

Three tiers built into schema:

| Plan               | Free | Pro    | Team   | Enterprise |
| ------------------ | ---- | ------ | ------ | ---------- |
| Price              | $0   | $19/mo | $49/mo | Custom     |
| Lines/mo           | 1K   | 100K   | 500K   | Unlimited  |
| Scans/mo           | 3    | 50     | 200    | Unlimited  |
| API Calls/hr       | 60   | 1,000  | 5,000  | Unlimited  |
| GitHub Integration | ✗    | ✓      | ✓      | ✓          |
| AI Chat            | ✗    | ✓      | ✓      | ✓          |
| Business Logic     | ✗    | ✓      | ✓      | ✓          |

## Performance Considerations

### Indexes

- Every foreign key has an index
- Text search on issue title/description
- Date range queries optimized with `created_at` indexes
- Compound indexes on (user_id, created_at)

### JSONB Optimization

- GIN indexes on JSONB columns for fast queries
- Compress large JSON with `jsonb_compact` in queries

### Connection Pooling

- Use PgBouncer or connection pool in app layer
- Keep connections under 100 per service

### Maintenance

- Run `ANALYZE` weekly to update statistics
- `VACUUM` nightly to clean dead tuples
- Monitor slow queries with `pg_stat_statements`

## Common Queries

### Get user's recent scans with scores:

```sql
SELECT cs.id, cs.file_name, ar.overall_score, COUNT(i.id) as issues
FROM code_scans cs
LEFT JOIN analysis_results ar ON cs.id = ar.scan_id
LEFT JOIN issues i ON cs.id = i.scan_id
WHERE cs.user_id = $1
GROUP BY cs.id, cs.file_name, ar.overall_score
ORDER BY cs.created_at DESC
LIMIT 10;
```

### Find critical security issues:

```sql
SELECT id, title, code_snippet, suggested_fix
FROM issues
WHERE severity = 'critical'
  AND issue_type = 'security'
  AND is_resolved = false
ORDER BY created_at DESC;
```

### Get user dashboard stats:

```sql
SELECT * FROM v_user_dashboard WHERE id = $1;
```

## Migration Strategy

### Adding new columns:

```sql
-- 1. Create migration file: migrations/002_add_feature.sql
-- 2. Add ALTER TABLE statement
-- 3. Run: psql -d codeguardian_ai -f migrations/002_add_feature.sql
-- 4. Update ORM models
```

### Production Migrations

- Test on staging first
- Use pg_dump for backup
- Plan for downtime or use zero-downtime strategies
- Keep `init-db.sh` updated with final schema

## Monitoring Queries

### Table sizes:

```sql
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Unused indexes:

```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Slow queries:

```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Backing Up & Restoring

### Backup entire database:

```bash
pg_dump -U postgres codeguardian_ai > backup.sql
```

### Restore from backup:

```bash
psql -U postgres -d codeguardian_ai < backup.sql
```

## Next Steps

1. **Run schema initialization** → `./init-db.sh schema.sql`
2. **Verify tables** → Listed above with descriptions
3. **Create ORM models** → Map tables to TypeScript/Python classes
4. **Add service layer** → Service logic that queries these tables
5. **Implement auth** → JWT validation against sessions table

---

**Last Updated:** 2024-01-XX  
**PostgreSQL Version:** 15+  
**Schema Version:** 1.0
