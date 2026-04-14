"""
LangGraph workflow orchestration for multi-agent code analysis
"""
import logging
import asyncio
from typing import Any, TypedDict, Optional, List
from langgraph.graph import StateGraph, END
import json

from app.services.llm_service import llm_service
from app.agents.prompts import (
    SECURITY_SYSTEM_PROMPT,
    PERFORMANCE_SYSTEM_PROMPT,
    LOGIC_SYSTEM_PROMPT,
    ARCHITECTURE_SYSTEM_PROMPT,
    TEST_GENERATION_PROMPT
)

logger = logging.getLogger(__name__)

class CodeReviewState(TypedDict):
    """Workflow state definition"""
    scan_id: str
    code: str
    language: str
    business_requirements: Optional[List[str]]
    security_findings: Optional[List[dict]]
    performance_findings: Optional[List[dict]]
    logic_findings: Optional[List[dict]]
    architecture_findings: Optional[List[dict]]
    test_suggestions: Optional[List[str]]
    errors: Optional[List[str]]

def initialize_workflow() -> StateGraph:
    """
    Initialize LangGraph workflow for code analysis
    
    Returns:
        Configured StateGraph for multi-agent analysis
    """
    workflow = StateGraph(CodeReviewState)
    
    # Define nodes (agents/tasks)
    workflow.add_node("parse_code", parse_code_node)
    workflow.add_node("security_agent", security_agent_node)
    workflow.add_node("performance_agent", performance_agent_node)
    workflow.add_node("logic_agent", logic_agent_node)
    workflow.add_node("architecture_agent", architecture_agent_node)
    workflow.add_node("test_generator", test_generator_node)
    workflow.add_node("merge_findings", merge_findings_node)
    
    # Define edges (flow)
    workflow.add_edge("parse_code", "security_agent")
    workflow.add_edge("parse_code", "performance_agent")
    workflow.add_edge("parse_code", "logic_agent")
    workflow.add_edge("parse_code", "architecture_agent")
    
    workflow.add_edge("security_agent", "test_generator")
    workflow.add_edge("performance_agent", "test_generator")
    workflow.add_edge("logic_agent", "test_generator")
    workflow.add_edge("architecture_agent", "test_generator")
    
    workflow.add_edge("test_generator", "merge_findings")
    workflow.add_edge("merge_findings", END)
    
    # Set entry point
    workflow.set_entry_point("parse_code")
    
    return workflow

def parse_code_node(state: CodeReviewState) -> CodeReviewState:
    """Parse and validate input code"""
    logger.info(f"Parsing code for scan {state['scan_id']}")
    
    try:
        # Basic validation
        if not state.get('code'):
            raise ValueError("Code content is empty")
        if not state.get('language'):
            raise ValueError("Language not specified")
        
        state['errors'] = state.get('errors', [])
        logger.debug(f"Code parsing successful - {len(state['code'])} characters")
        
    except Exception as e:
        if 'errors' not in state:
            state['errors'] = []
        state['errors'].append(f"Parse error: {str(e)}")
        logger.error(f"Error parsing code: {str(e)}")
    
    return state

def security_agent_node(state: CodeReviewState) -> CodeReviewState:
    """Security analysis agent"""
    logger.info(f"Running security analysis for scan {state['scan_id']}")
    
    try:
        # Prepare context
        language = state.get('language', 'unknown')
        additional_context = f"Language: {language}"
        
        # Call LLM
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(
            llm_service.analyze_with_json_output(
                SECURITY_SYSTEM_PROMPT,
                state['code'],
                additional_context
            )
        )
        
        security_findings = result.get('findings', [])
        
        # Ensure findings have required fields
        for finding in security_findings:
            finding.setdefault('type', 'security')
            finding.setdefault('agent_name', 'security')
            finding.setdefault('confidence', 0.7)
        
        state['security_findings'] = security_findings
        logger.info(f"Security analysis found {len(security_findings)} issues")
        
    except Exception as e:
        error_msg = f"Security agent error: {str(e)}"
        state['errors'].append(error_msg)
        state['security_findings'] = []
        logger.error(error_msg)
    
    return state

def performance_agent_node(state: CodeReviewState) -> CodeReviewState:
    """Performance analysis agent"""
    logger.info(f"Running performance analysis for scan {state['scan_id']}")
    
    try:
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(
            llm_service.analyze_with_json_output(
                PERFORMANCE_SYSTEM_PROMPT,
                state['code'],
                f"Language: {state.get('language', 'unknown')}"
            )
        )
        
        performance_findings = result.get('findings', [])
        for finding in performance_findings:
            finding.setdefault('type', 'performance')
            finding.setdefault('agent_name', 'performance')
            finding.setdefault('confidence', 0.7)
        
        state['performance_findings'] = performance_findings
        logger.info(f"Performance analysis found {len(performance_findings)} issues")
        
    except Exception as e:
        error_msg = f"Performance agent error: {str(e)}"
        state['errors'].append(error_msg)
        state['performance_findings'] = []
        logger.error(error_msg)
    
    return state

def logic_agent_node(state: CodeReviewState) -> CodeReviewState:
    """Business logic validation agent"""
    logger.info(f"Running logic analysis for scan {state['scan_id']}")
    
    try:
        requirements = state.get('business_requirements', [])
        requirements_text = f"Requirements: {', '.join(requirements)}" if requirements else "No specific requirements"
        
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(
            llm_service.analyze_with_json_output(
                LOGIC_SYSTEM_PROMPT,
                state['code'],
                requirements_text
            )
        )
        
        logic_findings = result.get('findings', [])
        for finding in logic_findings:
            finding.setdefault('type', 'logic')
            finding.setdefault('agent_name', 'logic')
            finding.setdefault('confidence', 0.7)
        
        state['logic_findings'] = logic_findings
        logger.info(f"Logic analysis found {len(logic_findings)} issues")
        
    except Exception as e:
        error_msg = f"Logic agent error: {str(e)}"
        state['errors'].append(error_msg)
        state['logic_findings'] = []
        logger.error(error_msg)
    
    return state

def architecture_agent_node(state: CodeReviewState) -> CodeReviewState:
    """Architecture and design quality agent"""
    logger.info(f"Running architecture analysis for scan {state['scan_id']}")
    
    try:
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(
            llm_service.analyze_with_json_output(
                ARCHITECTURE_SYSTEM_PROMPT,
                state['code'],
                f"Language: {state.get('language', 'unknown')}"
            )
        )
        
        architecture_findings = result.get('findings', [])
        for finding in architecture_findings:
            finding.setdefault('type', 'architecture')
            finding.setdefault('agent_name', 'architecture')
            finding.setdefault('confidence', 0.7)
        
        state['architecture_findings'] = architecture_findings
        logger.info(f"Architecture analysis found {len(architecture_findings)} issues")
        
    except Exception as e:
        error_msg = f"Architecture agent error: {str(e)}"
        state['errors'].append(error_msg)
        state['architecture_findings'] = []
        logger.error(error_msg)
    
    return state

def test_generator_node(state: CodeReviewState) -> CodeReviewState:
    """Generate test cases for edge cases and requirements"""
    logger.info(f"Generating test cases for scan {state['scan_id']}")
    
    try:
        requirements = state.get('business_requirements', [])
        context = f"Requirements: {', '.join(requirements)}" if requirements else ""
        
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(
            llm_service.analyze_with_json_output(
                TEST_GENERATION_PROMPT,
                state['code'],
                context
            )
        )
        
        test_cases = result.get('test_cases', [])
        test_suggestions = [tc.get('code', '') for tc in test_cases if tc.get('code')]
        
        state['test_suggestions'] = test_suggestions
        logger.info(f"Generated {len(test_suggestions)} test cases")
        
    except Exception as e:
        error_msg = f"Test generator error: {str(e)}"
        state['errors'].append(error_msg)
        state['test_suggestions'] = []
        logger.error(error_msg)
    
    return state

def merge_findings_node(state: CodeReviewState) -> CodeReviewState:
    """Merge findings from all agents"""
    logger.info(f"Merging findings for scan {state['scan_id']}")
    
    try:
        # Aggregate all findings
        all_findings = []
        
        for finding_type in ['security_findings', 'performance_findings', 
                           'logic_findings', 'architecture_findings']:
            findings = state.get(finding_type, [])
            if findings:
                all_findings.extend(findings)
        
        logger.info(f"Total findings: {len(all_findings)}")
        
    except Exception as e:
        state['errors'].append(f"Merge findings error: {str(e)}")
        logger.error(f"Merge findings failed: {str(e)}")
    
    return state
