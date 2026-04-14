"""
SQLAlchemy database models
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, Integer, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CodeScan(Base):
    """Model for storing code scan records"""
    __tablename__ = "code_scans"
    
    id = Column(String(255), primary_key=True, index=True)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    file_name = Column(String(255), nullable=True)
    business_requirements = Column(JSON, nullable=True)
    
    overall_score = Column(Float, nullable=True)
    security_score = Column(Float, nullable=True)
    performance_score = Column(Float, nullable=True)
    logic_score = Column(Float, nullable=True)
    architecture_score = Column(Float, nullable=True)
    testing_score = Column(Float, nullable=True)
    
    issues = Column(JSON, nullable=True)
    generated_tests = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    processing_time_ms = Column(Integer, nullable=True)
    
    class Config:
        from_attributes = True


class AnalysisCache(Base):
    """Model for caching analysis results"""
    __tablename__ = "analysis_cache"
    
    id = Column(String(255), primary_key=True, index=True)
    code_hash = Column(String(255), nullable=False, index=True)
    language = Column(String(50), nullable=False)
    
    result = Column(JSON, nullable=False)
    hits = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    ttl_seconds = Column(Integer, default=3600)
    
    class Config:
        from_attributes = True


class AnalysisIssue(Base):
    """Model for storing detected issues"""
    __tablename__ = "analysis_issues"
    
    id = Column(String(255), primary_key=True, index=True)
    scan_id = Column(String(255), index=True)
    
    issue_type = Column(String(50))
    severity = Column(String(50))
    title = Column(String(255))
    description = Column(Text)
    line_number = Column(Integer, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    confidence = Column(Float)
    agent_name = Column(String(50))
    
    is_false_positive = Column(Boolean, default=False)
    false_positive_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    class Config:
        from_attributes = True
