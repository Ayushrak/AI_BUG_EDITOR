# Architecture Decision Records & Design Patterns

## Service Architecture

### Why FastAPI + LangGraph?

**FastAPI**

- Modern, async-first Python framework
- Automatic OpenAPI documentation
- Type safety with Pydantic
- High performance (near Node.js speeds)
- Easy integration with LangChain/LangGraph

**LangGraph**

- Graph-based workflow orchestration
- Built for multi-agent LLM systems
- State management between agents
- Error handling and recovery
- Supports human-in-the-loop workflows
- Better than simple sequential calls

### Alternative Architectures Considered

| Architecture                  | Pros               | Cons                            | Decision             |
| ----------------------------- | ------------------ | ------------------------------- | -------------------- |
| **Simple API Calls**          | Lightweight        | No coordination, error handling | ❌ Rejected          |
| **Celery/RabbitMQ**           | Horizontal scaling | Complexity, latency             | Future consideration |
| **LangGraph**                 | Agent coordination | Requires new paradigm           | ✅ **Selected**      |
| **Actor Model** (Pydantic AI) | True async         | Immature alternative            | Defer to v2          |

## Agent Design Patterns

### Per-Agent Architecture

Each agent follows the same pattern:

```
INPUT → VALIDATE → ANALYZE → EXTRACT → OUTPUT
  ↓        ↓         ↓        ↓          ↓
Struct  Check type Gather   Parse    List[Finding]
code    & range   facts    LLM
                           response
```

### Stateful Agent Workflow

Agents maintain state in a shared dictionary:

```python
class CodeReviewState(TypedDict):
    scan_id: str
    code: str
    parse_result: dict
    security_findings: List[dict]
    performance_findings: List[dict]
    errors: List[str]
```

**Why this approach?**

- No database calls during analysis (fast)
- Full audit trail in state
- Enables async parallel execution
- Easy to test and debug

### LLM Prompting Strategy

Each agent uses:

1. **System Prompt**: Role definition & constraints
2. **Code Context**: Tokenized code snippet
3. **Structured Output**: Pydantic model enforcement
4. **Few-Shot Examples**: Real vulnerability examples

```python
SECURITY_SYSTEM_PROMPT = """
You are a code security expert. Analyze code for:
1. SQL Injection, XSS, CSRF
2. Hardcoded secrets (API keys, passwords)
3. Unsafe deserialization
4. Path traversal vulnerabilities

Output valid JSON.
"""
```

## Data Flow

```
Frontend (NestJS)
    ↓
POST /api/analyze
    ↓
API Gateway (NestJS)
    ↓
AI Service (FastAPI)
    ├─→ Parse code
    ├─→ [Parallel] Run 4 agents
    │   ├─→ Security Agent
    │   ├─→ Performance Agent
    │   ├─→ Logic Agent
    │   └─→ Architecture Agent
    ├─→ Generate tests
    ├─→ Merge findings
    └─→ Return results
    ↓
Store in DB (PostgreSQL)
    ↓
Response to Frontend
```

## Error Handling Strategy

### Fail-Safe Design

If an agent fails, operation continues:

```python
async def run_agent(agent_name: str, state: CodeReviewState) -> CodeReviewState:
    try:
        # Run agent
        findings = await agent_fn(state)
        state[f'{agent_name}_findings'] = findings
    except Exception as e:
        logger.error(f"Agent {agent_name} failed: {e}")
        state['errors'].append(f"{agent_name}: {str(e)}")
        state[f'{agent_name}_findings'] = []  # Empty findings
    return state
```

**Result**: Even if Groq API fails, user gets partial results

### Timeout Handling

```python
# Prevent infinite waits
async with asyncio.timeout(30):  # Python 3.11+
    response = await groq_client.chat(...)
```

## Caching Strategy

### What to Cache?

| What               | TTL       | Strategy           |
| ------------------ | --------- | ------------------ |
| Analysis results   | 1 hour    | Scan ID-based      |
| Groq API responses | 2 hours   | Code hash-based    |
| Model list         | 24 hours  | Static cache       |
| Errors             | 5 minutes | Fail-fast recovery |

### Implementation

```python
@cached(cache=RedisCache(), namespace="analysis", ttl=3600)
async def analyze_code(scan_id: str, code: str) -> AnalysisResult:
    # Cached by scan_id
    return await run_workflow(scan_id, code)
```

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│         Load Balancer (nginx)          │
└──────┬──────────┬──────────┬───────────┘
       ↓          ↓          ↓
   Instance 1  Instance 2  Instance 3
  (FastAPI)   (FastAPI)   (FastAPI)
       └──────────┴──────────┘
              ↓
        Shared Redis
        (caching)
              ↓
        PostgreSQL DB
```

### Bottlenecks & Solutions

| Bottleneck           | Current       | Solution                   |
| -------------------- | ------------- | -------------------------- |
| Groq API rate limits | 50 req/min    | Queue + retry logic        |
| Database connections | 10 default    | Pool sizing: min=5, max=20 |
| Memory per workflow  | ~50MB         | Implement pagination       |
| Token budget         | Unlimited now | Add quota enforcement      |

## Security Architecture

### API Security

```python
# Authentication via API Gateway
# (handled in NestJS, not here)

# CORS for development
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Data Security

- **API Keys**: Never logged, only sent to Groq
- **User Code**: Stored only in PostgreSQL encrypted column
- **No PII**: Never extract user names/emails
- **Rate limiting**: Prevent abuse

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/analyze")
@limiter.limit("30/minute")
async def analyze(request: AnalyzeRequest):
    ...
```

## Testing Strategy

### Unit Tests

- Individual agent functions
- Prompt formatting
- State transitions

```python
def test_security_agent():
    state = CodeReviewState(code="sql = f'SELECT * FROM users WHERE id={id}'")
    result = security_agent(state)
    assert any('SQL Injection' in f['title'] for f in result['security_findings'])
```

### Integration Tests

- Full workflow execution
- API endpoint testing
- Mock Groq responses

```python
@pytest.mark.asyncio
async def test_analyze_endpoint():
    response = await client.post(
        "/api/analyze",
        json={"scan_id": "test-123", "code": "..."}
    )
    assert response.status_code == 200
    assert response.json()["overall_score"] >= 0
```

### Performance Tests

- Latency benchmarks
- Token usage tracking
- Concurrent request handling

```bash
# Load test with 100 concurrent requests
locust -f locustfile.py --host=http://localhost:8000
```

## Monitoring & Observable Architecture

### Prometheus Metrics

```python
from prometheus_client import Counter, Histogram

analysis_counter = Counter('analysis_total', 'Total analyses', ['language'])
analysis_duration = Histogram('analysis_duration_seconds', 'Analysis time')

@analysis_duration.time()
async def analyze_code(...):
    analysis_counter.labels(language=language).inc()
    return result
```

### Structured Logging

```python
import structlog

logger = structlog.get_logger()

logger.info("analysis_started", scan_id=scan_id, language=language)
logger.error("agent_failed", agent_name=agent, error=str(e), scan_id=scan_id)
```

### Tracing (via OpenTelemetry)

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("analyze_code") as span:
    span.set_attribute("scan_id", scan_id)
    # analysis logic
```

## Deployment Architecture

### Development

```
Local Machine
├── FastAPI (reload enabled)
├── Local Redis
└── Groq API (live)
```

### Production

```
Cloud Platform (Azure/AWS)
├── FastAPI (3+ replicas)
├── Redis Cluster
├── PostgreSQL (RDS)
├── Message Queue (Kafka)
└── Monitoring Stack (Prometheus + Grafana)
```

### CI/CD Pipeline

```
GitHub Commit
    ↓
Test (pytest + coverage)
    ↓
Lint (flake8, black, mypy)
    ↓
Build Docker image
    ↓
Push to registry
    ↓
Deploy to staging
    ↓
E2E tests
    ↓
Deploy to production
```

## Future Enhancements

### v2.0 Roadmap

1. **Multi-LLM Support**
   - Switch between Groq, OpenAI, Azure OpenAI
   - Local LLM support (Ollama)

2. **Advanced Agents**
   - Dependency analysis agent
   - Documentation agent
   - Refactoring suggestions

3. **Real-time Streaming**
   - WebSocket for live analysis progress
   - Server-sent events (SSE)

4. **Learning Loop**
   - User feedback on findings
   - Fine-tuning on false positives

5. **Distributed Workflow**
   - Task queue (Celery)
   - Long-running analyses
   - Webhooks for async completion

## References

- [LangGraph Best Practices](https://langchain-ai.github.io/langgraph/how-tos/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Pydantic v2 Performance](https://docs.pydantic.dev/latest/concepts/performance/)
- [Groq API Rate Limiting](https://console.groq.com/docs/rate-limits)
- [Python Async Patterns](https://realpython.com/async-io-python/)

---

**Architecture Owner**: AI Service Team  
**Last Reviewed**: 2024-01-XX  
**Next Review**: 2024-04-XX
