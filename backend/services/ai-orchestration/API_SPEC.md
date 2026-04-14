# AI Orchestration Service - API Specification

## Base URL

- Development: `http://localhost:8000`
- Staging: `https://api-staging.codeguardian.dev/ai-orchestration`
- Production: `https://api.codeguardian.prod/ai-orchestration`

## Authentication

Currently handled by API Gateway (NestJS). Direct API calls should include:

```
Authorization: Bearer <JWT_TOKEN>
X-Scan-ID: <SCAN_ID>
```

For development without gateway:

```bash
INSECURE_MODE=true  # In .env (development only)
```

## Endpoints

### 1. Health Check

Check service availability and version.

**Request**

```http
GET /health
```

**Response (200 OK)**

```json
{
  "status": "ok",
  "service": "ai-orchestration",
  "version": "1.0.0",
  "uptime": 3661.45,
  "timestamp": "2024-01-15T10:30:45.123Z",
  "dependencies": {
    "redis": "connected",
    "postgres": "connected",
    "groq": "ok"
  }
}
```

**Response (503 Service Unavailable)**

```json
{
  "status": "error",
  "service": "ai-orchestration",
  "message": "Redis connection failed",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 2. Analyze Code

Perform comprehensive code analysis using multiple AI agents.

**Request**

```http
POST /api/analyze
Content-Type: application/json

{
  "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
  "code": "def hello(name):\n    return f'Hello {name}'",
  "language": "python",
  "file_name": "app.py",
  "business_requirements": [
    "Must handle empty strings",
    "Should support unicode characters"
  ],
  "context": {
    "framework": "FastAPI",
    "is_production": true,
    "has_tests": false
  }
}
```

**Request Parameters**

| Field                   | Type            | Required | Description                                                                                       |
| ----------------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `scan_id`               | `string` (UUID) | Yes      | Unique scan identifier                                                                            |
| `code`                  | `string`        | Yes      | Source code to analyze (max 50,000 chars)                                                         |
| `language`              | `string`        | Yes      | Programming language: `python`, `javascript`, `typescript`, `java`, `csharp`, `go`, `rust`, `cpp` |
| `file_name`             | `string`        | No       | Original file name for context                                                                    |
| `business_requirements` | `string[]`      | No       | Business rules to validate against                                                                |
| `context`               | `object`        | No       | Additional context about code                                                                     |

**Response (200 OK)**

```json
{
  "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "processing_time_ms": 4523,
  "overall_score": 7.2,
  "scores": {
    "security": 6.5,
    "performance": 8.1,
    "logic": 7.8,
    "architecture": 7.0,
    "testing": 6.5
  },
  "issues": [
    {
      "id": "issue-001",
      "type": "security",
      "severity": "high",
      "title": "Potential SQL Injection Vulnerability",
      "description": "User input is directly concatenated into SQL query without parameterization.",
      "line_number": 42,
      "code_snippet": "query = f'SELECT * FROM users WHERE id = {user_id}'",
      "suggested_fix": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
      "references": {
        "owasp": "A03:2021 - Injection",
        "cwe": "CWE-89",
        "url": "https://owasp.org/www-community/attacks/SQL_Injection"
      },
      "confidence": 0.95,
      "agent_name": "security",
      "tags": ["injection", "database", "external-input"]
    },
    {
      "id": "issue-002",
      "type": "performance",
      "severity": "medium",
      "title": "Inefficient List Comprehension with Nested Loop",
      "description": "Algorithm appears to be O(n²) due to nested iteration pattern.",
      "line_number": 18,
      "code_snippet": "results = [x for x in items for y in data if x == y]",
      "suggested_fix": "Use set for O(1) lookup: data_set = set(data); results = [x for x in items if x in data_set]",
      "references": {
        "pattern": "Inefficient algorithm complexity",
        "url": "https://wiki.python.org/moin/PythonSpeed/PerformanceTips"
      },
      "confidence": 0.82,
      "agent_name": "performance",
      "tags": ["algorithm", "complexity", "optimization"]
    },
    {
      "id": "issue-003",
      "type": "logic",
      "severity": "high",
      "title": "Requirement Violation: Missing Edge Case Handling",
      "description": "Business requirement 'Handle empty strings' not satisfied. Function returns None for empty input.",
      "line_number": 5,
      "code_snippet": "if len(name) == 0:\n    return None",
      "suggested_fix": "Return meaningful default: return 'Hello World' or raise ValueError with clear message",
      "references": {
        "requirement": "Must handle empty strings",
        "impact": "Production failure risk"
      },
      "confidence": 0.98,
      "agent_name": "logic",
      "tags": ["requirements", "edge-case"]
    }
  ],
  "generated_tests": [
    {
      "test_id": "test-001",
      "name": "test_empty_string_handling",
      "description": "Verify function behavior with empty string input",
      "code": "def test_empty_string_handling():\n    result = hello('')\n    assert result is not None\n    assert isinstance(result, str)",
      "severity": "high",
      "category": "edge_case"
    },
    {
      "test_id": "test-002",
      "name": "test_unicode_character_support",
      "description": "Verify function handles unicode characters as per requirements",
      "code": "def test_unicode_character_support():\n    result = hello('你好')\n    assert '你好' in result\n    result2 = hello('😊')\n    assert '😊' in result2",
      "severity": "medium",
      "category": "unicode_support"
    }
  ],
  "summary": {
    "total_issues": 3,
    "by_severity": {
      "critical": 0,
      "high": 2,
      "medium": 1,
      "low": 0
    },
    "by_type": {
      "security": 1,
      "performance": 1,
      "logic": 1,
      "architecture": 0,
      "testing": 0
    },
    "recommendation": "Address security issue immediately. Review performance optimization before production deployment."
  },
  "agents_executed": [
    {
      "name": "security",
      "status": "completed",
      "duration_ms": 1200,
      "findings_count": 1
    },
    {
      "name": "performance",
      "status": "completed",
      "duration_ms": 950,
      "findings_count": 1
    },
    {
      "name": "logic",
      "status": "completed",
      "duration_ms": 1100,
      "findings_count": 1
    },
    {
      "name": "architecture",
      "status": "completed",
      "duration_ms": 800,
      "findings_count": 0
    }
  ]
}
```

**Response (400 Bad Request)**

```json
{
  "error": "invalid_request",
  "message": "Code length exceeds maximum of 50,000 characters",
  "details": {
    "code_length": 75000,
    "max_allowed": 50000
  }
}
```

**Response (429 Too Many Requests)**

```json
{
  "error": "rate_limited",
  "message": "Analysis limit exceeded. 30 requests per minute allowed.",
  "retry_after_seconds": 45
}
```

**Response (500 Internal Server Error)**

```json
{
  "error": "analysis_failed",
  "message": "An error occurred during analysis. Please try again.",
  "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
  "request_id": "req-12345",
  "support_url": "https://support.codeguardian.dev/errors/500"
}
```

---

### 3. List Available Models

Get list of available LLM models for analysis.

**Request**

```http
GET /api/models
```

**Response (200 OK)**

```json
{
  "models": [
    {
      "id": "mixtral-8x7b-32768",
      "name": "Mixtral 8x7B",
      "provider": "Groq",
      "context_window": 32768,
      "max_tokens": 4096,
      "description": "Mixture of Experts model optimized for code analysis",
      "available": true,
      "rate_limit": {
        "requests_per_minute": 50,
        "tokens_per_minute": 25000
      }
    },
    {
      "id": "llama2-70b-4096",
      "name": "Llama 2 70B",
      "provider": "Groq",
      "context_window": 4096,
      "max_tokens": 1024,
      "description": "Meta's Llama 2 model (4K context variant)",
      "available": true,
      "rate_limit": {
        "requests_per_minute": 100,
        "tokens_per_minute": 50000
      }
    }
  ],
  "default_model": "mixtral-8x7b-32768",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 4. Get Analysis Status (Async)

For long-running analyses, check status without blocking.

**Request**

```http
GET /api/analysis/{scan_id}/status
```

**URL Parameters**

| Parameter | Type          | Description            |
| --------- | ------------- | ---------------------- |
| `scan_id` | string (UUID) | Unique scan identifier |

**Response (200 OK)**

```json
{
  "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
  "status": "in_progress",
  "progress": {
    "current_agent": "performance",
    "agents_completed": ["security", "logic"],
    "agents_total": 5,
    "percent_complete": 60
  },
  "estimated_remaining_seconds": 15,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 5. Cancel Analysis

Cancel an in-progress analysis.

**Request**

```http
DELETE /api/analysis/{scan_id}
```

**Response (204 No Content)**

```
(empty body)
```

---

### 6. Get Analysis History

Retrieve past analyses for a user/session.

**Request**

```http
GET /api/analysis/history?limit=20&offset=0&language=python
```

**Query Parameters**

| Parameter    | Type    | Default     | Description                                  |
| ------------ | ------- | ----------- | -------------------------------------------- |
| `limit`      | integer | 20          | Results per page (max 100)                   |
| `offset`     | integer | 0           | Pagination offset                            |
| `language`   | string  | -           | Filter by language                           |
| `severity`   | string  | -           | Filter by issue: critical, high, medium, low |
| `sort_by`    | string  | `timestamp` | Sort field: timestamp, score, issues_count   |
| `sort_order` | string  | `desc`      | asc or desc                                  |

**Response (200 OK)**

```json
{
  "analyses": [
    {
      "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
      "file_name": "app.py",
      "language": "python",
      "overall_score": 7.2,
      "issues_count": 3,
      "timestamp": "2024-01-15T10:30:45.123Z",
      "processing_time_ms": 4523
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

---

### 7. Get Issue Details

Get detailed information about a specific issue.

**Request**

```http
GET /api/issues/{issue_id}
```

**Response (200 OK)**

```json
{
  "id": "issue-001",
  "scan_id": "scan-550e8400-e29b-41d4-a716-446655440000",
  "type": "security",
  "severity": "high",
  "title": "Potential SQL Injection Vulnerability",
  "description": "User input is directly concatenated into SQL query without parameterization.",
  "line_number": 42,
  "code_snippet": "query = f'SELECT * FROM users WHERE id = {user_id}'",
  "suggested_fix": "Use parameterized queries",
  "references": {
    "owasp": "A03:2021 - Injection",
    "cwe": "CWE-89",
    "url": "https://owasp.org/www-community/attacks/SQL_Injection"
  },
  "confidence": 0.95,
  "agent_name": "security",
  "tags": ["injection", "database", "external-input"],
  "related_issues": ["issue-005", "issue-007"],
  "false_positive_report_url": "https://api.codeguardian.dev/issues/issue-001/report-false-positive",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 8. Report False Positive

Flag an issue as misidentified.

**Request**

```http
POST /api/issues/{issue_id}/report-false-positive
Content-Type: application/json

{
  "reason": "Fixed by using parameterized queries - not actually vulnerable",
  "evidence": "See commit abc123def456",
  "user_id": "user-789"
}
```

**Response (201 Created)**

```json
{
  "report_id": "report-550e8400-e29b-41d4-a716-446655440001",
  "issue_id": "issue-001",
  "status": "pending_review",
  "timestamp": "2024-01-15T10:31:00.123Z",
  "message": "Thank you! Your feedback helps improve CodeGuardian."
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request**

```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "details": [
    {
      "field": "code",
      "message": "Code cannot be empty"
    },
    {
      "field": "language",
      "message": "Unsupported language: cobol"
    }
  ]
}
```

**401 Unauthorized**

```json
{
  "error": "unauthorized",
  "message": "Authentication token is invalid or expired"
}
```

**403 Forbidden**

```json
{
  "error": "forbidden",
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found**

```json
{
  "error": "not_found",
  "message": "Analysis with ID 'scan-123' not found"
}
```

**429 Too Many Requests**

```json
{
  "error": "rate_limited",
  "message": "Rate limit exceeded: 30 requests per minute",
  "retry_after_seconds": 45,
  "headers": {
    "Retry-After": "45",
    "X-RateLimit-Limit": "30",
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": "1705318290"
  }
}
```

**502 Bad Gateway**

```json
{
  "error": "provider_error",
  "message": "Groq API is temporarily unavailable",
  "retry_after_seconds": 30
}
```

### Error Response Format

All errors follow this structure:

```json
{
  "error": "<error_code>",
  "message": "<user_friendly_message>",
  "details": {},
  "request_id": "req-12345",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

## Data Types & Schemas

### CodeIssue

```json
{
  "id": "string (UUID)",
  "type": "enum (security|performance|logic|architecture|testing)",
  "severity": "enum (critical|high|medium|low)",
  "title": "string",
  "description": "string",
  "line_number": "integer",
  "code_snippet": "string",
  "suggested_fix": "string",
  "confidence": "number (0-1)",
  "agent_name": "string",
  "references": {
    "owasp": "string?",
    "cwe": "string?",
    "url": "string?"
  },
  "tags": "string[]"
}
```

### AnalysisResult

```json
{
  "scan_id": "string (UUID)",
  "timestamp": "RFC3339",
  "processing_time_ms": "integer",
  "overall_score": "number (0-10)",
  "scores": {
    "security": "number",
    "performance": "number",
    "logic": "number",
    "architecture": "number",
    "testing": "number"
  },
  "issues": "CodeIssue[]",
  "generated_tests": "TestCase[]",
  "summary": "AnalysisSummary",
  "agents_executed": "AgentExecution[]"
}
```

---

## Rate Limiting

**Default Limits:**

- 30 requests per minute per user
- 10 concurrent analyses per user
- 50,000 characters of code per request

**Headers Returned:**

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705318290
```

---

## Pagination

All list endpoints support pagination:

**Request**

```http
GET /api/analysis/history?limit=20&offset=40
```

**Response**

```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "limit": 20,
    "offset": 40,
    "pages": 25,
    "has_next": true,
    "has_previous": true
  }
}
```

---

## Versioning

The API is currently at version **v1**. Future versions will be available at `/api/v2`, etc.

No breaking changes without version increment and 30-day deprecation notice.

---

## WebSocket (Future)

Real-time analysis updates via WebSocket:

```javascript
// Connect
const ws = new WebSocket("wss://api.codeguardian.dev/ws/analysis/scan-123");

// Messages
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // {
  //   type: 'agent_started|agent_completed|issue_found|analysis_complete',
  //   payload: {...}
  // }
};

// Disconnect (auto-closes after analysis)
ws.close();
```

---

**API Specification Version:** 1.0  
**Last Updated:** 2024-01-15  
**Next Major Version:** 2.0 (Q3 2024)
