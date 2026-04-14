# Developer Guide - AI Orchestration Service

Comprehensive guide for developers working with the AI Orchestration Service.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Structure](#code-structure)
4. [Agent Development](#agent-development)
5. [Testing Guide](#testing-guide)
6. [Debugging](#debugging)
7. [Contribution Guidelines](#contribution-guidelines)

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- pip or Poetry
- Git
- Docker (optional, for container development)

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd backend/services/ai-orchestration

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt

# Copy environment template
cp .env.example .env

# Set required variables
export GROQ_API_KEY="your-api-key"
```

### Verification

```bash
# Run tests to verify setup
pytest

# Start development server
python main.py

# Check health endpoint
curl http://localhost:8000/health
```

---

## Development Workflow

### Directory Structure

```
ai-orchestration/
├── app/
│   ├── __init__.py                 # Package marker
│   ├── main.py                     # FastAPI app initialization
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py             # Pydantic Settings
│   │   └── logging.py              # Logger configuration
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py              # Pydantic models
│   │   └── errors.py               # Exception classes
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py               # Health check routes
│   │   └── analysis.py             # Analysis routes
│   ├── services/
│   │   ├── __init__.py
│   │   └── analysis_service.py     # Business logic
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── workflow.py             # LangGraph workflow
│   │   ├── prompts.py              # Agent prompts
│   │   └── utils.py                # Agent utilities
│   └── utils/
│       ├── __init__.py
│       ├── validators.py           # Input validation
│       ├── cache.py                # Caching logic
│       └── errors.py               # Error handlers
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures
│   ├── test_api.py                 # API tests
│   ├── test_agents.py              # Agent tests
│   ├── test_workflow.py            # Workflow tests
│   └── fixtures/
│       ├── sample_code.py           # Sample code snippets
│       └── mock_responses.py        # Mock LLM responses
├── main.py                         # Entry point
├── requirements.txt                # Production dependencies
├── requirements-dev.txt            # Dev dependencies
├── .env.example                    # Environment template
├── pytest.ini                      # Pytest configuration
├── pyproject.toml                  # Project metadata
└── README.md                       # Project readme

```

### Code Style

We follow PEP 8 with Black and flake8:

```bash
# Format code with Black
black app/ tests/

# Check with flake8
flake8 app/ --max-line-length=100

# Type check with mypy
mypy app/
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "feat: description of feature

- Detailed point 1
- Detailed point 2"

# Push and create PR
git push origin feature/your-feature-name
```

**Commit Message Convention:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Add/update tests
- `perf:` - Performance improvement
- `chore:` - Build, dependencies, etc.

---

## Code Structure

### Settings (config/settings.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Orchestration Service"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "mixtral-8x7b-32768"
    GROQ_TEMPERATURE: float = 0.7

    # Features
    ENABLE_CACHING: bool = True
    MAX_WORKFLOW_TOKENS: int = 10000

    class Config:
        env_file = ".env"

settings = Settings()
```

### Database Models (models/schemas.py)

```python
from pydantic import BaseModel, Field
from typing import Optional

class AnalyzeRequest(BaseModel):
    scan_id: str = Field(..., min_length=1)
    code: str = Field(..., min_length=1, max_length=50000)
    language: str = Field(..., pattern="^[a-z]+$")
    file_name: Optional[str] = None
    business_requirements: Optional[list[str]] = None

class CodeIssue(BaseModel):
    id: str
    type: str  # security, performance, logic, architecture
    severity: str  # critical, high, medium, low
    title: str
    description: str
    line_number: int
    suggested_fix: str
    confidence: float = Field(..., ge=0, le=1)
    agent_name: str
```

### API Routes (routes/analysis.py)

```python
from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalysisResult
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/api", tags=["analysis"])
service = AnalysisService()

@router.post("/analyze")
async def analyze(request: AnalyzeRequest) -> AnalysisResult:
    """Analyze code with all agents"""
    try:
        result = await service.analyze(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Agent Development

### Creating a New Agent

1. **Define the agent function** in `agents/workflow.py`:

```python
async def custom_agent(state: CodeReviewState) -> CodeReviewState:
    """
    Analyze code for custom issues

    Args:
        state: Current workflow state

    Returns:
        Updated state with findings
    """
    logger.info(f"Running custom agent for scan {state['scan_id']}")

    try:
        # Extract relevant code
        code = state['code']

        # Prepare prompt
        prompt = f"{CUSTOM_SYSTEM_PROMPT}\n\nCode:\n{code}"

        # Call Groq API
        response = await groq_client.chat(
            model=settings.GROQ_MODEL,
            max_tokens=settings.GROQ_MAX_TOKENS,
            temperature=settings.GROQ_TEMPERATURE,
            messages=[
                {"role": "system", "content": CUSTOM_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this code:\n{code}"}
            ]
        )

        # Parse response
        findings = parse_custom_findings(response.choices[0].message.content)

        # Update state
        state['custom_findings'] = findings

    except Exception as e:
        logger.error(f"Custom agent failed: {e}")
        state['errors'].append(f"Custom agent: {str(e)}")
        state['custom_findings'] = []

    return state
```

2. **Add system prompt** in `agents/prompts.py`:

```python
CUSTOM_SYSTEM_PROMPT = """
You are a custom code analysis expert. Analyze code for:
1. Pattern A
2. Pattern B
3. Pattern C

Return findings as JSON array with fields:
- title: str
- description: str
- line_number: int
- severity: str (critical|high|medium|low)
- suggested_fix: str
- confidence: float (0-1)
"""
```

3. **Add to workflow** in `agents/workflow.py`:

```python
def initialize_workflow():
    workflow = StateGraph(CodeReviewState)

    # ... existing nodes ...

    # Add new agent
    workflow.add_node("custom_agent", custom_agent)
    workflow.add_edge("parse_code", "custom_agent")
    workflow.add_edge("custom_agent", "merge_findings")

    return workflow.compile()
```

4. **Update state type**:

```python
class CodeReviewState(TypedDict):
    # ... existing fields ...
    custom_findings: Optional[List[dict]]
```

### Agent Best Practices

1. **Always handle errors gracefully**

   ```python
   try:
       # Logic
   except Exception as e:
       state['errors'].append(f"Agent: {str(e)}")
       state['findings'] = []
   ```

2. **Log important events**

   ```python
   logger.info("agent_started", agent_name="custom", scan_id=state['scan_id'])
   logger.error("agent_failed", agent_name="custom", error=str(e))
   ```

3. **Validate findings**

   ```python
   for finding in findings:
       assert 'title' in finding
       assert 0 <= finding['confidence'] <= 1
   ```

4. **Use structured output**
   ```python
   # Define Pydantic model for response
   class CustomFinding(BaseModel):
       title: str
       severity: Literal["critical", "high", "medium", "low"]
       confidence: float
   ```

---

## Testing Guide

### Unit Tests

Test individual agent functions:

```python
# tests/test_agents.py
import pytest
from app.agents.workflow import security_agent
from app.models.schemas import CodeReviewState

@pytest.fixture
def sample_state():
    return CodeReviewState(
        scan_id="test-123",
        code="sql = f'SELECT * FROM users WHERE id={id}'",
        language="python",
        parse_result={},
        security_findings=[],
        errors=[]
    )

def test_security_agent_detects_sql_injection(sample_state):
    result = security_agent(sample_state)

    assert len(result['security_findings']) > 0
    assert any('SQL Injection' in f['title'] for f in result['security_findings'])
```

### Integration Tests

Test full workflow:

```python
# tests/test_workflow.py
@pytest.mark.asyncio
async def test_full_analysis():
    request = AnalyzeRequest(
        scan_id="test-123",
        code="def hello(): return 'world'",
        language="python"
    )

    result = await service.analyze(request)

    assert result.scan_id == "test-123"
    assert result.overall_score >= 0
    assert result.overall_score <= 10
```

### API Tests

Test HTTP endpoints:

```python
# tests/test_api.py
@pytest.mark.asyncio
async def test_analyze_endpoint():
    payload = {
        "scan_id": "test-123",
        "code": "print('hello')",
        "language": "python"
    }

    response = await client.post("/api/analyze", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data['scan_id'] == "test-123"
    assert 'overall_score' in data
```

### Mocking Groq API

```python
# tests/conftest.py
from unittest.mock import AsyncMock, patch

@pytest.fixture
def mock_groq():
    with patch('app.agents.workflow.groq_client') as mock:
        mock.chat.return_value = AsyncMock(
            choices=[AsyncMock(
                message=AsyncMock(
                    content='[{"title": "test", "severity": "high"}]'
                )
            )]
        )
        yield mock
```

### Running Tests

```bash
# All tests
pytest

# Specific file
pytest tests/test_agents.py

# With coverage
pytest --cov=app --cov-report=html

# Verbose
pytest -v

# Stop on first failure
pytest -x

# Watch mode (requires pytest-watch)
ptw
```

---

## Debugging

### Debug Logging

Enable debug logs:

```bash
export LOG_LEVEL=DEBUG
python main.py
```

### Interactive Debugging

```python
# In your code
import pdb; pdb.set_trace()

# Then in Python debugger:
# l - list code
# n - next line
# s - step into
# c - continue
# p var - print variable
```

### Debug with VS Code

Add `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "jinja": true,
      "justMyCode": true
    }
  ]
}
```

### Monitoring with Prometheus

View metrics at `http://localhost:8000/metrics`

```bash
# Query specific metric
curl http://localhost:8000/metrics | grep analysis_total
```

---

## Contribution Guidelines

### Before Submitting PR

1. **Run all checks**

   ```bash
   black app/ tests/
   flake8 app/
   mypy app/
   pytest
   ```

2. **Update documentation**
   - Add docstrings to new functions
   - Update README if behavior changes
   - Document new environment variables

3. **Write tests**
   - Aim for >80% coverage
   - Test both success and failure cases
   - Use meaningful test names

### PR Checklist

- [ ] Code is formatted with Black
- [ ] Tests pass locally
- [ ] Commit messages follow convention
- [ ] Documentation updated
- [ ] No hardcoded values or API keys
- [ ] Error handling included
- [ ] Logging added

### Code Review

PRs require approval from at least one maintainer. Address feedback:

```bash
# Make requested changes
# Re-run tests
# Force push to PR branch
git push -f origin feature/your-feature

# Don't squash unless requested
```

---

## Useful Commands

```bash
# Format and lint
black app/ && flake8 app/ && mypy app/

# Run tests with coverage
pytest --cov=app --cov-report=term-missing

# Generate test report
pytest --html=report.html

# Profile performance
python -m cProfile -s cumtime main.py

# Check dependencies for security issues
safety check

# Build Docker image
docker build -t ai-orchestration:dev .

# Start with Docker
docker run -e GROQ_API_KEY=$GROQ_API_KEY ai-orchestration:dev
```

---

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [Python Async](https://docs.python.org/3/library/asyncio.html)
- [Pydantic v2](https://docs.pydantic.dev/)
- [Groq API](https://console.groq.com/docs)

---

**Last Updated:** 2024-01-15  
**Maintained By:** AI Service Team
