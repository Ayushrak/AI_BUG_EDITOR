"""
Analysis service - coordinates the code analysis workflow
"""
import logging
import time
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.schemas import CodeAnalysisRequest, AnalysisResult, Issue, IssueTypeEnum, SeverityEnum
from app.agents.workflow import initialize_workflow, CodeReviewState
from app.services.cache_service import cache, get_code_hash
from app.db.session import get_db_session
from app.db.models import CodeScan, AnalysisCache, AnalysisIssue
from app.config.settings import settings

logger = logging.getLogger(__name__)

class AnalysisService:
    """Service for coordinating code analysis"""
    
    def __init__(self):
        """Initialize analysis service"""
        try:
            self.workflow = initialize_workflow()
            logger.info("Workflow initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize workflow: {str(e)}")
            self.workflow = None
    
    async def analyze_code(self, request: CodeAnalysisRequest) -> AnalysisResult:
        """
        Analyze code and return results
        
        Args:
            request: Code analysis request
            
        Returns:
            Analysis result with findings
        """
        start_time = time.time()
        db = get_db_session()
        
        try:
            # Check cache
            code_hash = get_code_hash(request.code)
            cache_key = f"analysis:{code_hash}:{request.language}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                logger.info(f"Cache hit for scan {request.scan_id}")
                return AnalysisResult(**cached_result)
            
            # Create workflow state
            state: CodeReviewState = {
                "scan_id": request.scan_id,
                "code": request.code,
                "language": request.language,
                "business_requirements": request.business_requirements,
                "security_findings": [],
                "performance_findings": [],
                "logic_findings": [],
                "architecture_findings": [],
                "test_suggestions": [],
                "errors": []
            }
            
            # Save to database
            scan = CodeScan(
                id=request.scan_id,
                code=request.code,
                language=request.language,
                file_name=request.file_name,
                business_requirements=request.business_requirements,
                status="processing"
            )
            db.add(scan)
            db.commit()
            
            # Run workflow
            if not self.workflow:
                raise ValueError("Workflow not initialized")
            
            logger.info(f"Starting analysis for scan {request.scan_id}")
            result_state = self.workflow.invoke(state)
            
            # Calculate scores
            all_findings = (
                result_state.get('security_findings', []) +
                result_state.get('performance_findings', []) +
                result_state.get('logic_findings', []) +
                result_state.get('architecture_findings', [])
            )
            
            scores = calculate_scores(all_findings)
            
            # Convert to Issue objects
            issues = []
            for finding in all_findings:
                issue = Issue(
                    id=f"issue-{request.scan_id}-{len(issues)}",
                    type=IssueTypeEnum(finding.get('type', 'security')),
                    severity=SeverityEnum(finding.get('severity', 'medium')),
                    title=finding.get('title', 'Unknown issue'),
                    description=finding.get('description', ''),
                    line_number=finding.get('line_number'),
                    suggested_fix=finding.get('suggested_fix'),
                    confidence=float(finding.get('confidence', 0.5)),
                    agent_name=finding.get('agent_name', 'unknown')
                )
                issues.append(issue)
            
            # Create result
            processing_time = int((time.time() - start_time) * 1000)
            result = AnalysisResult(
                scan_id=request.scan_id,
                overall_score=scores['overall'],
                security_score=scores['security'],
                performance_score=scores['performance'],
                architecture_score=scores['architecture'],
                testing_score=scores['testing'],
                issues=issues,
                generated_tests=result_state.get('test_suggestions', []),
                summary=generate_summary(issues, scores),
                agents_executed=['security', 'performance', 'logic', 'architecture', 'test_generator']
            )
            
            # Update database
            scan.overall_score = result.overall_score
            scan.security_score = result.security_score
            scan.performance_score = result.performance_score
            scan.logic_score = scores.get('logic', 7.0)
            scan.architecture_score = result.architecture_score
            scan.testing_score = result.testing_score
            scan.issues = [issue.dict() for issue in issues]
            scan.generated_tests = result.generated_tests
            scan.summary = result.summary
            scan.status = "completed"
            scan.completed_at = datetime.utcnow()
            scan.processing_time_ms = processing_time
            db.commit()
            
            # Cache result
            cache.set(cache_key, result.dict(), ttl_seconds=3600)
            
            logger.info(f"Analysis completed for scan {request.scan_id} in {processing_time}ms")
            return result
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            
            # Update database with error
            try:
                scan = db.query(CodeScan).filter(CodeScan.id == request.scan_id).first()
                if scan:
                    scan.status = "failed"
                    scan.error_message = str(e)
                    scan.completed_at = datetime.utcnow()
                    db.commit()
            except:
                pass
            
            # Return error result
            return AnalysisResult(
                scan_id=request.scan_id,
                overall_score=0.0,
                security_score=0.0,
                performance_score=0.0,
                architecture_score=0.0,
                testing_score=0.0,
                issues=[],
                generated_tests=[],
                summary=f"Analysis failed: {str(e)}",
                agents_executed=[]
            )
        
        finally:
            db.close()

def calculate_scores(findings: list) -> dict:
    """Calculate component scores from findings"""
    scores = {
        'security': 8.0,
        'performance': 8.0,
        'logic': 8.0,
        'architecture': 8.0,
        'testing': 8.0
    }
    
    # Deduct points for findings
    for finding in findings:
        finding_type = finding.get('type', 'security')
        severity = finding.get('severity', 'medium')
        
        deduction = {'critical': 2.0, 'high': 1.5, 'medium': 1.0, 'low': 0.5}.get(severity, 0.5)
        
        if finding_type in scores:
            scores[finding_type] = max(0.0, scores[finding_type] - deduction)
    
    # Calculate overall score
    scores['overall'] = (
        scores['security'] * 0.3 +
        scores['performance'] * 0.15 +
        scores['logic'] * 0.25 +
        scores['architecture'] * 0.2 +
        scores['testing'] * 0.1
    )
    
    return scores

def generate_summary(issues: list, scores: dict) -> str:
    """Generate analysis summary"""
    high_critical = sum(1 for i in issues if i.severity in ['critical', 'high'])
    medium = sum(1 for i in issues if i.severity == 'medium')
    low = sum(1 for i in issues if i.severity == 'low')
    
    summary = f"Found {len(issues)} issues: "
    if high_critical > 0:
        summary += f"{high_critical} critical/high, "
    if medium > 0:
        summary += f"{medium} medium, "
    if low > 0:
        summary += f"{low} low"
    
    summary += f". Overall score: {scores['overall']:.1f}/10"
    
    return summary

# Global service instance
analysis_service = AnalysisService()
