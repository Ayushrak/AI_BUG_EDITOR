import logging
from typing import Optional
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """Application configuration from environment variables"""
    
    # Application
    app_name: str = "CodeGuardian AI - AI Orchestration Service"
    debug: bool = False
    environment: str = "development"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    
    # Logging
    log_level: str = "INFO"
    
    # Groq API (LLM Provider)
    groq_api_key: str = ""
    groq_model: str = "mixtral-8x7b-32768"
    groq_temperature: float = 0.7
    groq_max_tokens: int = 2048
    
    # Redis
    redis_url: str = "redis://:redis@localhost:6379"
    redis_db: int = 0
    
    # Kafka
    kafka_brokers: str = "localhost:29092"
    kafka_consumer_group: str = "ai-orchestration"
    
    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/codeguardian"
    
    # Features
    enable_caching: bool = True
    enable_redis_snapshots: bool = True
    max_workflow_tokens: int = 10000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
