# AI Orchestration Service - Python FastAPI

Multi-agent code analysis microservice using LangGraph for workflow orchestration and Groq API for LLM inference.

## Overview

The AI Orchestration Service coordinates multiple specialized AI agents to perform comprehensive code analysis:

- **Security Agent**: Detects vulnerabilities, hardcoded secrets, OWASP issues
- **Performance Agent**: Identifies inefficiencies, algorithmic issues, memory leaks
- **Logic Agent**: Validates business logic compliance and requirement satisfaction
- **Architecture Agent**: Evaluates design patterns, coupling, separation of concerns
- **Test Generator**: Creates test cases for edge cases and requirements

## Architecture

### FastAPI Application Structure

```
ai-orchestration/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app & routes
│   ├── config/
│   │   ├── settings.py         # Configuration management
│   ├── models/
│   │   └── schemas.py          # Pydantic models/DTOs
│   └── agents/
│       ├── workflow.py         # LangGraph workflow
│       └── utils.py            # Agent utilities
├── tests/
│   ├── test_api.py            # API endpoint tests
│   └── conftest.py            # Test fixtures
├── requirements.txt           # Python dependencies
├── main.py (not app/)        # Entry point
├── run.py                     # Alternative runner
└── pytest.ini                 # pytest configuration
```

### LangGraph Workflow

```
parse_code
    ↓
    ├→ security_agent ─┐
    ├→ performance_agent─┤
    ├→ logic_agent ─────┤
    └→ architecture_agent┤
                        ↓
                   test_generator
                        ↓
                   merge_findings
                        ↓
                      [END]
```

## Quick Start

### Installation

```bash
cd backend/services/ai-orchestration

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Setup

```bash
# Copy example and configure
cp .env.example .env

# Edit .env with your settings
export GROQ_API_KEY="your-groq-api-key"
export ENVIRONMENT=development
export LOG_LEVEL=INFO
```

### Running the Service

#### Option 1: Direct Python

```bash
python main.py
```

#### Option 2: Using run.py

```bash
python run.py
```

#### Option 3: Uvicorn directly

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 4: Docker Compose

```bash
cd ../../../
docker-compose up ai-orchestration
```

### Verification

```bash
# Check health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs

# List models
curl http://localhost:8000/api/models
```

## API Endpoints

### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "ai-orchestration",
  "uptime": 123.45,
  "timestamp": "2024-01-XX..."
}
```

### Analyze Code

```
POST /api/analyze
Content-Type: application/json

{
  "scan_id": "scan-123",
  "code": "def hello(): return 'world'",
  "language": "python",
  "file_name": "main.py",
  "business_requirements": ["Handle edge cases"]
}
```

Response:

```json
{
  "scan_id": "scan-123",
  "overall_score": 7.5,
  "security_score": 7.0,
  "performance_score": 8.0,
  "architecture_score": 7.5,
  "testing_score": 6.5,
  "issues": [
    {
      "id": "issue-0",
      "type": "security",
      "severity": "high",
      "title": "SQL Injection Risk",
      "description": "Found hardcoded SQL query",
      "line_number": 42,
      "suggested_fix": "Use parameterized queries",
      "confidence": 0.95,
      "agent_name": "security"
    }
  ],
  "generated_tests": [...],
  "summary": "Analyzed 1240 characters of python code",
  "agents_executed": ["Security", "Performance", "Architecture"]
}
```

### List Models

```
GET /api/models
```

Response:

```json
{
  "models": [
    {
      "name": "mixtral-8x7b-32768",
      "provider": "Groq",
      "context_window": 32768
    }
  ]
}
```

## Configuration

### Environment Variables

```bash
# Application
ENVIRONMENT=development          # development|production
DEBUG=false

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Logging
LOG_LEVEL=INFO

# Groq API
GROQ_API_KEY=<your-key>
GROQ_MODEL=mixtral-8x7b-32768
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=2048

# Redis (for caching)
REDIS_URL=redis://:redis@localhost:6379

# Kafka (for events)
KAFKA_BROKERS=localhost:29092

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Features
ENABLE_CACHING=true
ENABLE_REDIS_SNAPSHOTS=true
MAX_WORKFLOW_TOKENS=10000
```

## Development

### Running Tests

```bash
# All tests
pytest

# Specific test file
pytest tests/test_api.py

# Verbose with coverage
pytest -v --cov=app --cov-report=html

# Watch mode
pytest-watch
```

### Code Quality

```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

### Adding New Agents

1. Create agent function in `app/agents/workflow.py`:

```python
def custom_agent_node(state: CodeReviewState) -> CodeReviewState:
    """Custom agent implementation"""
    logger.info(f"Running custom agent for scan {state['scan_id']}")

    try:
        findings = []
        # Implementation here
        state['custom_findings'] = findings
    except Exception as e:
        state['errors'].append(f"Custom agent error: {str(e)}")

    return state
```

2. Add to workflow in `initialize_workflow()`:

```python
workflow.add_node("custom_agent", custom_agent_node)
workflow.add_edge("parse_code", "custom_agent")
workflow.add_edge("custom_agent", "merge_findings")
```

3. Update state in `CodeReviewState`:

```python
class CodeReviewState(TypedDict):
    custom_findings: Optional[List[dict]]
```

## Integration with Other Services

### NestJS Backend Communication

```python
# In handlers, call NestJS API Gateway
import httpx

async def send_analysis_to_gateway(result: AnalysisResult):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://api-gateway:3000/api/analysis/results",
            json=result.dict()
        )
        return response.json()
```

### Kafka Event Publishing

```python
# Publish events to Kafka for other services
from aiokafka import AIOKafkaProducer

async def publish_analysis_event(producer, result: AnalysisResult):
    await producer.send_and_wait(
        "analysis.completed",
        value=result.json().encode()
    )
```

## Performance Tuning

### Concurrency

```bash
# Adjust workers for production
gunicorn --workers 4 --worker-class uvicorn.workers.UvicornWorker app.main:app
```

### Caching

Enable Redis caching for repeated analyses:

```python
# In settings.py
ENABLE_CACHING=true
CACHE_TTL=3600  # 1 hour

# Queries are automatically cached by scan_id
```

### Token Management

Limit token usage to prevent costs:

```python
MAX_WORKFLOW_TOKENS=10000  # Limit per analysis
```

## Deployment

### Docker

```bash
# Build image
docker build -t codeguardian-ai-service:latest .

# Run container
docker run \
  -e GROQ_API_KEY=your-key \
  -e REDIS_URL=redis://redis:6379 \
  -p 8000:8000 \
  codeguardian-ai-service:latest
```

### Docker Compose

```yaml
ai-orchestration:
  build:
    context: ./backend/services/ai-orchestration
    dockerfile: Dockerfile
  ports:
    - "8000:8000"
  environment:
    GROQ_API_KEY: ${GROQ_API_KEY}
    REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    DATABASE_URL: postgresql://...
  depends_on:
    - redis
    - postgres
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestration
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: ai-orchestration
          image: codeguardian-ai-service:latest
          ports:
            - containerPort: 8000
          env:
            - name: GROQ_API_KEY
              valueFrom:
                secretKeyRef:
                  name: groq-secrets
                  key: api-key
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
```

## Troubleshooting

### Service won't start

```bash
# Check logs
tail -f logs/service.log

# Verify environment variables
echo $GROQ_API_KEY

# Check port availability
lsof -i :8000
```

### Slow analysis

```bash
# Check Redis connection
redis-cli ping

# Monitor CPU/Memory
htop

# Enable debug logging
LOG_LEVEL=DEBUG python main.py
```

### Groq API errors

```bash
# Verify API key
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/

# Check rate limits (50 req/min on free tier)
# Consider implementing rate limiting in app
```

## Dependencies

- **FastAPI** (0.109.0) - Web framework
- **LangGraph** (0.0.46) - Workflow orchestration
- **LangChain** (0.1.11) - LLM integrations
- **Groq** (0.1.0) - LLM API client
- **Pydantic** (2.5.3) - Data validation
- **SQLAlchemy** (2.0.23) - Database ORM
- **AIOKafka** (0.10.0) - Async Kafka client
- **Redis** (via aioredis) - Caching
- **Gunicorn** (21.2.0) - Production server

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangChain Documentation](https://python.langchain.com/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

**Last Updated**: 2024-01-XX  
**Python Version**: 3.11+  
**FastAPI Version**: 0.109+  
**Status**: Development Ready
