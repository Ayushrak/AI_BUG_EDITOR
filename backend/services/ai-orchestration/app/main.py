"""
FastAPI application initialization and routes
"""
import logging
import time
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config.settings import settings
from app.models.schemas import (
    CodeAnalysisRequest,
    AnalysisResult,
    HealthCheckResponse,
)
from app.services.analysis_service import analysis_service
from app.db.session import init_db, get_db_session
from app.db.models import CodeScan
from app.services.cache_service import cache

logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Application startup time
APP_START_TIME = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    logger.info(f"Starting {settings.app_name}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug: {settings.debug}")
    
    try:
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    cache.clear()

app = FastAPI(
    title=settings.app_name,
    description="Multi-agent code analysis using LangGraph and Groq API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
if settings.environment == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - APP_START_TIME
    return HealthCheckResponse(
        status="ok",
        service="ai-orchestration",
        uptime=uptime,
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_code(request: CodeAnalysisRequest) -> AnalysisResult:
    """
    Analyze code using multi-agent LangGraph workflow
    
    Args:
        request: CodeAnalysisRequest containing code and metadata
    
    Returns:
        AnalysisResult with findings and scores
    """
    logger.info(f"Started analysis for scan {request.scan_id}")
    
    try:
        # Validate input
        if not request.code or len(request.code) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Code content is empty"
            )
        
        if len(request.code) > 50000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Code size {len(request.code)} exceeds maximum of 50000 characters"
            )
        
        if not request.language:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Language is required"
            )
        
        # Run analysis
        result = await analysis_service.analyze_code(request)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/api/models")
async def list_models():
    """List available LLM models"""
    return {
        "models": [
            {
                "id": settings.groq_model,
                "name": settings.groq_model,
                "provider": "Groq",
                "temperature": settings.groq_temperature,
                "max_tokens": settings.groq_max_tokens,
                "description": "Fast multi-agent code analysis"
            }
        ],
        "default_model": settings.groq_model
    }

@app.get("/api/analysis/{scan_id}/status")
async def get_analysis_status(scan_id: str):
    """Get analysis status for a scan"""
    db = get_db_session()
    try:
        scan = db.query(CodeScan).filter(CodeScan.id == scan_id).first()
        
        if not scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scan {scan_id} not found"
            )
        
        return {
            "scan_id": scan.id,
            "status": scan.status,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
            "updated_at": scan.updated_at.isoformat() if scan.updated_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "processing_time_ms": scan.processing_time_ms,
            "error_message": scan.error_message if scan.error_message else None
        }
    finally:
        db.close()

@app.get("/api/analysis/history")
async def get_analysis_history(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    language: Optional[str] = None
):
    """Get analysis history with pagination"""
    db = get_db_session()
    try:
        query = db.query(CodeScan)
        
        if language:
            query = query.filter(CodeScan.language == language)
        
        total = query.count()
        scans = query.order_by(CodeScan.created_at.desc()).limit(limit).offset(offset).all()
        
        return {
            "analyses": [
                {
                    "scan_id": scan.id,
                    "language": scan.language,
                    "file_name": scan.file_name,
                    "status": scan.status,
                    "overall_score": scan.overall_score,
                    "issues_count": len(scan.issues) if scan.issues else 0,
                    "created_at": scan.created_at.isoformat() if scan.created_at else None,
                    "processing_time_ms": scan.processing_time_ms
                }
                for scan in scans
            ],
            "pagination": {
                "total": total,
                "limit": limit,
                "offset": offset,
                "pages": (total + limit - 1) // limit
            }
        }
    finally:
        db.close()

@app.get("/health/deep")
async def deep_health_check():
    """Deep health check with dependency status"""
    db = get_db_session()
    uptime = time.time() - APP_START_TIME
    
    try:
        db_status = "connected"
        db.execute("SELECT 1")
    except Exception as e:
        db_status = f"error: {str(e)}"
    finally:
        db.close()
    
    redis_status = "connected" if cache.client else "disconnected"
    
    return {
        "status": "ok" if db_status == "connected" and redis_status == "connected" else "degraded",
        "service": "ai-orchestration",
        "version": "1.0.0",
        "uptime": uptime,
        "timestamp": datetime.utcnow().isoformat(),
        "dependencies": {
            "database": db_status,
            "redis": redis_status,
            "groq": "available" if settings.groq_api_key else "not_configured"
        }
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError"""
    logger.error(f"ValueError: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
