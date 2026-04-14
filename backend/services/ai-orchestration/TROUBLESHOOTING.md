# Troubleshooting & FAQ Guide

Common issues and solutions for the AI Orchestration Service.

## Quick Diagnosis

Before diving into specific issues, run these checks:

```bash
# 1. Check service health
curl http://localhost:8000/health

# 2. Check dependencies
curl http://localhost:8000/health/deep

# 3. Check logs
docker logs ai-orchestration 2>&1 | tail -50

# 4. Check environment
env | grep -E "GROQ|REDIS|DATABASE"

# 5. Test connectivity
# Redis
redis-cli -u $REDIS_URL ping

# Postgres
psql $DATABASE_URL -c "SELECT 1"

# Groq API
curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/

# 6. Performance metrics
curl http://localhost:8000/metrics | head -20
```

---

## Frequently Asked Questions

### Q: How do I get a Groq API key?

**A:**

1. Visit https://console.groq.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Create new key
5. Copy and set `GROQ_API_KEY` environment variable

```bash
export GROQ_API_KEY="gsk_..."
```

### Q: What's the difference between development and production?

**A:**

| Aspect         | Development       | Production             |
| -------------- | ----------------- | ---------------------- |
| Debug          | Enabled           | Disabled               |
| Logging        | Verbose           | JSON format            |
| Errors         | Full stack traces | User-friendly messages |
| Performance    | Not optimized     | Optimized              |
| Authentication | Optional          | Required               |
| Rate limits    | Disabled          | Enforced               |
| Caching        | Optional          | Enabled                |

### Q: How do I add a new programming language?

**A:**

1. Add language to validation in `models/schemas.py`:

```python
class AnalyzeRequest(BaseModel):
    language: Literal["python", "javascript", "typescript", "java", "rust", "go", "cpp", "csharp", "new_lang"]
```

2. Add language-specific prompts in `agents/prompts.py`:

```python
SECURITY_PROMPTS = {
    "python": "Python code security analysis...",
    "new_lang": "New language security analysis..."
}
```

3. Test with sample code in `tests/fixtures/`

### Q: Can I use a different LLM provider?

**A:**
Currently using Groq. To support other providers:

1. Create abstraction in `services/llm_service.py`:

```python
class LLMProvider(ABC):
    @abstractmethod
    async def chat(self, messages, **kwargs): pass

class GroqProvider(LLMProvider): ...
class OpenAIProvider(LLMProvider): ...
```

2. Update agent calls to use provider

3. This is planned for v2.0

### Q: How do I increase analysis timeout?

**A:**

```bash
# In .env
GROQ_REQUEST_TIMEOUT=60  # seconds
MAX_WORKFLOW_TIMEOUT=120 # overall timeout

# Or in code
async with asyncio.timeout(120):
    result = await analyze_code(...)
```

### Q: What's the maximum code size?

**A:**

- Default: 50,000 characters
- Can be increased in settings:

```python
# config/settings.py
MAX_CODE_SIZE: int = 100000
```

But consider:

- Higher costs with Groq API
- Longer response times
- Token budget limits

### Q: How do I integrate with my CI/CD pipeline?

**A:**

```bash
# From GitHub Actions
- name: Analyze with CodeGuardian
  run: |
    curl -X POST http://localhost:8000/api/analyze \
      -H "Content-Type: application/json" \
      -d '{
        "scan_id": "ci-${{ github.sha }}",
        "code": "$(cat src/main.py)",
        "language": "python"
      }'
```

### Q: How do I filter results by severity?

**A:**
Currently, all issues are returned. Filter on client side:

```python
high_priority = [
    issue for issue in results['issues']
    if issue['severity'] in ['critical', 'high']
]
```

Or use API query parameter (planned for v1.1):

```
GET /api/analysis/{scan_id}?min_severity=high
```

### Q: Why are results cached?

**A:**

- Reduce API calls to Groq (save costs)
- Faster repeated analysis of same code
- Reduce latency for known scans

Disable caching:

```bash
ENABLE_CACHING=false
```

Clear cache:

```bash
redis-cli -u $REDIS_URL FLUSHDB
```

---

## Troubleshooting by Error

### "GROQ_API_KEY not found"

**Symptoms:**

```
KeyError: 'GROQ_API_KEY'
```

**Solutions:**

1. **Check if set:**

   ```bash
   echo $GROQ_API_KEY
   ```

2. **If empty, set it:**

   ```bash
   export GROQ_API_KEY="your-key"
   ```

3. **Check .env file:**

   ```bash
   cat .env | grep GROQ_API_KEY
   ```

4. **For Docker:**
   ```bash
   docker run -e GROQ_API_KEY=$GROQ_API_KEY ai-orchestration:latest
   ```

---

### "Redis connection failed"

**Symptoms:**

```
redis.exceptions.ConnectionError: Cannot connect to host redis
```

**Solutions:**

1. **Check if Redis is running:**

   ```bash
   redis-cli ping
   ```

2. **If not running, start it:**

   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Check connection string:**

   ```bash
   # Should be in REDIS_URL
   echo $REDIS_URL
   # Should look like: redis://:password@localhost:6379
   ```

4. **Test connection:**

   ```bash
   redis-cli -u $REDIS_URL ping
   ```

5. **Check Redis logs:**
   ```bash
   docker logs redis
   ```

---

### "Database connection failed"

**Symptoms:**

```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) connection failed
```

**Solutions:**

1. **Check PostgreSQL is running:**

   ```bash
   psql --version
   ```

2. **Test connection:**

   ```bash
   psql $DATABASE_URL
   ```

3. **Check connection string format:**

   ```bash
   # Should be: postgresql://user:password@host:port/database
   echo $DATABASE_URL
   ```

4. **Verify credentials:**

   ```bash
   psql -U postgres -h localhost
   ```

5. **Check port:**
   ```bash
   netstat -tuln | grep 5432
   ```

---

### "Groq API rate limit exceeded"

**Symptoms:**

```json
{
  "error": "rate_limited",
  "message": "Rate limit exceeded: 50 requests per minute"
}
```

**Solutions:**

1. **Wait and retry:**

   ```bash
   sleep 60  # Wait 1 minute
   curl http://localhost:8000/api/analyze -d ...
   ```

2. **Check current usage:**

   ```bash
   curl http://localhost:8000/metrics | grep analysis
   ```

3. **Request higher limits:**
   - Contact Groq support
   - Upgrade API tier
   - Implement request queue

4. **Implement backoff:**
   ```python
   # Already in agents/workflow.py with retry logic
   @retry(max_attempts=3, backoff=2)
   async def call_groq(...):
       ...
   ```

---

### "Port 8000 already in use"

**Symptoms:**

```
OSError: [Errno 48] Address already in use
```

**Solutions:**

1. **Find process using port:**

   ```bash
   lsof -i :8000
   ```

2. **Kill process:**

   ```bash
   kill -9 <PID>
   ```

3. **Or use different port:**

   ```bash
   PORT=8001 python main.py
   ```

4. **Check for multiple containers:**
   ```bash
   docker ps | grep 8000
   docker stop <container-id>
   ```

---

### "Analysis timeout"

**Symptoms:**

```
asyncio.TimeoutError: Task took longer than 30 seconds
```

**Solutions:**

1. **Increase timeout:**

   ```bash
   GROQ_REQUEST_TIMEOUT=60
   ```

2. **Check Groq status:**

   ```bash
   curl https://api.groq.com/
   ```

3. **Check network latency:**

   ```bash
   ping api.groq.com
   ```

4. **Check code size:**
   - Large code takes longer to analyze
   - Try with smaller code sample

5. **Check service logs:**
   ```bash
   docker logs -f ai-orchestration | grep timeout
   ```

---

### "Out of memory"

**Symptoms:**

```
MemoryError: Unable to allocate 4.00 GiB
```

**Solutions:**

1. **Check memory usage:**

   ```bash
   docker stats ai-orchestration
   ```

2. **Increase container memory:**

   ```bash
   docker run -m 8g ai-orchestration:latest
   # Or in docker-compose.yml:
   # mem_limit: 8g
   ```

3. **Reduce pool sizes:**

   ```bash
   DB_POOL_SIZE=5
   REDIS_POOL_SIZE=10
   ```

4. **Profile memory:**

   ```bash
   python -m memory_profiler main.py
   ```

5. **Check for leaks:**
   ```bash
   pip install objgraph
   python -c "import objgraph; objgraph.show_most_common_types()"
   ```

---

### "No issues found (but code has bugs)"

**Symptoms:**

```json
{
  "overall_score": 9.5,
  "issues": []
}
```

**Solutions:**

1. **False negatives are common**, especially for:
   - Complex business logic bugs
   - Application-specific vulnerabilities
   - Non-standard code patterns

2. **Try with clearer code:**
   - Add comments explaining intent
   - Use explicit patterns (not abbreviations)

3. **Report issue:**
   - Use `/api/issues/{id}/report-false-positive` endpoint
   - Include code snippet and expected finding
   - Helps improve model

4. **Use code comments:**
   ```python
   # TODO: SECURITY - needs input validation
   def process_user_input(data):  # LLM catches comment hints
       ...
   ```

---

## Performance Issues

### Slow Analysis (>5 seconds)

**Check:**

1. Groq API latency
2. Code complexity
3. Network connection
4. Server resources

**Optimize:**

```bash
# 1. Use faster model (if available)
GROQ_MODEL=llama2-70b-4096  # Faster but less accurate

# 2. Reduce code size
# Only analyze code file, not entire project

# 3. Enable caching
ENABLE_CACHING=true

# 4. Monitor
curl http://localhost:8000/metrics
```

### High CPU Usage

**Check:**

```bash
docker stats
ps aux | grep python
```

**Solutions:**

1. Reduce worker count
2. Add resource limits
3. Check for infinite loops in custom agents
4. Profile with cProfile

### High Memory Usage

**Check:**

```bash
docker stats
free -h
```

**Solutions:**

1. Reduce cache TTL
2. Reduce pool sizes
3. Check for memory leaks
4. Enable memory profiling

---

## Testing In Troubleshooting

### Test Basic Connectivity

```bash
# 1. Service responds
curl http://localhost:8000/health

# 2. Can reach Groq
curl -I https://api.groq.com

# 3. Database works
psql $DATABASE_URL -c "SELECT NOW();"

# 4. Cache works
redis-cli -u $REDIS_URL INFO
```

### Test Full Analysis Flow

```python
# test_analysis.py
import requests

response = requests.post(
    "http://localhost:8000/api/analyze",
    json={
        "scan_id": "test-123",
        "code": "print('hello')",
        "language": "python"
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## Getting Help

### Logs for Debugging

```bash
# Get last 100 lines
docker logs --tail 100 ai-orchestration

# Follow logs in real-time
docker logs -f ai-orchestration

# Search for errors
docker logs ai-orchestration 2>&1 | grep -i error

# Save logs to file
docker logs ai-orchestration > logs.txt 2>&1
```

### Request ID for Support

Every response includes `request_id`:

```json
{
  "error": "analysis_failed",
  "request_id": "req-12345-abcde"
}
```

Use this when contacting support.

### Debug Information

Collect for support tickets:

```bash
#!/bin/bash
echo "=== Service Status ==="
curl http://localhost:8000/health

echo "\n=== Dependencies ==="
curl http://localhost:8000/health/deep

echo "\n=== Recent Logs ==="
docker logs --tail 50 ai-orchestration

echo "\n=== Environment ==="
env | grep -E "GROQ|REDIS|DATABASE" | head -5

echo "\n=== Container Stats ==="
docker stats --no-stream ai-orchestration

echo "\n=== Python Version ==="
python --version
```

---

## Additional Resources

- **API Documentation:** See [API_SPEC.md](API_SPEC.md)
- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Development:** See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

---

**Last Updated:** 2024-01-15  
**Maintained By:** Support Team
