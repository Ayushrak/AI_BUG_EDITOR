"""
Test suite for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "ai-orchestration"

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "docs" in response.json()

def test_list_models():
    """Test models listing endpoint"""
    response = client.get("/api/models")
    assert response.status_code == 200
    assert "models" in response.json()
    assert len(response.json()["models"]) > 0

def test_analyze_code_basic():
    """Test basic code analysis"""
    payload = {
        "scan_id": "test-scan-001",
        "code": "def hello(): return 'world'",
        "language": "python",
        "file_name": "test.py"
    }
    
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    
    result = response.json()
    assert result["scan_id"] == "test-scan-001"
    assert "overall_score" in result
    assert "issues" in result

def test_analyze_code_missing_code():
    """Test analysis with missing code"""
    payload = {
        "scan_id": "test-scan-002",
        "code": "",
        "language": "python"
    }
    
    response = client.post("/api/analyze", json=payload)
    # Should return 200 but with errors in state
    assert response.status_code in [200, 400]

def test_analyze_code_with_business_requirements():
    """Test analysis with business requirements"""
    payload = {
        "scan_id": "test-scan-003",
        "code": "def process_user(data): pass",
        "language": "python",
        "business_requirements": [
            "Validate user input",
            "Handle errors gracefully"
        ]
    }
    
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    
    result = response.json()
    assert "agents_executed" in result
    assert len(result["agents_executed"]) > 0
