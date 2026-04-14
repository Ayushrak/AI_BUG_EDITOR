-- =====================================================
-- CodeGuardian AI - Complete Database Schema
-- PostgreSQL 15+
-- =====================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For encryption

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  
  -- Subscription
  subscription_plan VARCHAR(50) DEFAULT 'free', -- free, pro, team, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, cancelled, suspended
  subscription_end_date TIMESTAMP,
  
  -- OAuth
  github_id VARCHAR(255) UNIQUE,
  github_username VARCHAR(255),
  github_token TEXT,  -- encrypted
  google_id VARCHAR(255) UNIQUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT session_not_expired CHECK (expires_at > CURRENT_TIMESTAMP)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);

-- =====================================================
-- CODE SCANS & ANALYSIS
-- =====================================================

CREATE TABLE IF NOT EXISTS code_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- File info
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(50), -- javascript, python, java, etc.
  original_file_size INT,
  lines_of_code INT,
  
  -- Repository info (optional)
  repo_name VARCHAR(255),
  repo_url VARCHAR(500),
  branch VARCHAR(255),
  commit_hash VARCHAR(40),
  
  -- GitHub PR (optional)
  github_repo VARCHAR(255),
  github_pr_number INT,
  github_pr_url VARCHAR(500),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, analyzing, completed, failed
  error_message TEXT,
  
  -- Timing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  tags VARCHAR(255)[], -- Array of tags
  is_public BOOLEAN DEFAULT false,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'analyzing', 'completed', 'failed'))
);

CREATE INDEX idx_scans_user_id ON code_scans(user_id);
CREATE INDEX idx_scans_status ON code_scans(status);
CREATE INDEX idx_scans_created_at ON code_scans(created_at);
CREATE INDEX idx_scans_file_type ON code_scans(file_type);

-- =====================================================
-- ANALYSIS RESULTS
-- =====================================================

CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL UNIQUE REFERENCES code_scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scoring
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  security_score DECIMAL(3,1) CHECK (security_score >= 0 AND security_score <= 10),
  performance_score DECIMAL(3,1) CHECK (performance_score >= 0 AND performance_score <= 10),
  maintainability_score DECIMAL(3,1) CHECK (maintainability_score >= 0 AND maintainability_score <= 10),
  architecture_score DECIMAL(3,1) CHECK (architecture_score >= 0 AND architecture_score <= 10),
  testing_score DECIMAL(3,1) CHECK (testing_score >= 0 AND testing_score <= 10),
  
  -- Findings count
  total_issues INT DEFAULT 0,
  critical_issues INT DEFAULT 0,
  high_issues INT DEFAULT 0,
  medium_issues INT DEFAULT 0,
  low_issues INT DEFAULT 0,
  
  -- Generated content
  generated_tests INT DEFAULT 0,
  recommended_fixes INT DEFAULT 0,
  
  -- Risk prediction
  production_risk_score DECIMAL(3,2) DEFAULT 0,
  risk_level VARCHAR(20), -- low, medium, high, critical
  
  -- Full analysis (JSONB for flexibility)
  analysis_json JSONB,
  summary TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_scan_id ON analysis_results(scan_id);
CREATE INDEX idx_analysis_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_overall_score ON analysis_results(overall_score);

-- =====================================================
-- ISSUES/FINDINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES code_scans(id) ON DELETE CASCADE,
  analysis_result_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
  
  -- Issue type
  issue_type VARCHAR(50) NOT NULL, -- bug, security, performance, style, architecture
  severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
  category VARCHAR(100), -- SQL injection, XSS, etc.
  
  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Code location
  file_path VARCHAR(255),
  line_number INT,
  column_number INT,
  code_snippet TEXT,
  
  -- AI-generated fix
  suggested_fix TEXT,
  fixed_code TEXT,
  
  -- Metadata
  agent_name VARCHAR(100), -- Which agent detected this
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  rule_id VARCHAR(255), -- e.g., semgrep rule ID
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_issue_type CHECK (issue_type IN ('bug', 'security', 'performance', 'style', 'architecture')),
  CONSTRAINT valid_severity CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_issues_scan_id ON issues(scan_id);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_issue_type ON issues(issue_type);
CREATE INDEX idx_issues_agent_name ON issues(agent_name);

-- =====================================================
-- BUSINESS REQUIREMENTS & VALIDATION
-- =====================================================

CREATE TABLE IF NOT EXISTS business_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES code_scans(id) ON DELETE CASCADE,
  
  -- Requirement
  requirement_text TEXT NOT NULL,
  target_function VARCHAR(255),
  
  -- Validation result
  meets_requirement BOOLEAN,
  compliance_percentage DECIMAL(5,2),
  
  -- Missing cases
  missing_cases TEXT[], -- Array of missing edge cases
  
  -- Report
  validation_report JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requirements_scan_id ON business_requirements(scan_id);

-- =====================================================
-- GENERATED TEST CASES
-- =====================================================

CREATE TABLE IF NOT EXISTS generated_test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID NOT NULL REFERENCES code_scans(id) ON DELETE CASCADE,
  
  -- Test info
  test_name VARCHAR(255),
  test_code TEXT NOT NULL,
  test_type VARCHAR(50), -- unit, integration, edge-case, performance
  
  -- Target
  function_tested VARCHAR(255),
  language VARCHAR(50), -- javascript, python, java, etc.
  framework VARCHAR(100), -- jest, junit, pytest, xunit
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_test_type CHECK (test_type IN ('unit', 'integration', 'edge-case', 'performance'))
);

CREATE INDEX idx_tests_scan_id ON generated_test_cases(scan_id);

-- =====================================================
-- AI CHAT & CONVERSATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES code_scans(id) ON DELETE SET NULL,
  
  -- Metadata
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Embeddings for retrieval
  embedding_vector VECTOR(1536) DEFAULT NULL  -- For pgvector extension if installed
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_scan_id ON conversations(scan_id);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Message
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  
  -- Context
  code_context TEXT,
  code_context_line_start INT,
  code_context_line_end INT,
  
  -- AI metadata
  model_used VARCHAR(100),
  tokens_used INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

CREATE INDEX idx_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_messages_role ON chat_messages(role);

-- =====================================================
-- SUBSCRIPTION & BILLING
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL, -- free, pro, team, enterprise
  display_name VARCHAR(255),
  description TEXT,
  price_usd DECIMAL(10,2),
  billing_cycle VARCHAR(20), -- monthly, yearly
  
  -- Limits
  lines_per_month INT,
  scans_per_month INT,
  api_calls_per_hour INT,
  concurrent_scans INT,
  
  -- Features
  features JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Dates
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  renews_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, suspended
  auto_renew BOOLEAN DEFAULT true,
  
  -- Payment
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255)
);

CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);

-- =====================================================
-- USAGE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Daily metrics
  date DATE NOT NULL,
  scans_count INT DEFAULT 0,
  lines_analyzed INT DEFAULT 0,
  issues_found INT DEFAULT 0,
  api_calls INT DEFAULT 0,
  
  -- Aggregated
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_date ON usage_metrics(date);

-- =====================================================
-- NOTIFICATIONS & EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification
  type VARCHAR(100), -- scan_completed, issue_found, etc.
  title VARCHAR(255),
  message TEXT,
  
  -- Related entity
  related_scan_id UUID REFERENCES code_scans(id) ON DELETE SET NULL,
  related_issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  -- Channels sent to
  sent_to_email BOOLEAN DEFAULT false,
  sent_to_slack BOOLEAN DEFAULT false,
  sent_to_webhook BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- API KEYS & INTEGRATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Key info
  key_prefix VARCHAR(10), -- first 10 chars visible
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  
  -- Permissions
  scopes VARCHAR(255)[], -- array of permissions
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  
  -- Lifecycle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- GitHub integrations
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- GitHub info
  github_repo_owner VARCHAR(255),
  github_repo_name VARCHAR(255),
  github_repo_full_name VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  auto_review_prs BOOLEAN DEFAULT false,
  
  -- Events
  last_synced_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, github_repo_full_name)
);

CREATE INDEX idx_github_integrations_user_id ON github_integrations(user_id);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action
  action VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- JSONB indexes
CREATE INDEX idx_analysis_json ON analysis_results USING GIN(analysis_json);
CREATE INDEX idx_requirement_report ON business_requirements USING GIN(validation_report);

-- Text search indexes
CREATE INDEX idx_issues_title_search ON issues USING GIN(to_tsvector('english', title));
CREATE INDEX idx_issues_description_search ON issues USING GIN(to_tsvector('english', description));

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User dashboard view
CREATE OR REPLACE VIEW v_user_dashboard AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.subscription_plan,
  COUNT(DISTINCT cs.id) as total_scans,
  COUNT(DISTINCT i.id) as total_issues,
  AVG(ar.overall_score) as avg_score,
  MAX(cs.created_at) as last_scan_date
FROM users u
LEFT JOIN code_scans cs ON u.id = cs.user_id
LEFT JOIN analysis_results ar ON cs.id = ar.scan_id
LEFT JOIN issues i ON cs.id = i.scan_id
GROUP BY u.id, u.email, u.full_name, u.subscription_plan;

-- Recent scans with issues
CREATE OR REPLACE VIEW v_recent_scans_with_issues AS
SELECT 
  cs.id,
  cs.user_id,
  cs.file_name,
  cs.lines_of_code,
  cs.created_at,
  COUNT(i.id) as issue_count,
  ar.overall_score
FROM code_scans cs
LEFT JOIN analysis_results ar ON cs.id = ar.scan_id
LEFT JOIN issues i ON cs.id = i.scan_id
GROUP BY cs.id, cs.user_id, cs.file_name, cs.lines_of_code, cs.created_at, ar.overall_score
ORDER BY cs.created_at DESC;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sessions table
CREATE TRIGGER trigger_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for analysis_results table
CREATE TRIGGER trigger_analysis_results_updated_at
BEFORE UPDATE ON analysis_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_usd, billing_cycle, lines_per_month, scans_per_month, api_calls_per_hour, concurrent_scans, features)
VALUES
  ('free', 'Free', 'For getting started', 0, 'monthly', 1000, 3, 60, 1, '{"github_integration": false, "ai_chat": false, "business_logic_validation": false}'::jsonb),
  ('pro', 'Professional', 'For individuals and small teams', 19.99, 'monthly', 100000, 50, 1000, 5, '{"github_integration": true, "ai_chat": true, "business_logic_validation": true, "edge_case_generation": true}'::jsonb),
  ('team', 'Team', 'For dev teams', 49.99, 'monthly', 500000, 200, 5000, 20, '{"github_integration": true, "ai_chat": true, "business_logic_validation": true, "slack_integration": true, "team_analytics": true}'::jsonb),
  ('enterprise', 'Enterprise', 'Custom deployment and support', NULL, 'custom', NULL, NULL, NULL, NULL, '{"all_features": true, "sso": true, "sla": true, "on_premise": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
