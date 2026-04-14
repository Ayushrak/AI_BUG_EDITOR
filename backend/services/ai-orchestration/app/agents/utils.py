"""
Shared utilities for AI agents
"""
import logging
from typing import Dict, Any, List
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_groq_api(client, model: str, messages: List[Dict[str, str]], **kwargs) -> str:
    """
    Call Groq API with retry logic
    
    Args:
        client: Groq client
        model: Model name
        messages: List of message dicts
        **kwargs: Additional parameters (temperature, max_tokens, etc.)
    
    Returns:
        API response text
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            **kwargs
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        raise

def parse_agent_response(response: str, agent_type: str) -> Dict[str, Any]:
    """
    Parse agent response and extract structured data
    
    Args:
        response: Raw agent response
        agent_type: Type of agent (security, performance, etc.)
    
    Returns:
        Parsed findings dictionary
    """
    # Basic parsing - extend based on agent output format
    findings = {
        "agent_type": agent_type,
        "raw_response": response,
        "findings": []
    }
    return findings

def merge_agent_findings(all_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Merge findings from multiple agents"""
    merged = {
        "security": [],
        "performance": [],
        "logic": [],
        "architecture": [],
        "testing": []
    }
    
    for agent_findings in all_findings:
        agent_type = agent_findings.get("agent_type", "")
        if agent_type in merged:
            merged[agent_type].extend(agent_findings.get("findings", []))
    
    return merged
