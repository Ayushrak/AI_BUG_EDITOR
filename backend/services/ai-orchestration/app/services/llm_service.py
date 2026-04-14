"""
LLM service for Groq API integration
"""
import logging
import json
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from app.config.settings import settings

logger = logging.getLogger(__name__)

class LLMService:
    """Service for LLM operations via Groq"""
    
    def __init__(self):
        """Initialize LLM client"""
        if not settings.groq_api_key:
            logger.warning("GROQ_API_KEY not set")
            self.client = None
        else:
            try:
                self.client = ChatGroq(
                    model=settings.groq_model,
                    temperature=settings.groq_temperature,
                    max_tokens=settings.groq_max_tokens,
                    groq_api_key=settings.groq_api_key,
                )
                logger.info(f"Groq client initialized: {settings.groq_model}")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {str(e)}")
                self.client = None
    
    async def analyze_with_json_output(
        self,
        system_prompt: str,
        code: str,
        additional_context: str = ""
    ) -> Dict[str, Any]:
        """
        Analyze code and get JSON response
        
        Args:
            system_prompt: System prompt for analysis
            code: Code to analyze
            additional_context: Additional context
            
        Returns:
            Parsed JSON response
        """
        if not self.client:
            logger.warning("LLM client not available")
            return {"error": "LLM service unavailable", "findings": []}
        
        try:
            # Prepare prompt
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Analyze this code:\n\n```\n{code}\n```\n\n{additional_context}")
            ]
            
            # Get response
            response = self.client.invoke(messages)
            response_text = response.content
            
            # Parse JSON
            try:
                # Try to extract JSON from response
                json_str = response_text
                if "```json" in response_text:
                    json_str = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    json_str = response_text.split("```")[1].split("```")[0]
                
                result = json.loads(json_str)
                logger.debug(f"LLM analysis successful")
                return result
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON response: {response_text[:100]}")
                return {"findings": []}
                
        except Exception as e:
            logger.error(f"LLM analysis failed: {str(e)}")
            return {"error": str(e), "findings": []}
    
    async def get_completion(
        self,
        system_prompt: str,
        user_message: str
    ) -> str:
        """
        Get text completion from LLM
        
        Args:
            system_prompt: System context
            user_message: User message
            
        Returns:
            LLM response
        """
        if not self.client:
            return ""
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message)
            ]
            response = self.client.invoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"LLM completion failed: {str(e)}")
            return ""

# Global LLM service instance
llm_service = LLMService()
