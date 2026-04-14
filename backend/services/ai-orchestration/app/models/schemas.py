from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum

class SeverityEnum(str, Enum):
    """Issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class IssueTypeEnum(str, Enum):
    """Issue types"""
    SECURITY = "security"
    PERFORMANCE = "performance"
    LOGIC = "logic"
    ARCHITECTURE = "architecture"
    TESTING = "testing"

class CodeAnalysisRequest(BaseModel):
    """Request to analyze code"""
    scan_id: str = Field(..., description="Unique scan identifier")
    code: str = Field(..., description="Source code to analyze")
    language: str = Field(..., description="Programming language")
    file_name: Optional[str] = None
    business_requirements: Optional[List[str]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "scan_id": "scan-123",
                "code": "def hello(): return 'world'",
                "language": "python",
                "file_name": "main.py",
                "business_requirements": ["Handle errors gracefully"]
            }
        }

class Issue(BaseModel):
    """Detected issue"""
    id: str
    type: IssueTypeEnum
    severity: SeverityEnum
    title: str
    description: str
    line_number: Optional[int] = None
    suggested_fix: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1)
    agent_name: str

class AnalysisResult(BaseModel):
    """Code analysis result"""
    scan_id: str
    overall_score: float = Field(..., ge=0, le=10)
    security_score: float = Field(..., ge=0, le=10)
    performance_score: float = Field(..., ge=0, le=10)
    architecture_score: float = Field(..., ge=0, le=10)
    testing_score: float = Field(..., ge=0, le=10)
    issues: List[Issue] = []
    generated_tests: List[str] = []
    summary: str
    agents_executed: List[str]

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    uptime: float
    timestamp: str

class WorkflowState(BaseModel):
    """LangGraph workflow state"""
    scan_id: str
    code: str
    language: str
    business_requirements: Optional[List[str]] = None
    security_findings: Optional[List[Issue]] = None
    performance_findings: Optional[List[Issue]] = None
    logic_findings: Optional[List[Issue]] = None
    architecture_findings: Optional[List[Issue]] = None
    test_suggestions: Optional[List[str]] = None
    errors: Optional[List[str]] = None
