"""
LLM service for Groq API integration
"""
import logging
import json
import asyncio
from typing import Dict, Any
from langchain_core.messages import HumanMessage, SystemMessage

from app.config.settings import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM operations via Groq (async-safe, with mock mode)"""

    def __init__(self):
        """Initialize LLM client if available"""
        # Lazy import ChatGroq to avoid hard dependency issues in test environments
        self.client = None
        if settings.groq_use_mock:
            logger.info("Groq mock mode enabled")
            return

        if not settings.groq_api_key:
            logger.warning("GROQ_API_KEY not set; LLM disabled")
            return

        try:
            from langchain_groq import ChatGroq

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
        additional_context: str = "",
    ) -> Dict[str, Any]:
        """Analyze code and return parsed JSON findings.

        Uses `asyncio.to_thread` to avoid blocking the event loop when the
        underlying client is synchronous. In mock mode, returns an empty
        findings list with a sample structure for testing.
        """
        if settings.groq_use_mock:
            logger.debug("Returning mock analysis result")
            return {"findings": []}

        if not self.client:
            logger.warning("LLM client not available")
            return {"error": "LLM service unavailable", "findings": []}

        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Analyze this code:\n\n```\n{code}\n```\n\n{additional_context}"),
            ]

            # Call client.invoke in a thread to avoid blocking
            try:
                response = await asyncio.to_thread(self.client.invoke, messages)
            except Exception as e:
                logger.error(f"LLM invoke failed: {str(e)}")
                return {"error": str(e), "findings": []}

            response_text = getattr(response, "content", str(response))

            # Extract JSON from the response if wrapped in markdown
            json_str = response_text
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0]

            try:
                result = json.loads(json_str)
                logger.debug("LLM analysis parsed JSON successfully")
                return result
            except json.JSONDecodeError:
                logger.warning("Failed to parse JSON from LLM response")
                return {"findings": []}

        except Exception as e:
            logger.error(f"LLM analysis failed: {str(e)}")
            return {"error": str(e), "findings": []}

    async def get_completion(self, system_prompt: str, user_message: str) -> str:
        """Return a plain-text completion from the LLM or mock response."""
        if settings.groq_use_mock:
            return "[mock completion]"

        if not self.client:
            return ""

        try:
            messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_message)]
            response = await asyncio.to_thread(self.client.invoke, messages)
            return getattr(response, "content", str(response))
        except Exception as e:
            logger.error(f"LLM completion failed: {str(e)}")
            return ""


# Global LLM service instance
llm_service = LLMService()
