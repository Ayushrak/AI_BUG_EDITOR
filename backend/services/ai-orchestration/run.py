"""
AI Orchestration Service - Python FastAPI

Multi-agent code analysis using LangGraph and Groq API
"""
import uvicorn
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting AI Orchestration Service...")
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            workers=1,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("Service stopped by user")
    except Exception as e:
        logger.error(f"Failed to start service: {str(e)}", exc_info=True)
        sys.exit(1)
