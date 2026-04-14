"""
Comprehensive tests for API and services
"""
import pytest
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models.schemas import CodeAnalysisRequest
from app.db.models import Base
from app.db.session import get_db
from app.config.settings import settings

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def sample_python_code():
    return """
def hello(name):
    '''Say hello to someone'''
    return f"Hello, {name}!"

def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total = total + num
    return total

# Security issue - SQL injection risk
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return database.execute(query)
"""

@pytest.fixture
def sample_analysis_request(sample_python_code):
    return CodeAnalysisRequest(
        scan_id="test-scan-001",
        code=sample_python_code,
        language="python",
        file_name="app.py",
        business_requirements=["Handle edge cases", "Validate input"]
    )

# Tests
class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "ai-orchestration"
        assert "uptime" in data
        assert "timestamp" in data
    
    @pytest.mark.asyncio
    async def test_deep_health_check(self, client):
        """Test deep health check"""
        response = await client.get("/health/deep")
        assert response.status_code == 200
        data = response.json()
        assert "dependencies" in data
        assert "database" in data["dependencies"]
        assert "redis" in data["dependencies"]


class TestRootEndpoint:
    @pytest.mark.asyncio
    async def test_root(self, client):
        """Test root endpoint"""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "docs" in data


class TestModelsEndpoint:
    @pytest.mark.asyncio
    async def test_list_models(self, client):
        """Test list models endpoint"""
        response = await client.get("/api/models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert len(data["models"]) > 0
        assert "default_model" in data


class TestAnalysisEndpoint:
    @pytest.mark.asyncio
    async def test_analyze_code_empty(self, client):
        """Test analysis with empty code"""
        request = CodeAnalysisRequest(
            scan_id="test-001",
            code="",
            language="python"
        )
        response = await client.post("/api/analyze", json=request.dict())
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_analyze_code_no_language(self, client):
        """Test analysis without language"""
        request = CodeAnalysisRequest(
            scan_id="test-001",
            code="print('hello')",
            language=""
        )
        response = await client.post("/api/analyze", json=request.dict())
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_analyze_code_valid(self, client, sample_analysis_request):
        """Test valid code analysis"""
        response = await client.post("/api/analyze", json=sample_analysis_request.dict())
        
        # May fail or succeed depending on Groq API availability
        # but should return a valid response
        assert response.status_code in [200, 500, 503]
        
        if response.status_code == 200:
            data = response.json()
            assert data["scan_id"] == sample_analysis_request.scan_id
            assert "overall_score" in data
            assert "issues" in data
            assert "generated_tests" in data


class TestAnalysisHistory:
    @pytest.mark.asyncio
    async def test_get_analysis_history(self, client):
        """Test getting analysis history"""
        response = await client.get("/api/analysis/history?limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert "analyses" in data
        assert "pagination" in data
        assert "total" in data["pagination"]
        assert "limit" in data["pagination"]


class TestAnalysisStatus:
    @pytest.mark.asyncio
    async def test_get_status_not_found(self, client):
        """Test getting status for non-existent scan"""
        response = await client.get("/api/analysis/nonexistent/status")
        assert response.status_code == 404


class TestInputValidation:
    @pytest.mark.asyncio
    async def test_code_size_limit(self, client):
        """Test code size limit"""
        huge_code = "x = 1\n" * 10000  # Way over 50k limit
        request = CodeAnalysisRequest(
            scan_id="test-001",
            code=huge_code,
            language="python"
        )
        response = await client.post("/api/analyze", json=request.dict())
        assert response.status_code == 400


class TestErrorHandling:
    @pytest.mark.asyncio
    async def test_invalid_json(self, client):
        """Test invalid JSON request"""
        response = await client.post(
            "/api/analyze",
            json={"invalid": "data"}
        )
        assert response.status_code in [422, 400]  # Validation error


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
