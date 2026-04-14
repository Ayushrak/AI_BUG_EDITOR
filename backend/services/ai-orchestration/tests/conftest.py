"""
Test configuration and fixtures
"""
import pytest
from app.config.settings import Settings

@pytest.fixture
def test_settings():
    """Provide test settings"""
    return Settings(
        environment="test",
        debug=True,
        groq_api_key="test-key"
    )

@pytest.fixture
def sample_code():
    """Sample Python code for testing"""
    return '''
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total = total + num
    return total

def find_user(users, user_id):
    for user in users:
        if user['id'] == user_id:
            return user
    return None
'''

@pytest.fixture
def sample_requirements():
    """Sample business requirements"""
    return [
        "Handle empty list gracefully",
        "Validate user_id is not None",
        "Return 404 if user not found"
    ]
