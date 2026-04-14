# CodeGuardian AI - AI Agents Architecture & Implementation Guide

**Version**: 1.0  
**Framework**: LangGraph + CrewAI  
**Language**: Python (for AI agents) + Node.js/TypeScript (orchestration)

---

## 1. Multi-Agent Architecture

### 1.1 Agent Overview

```
┌─────────────────────────────────────────────────────────┐
│  Orchestrator Agent (LangGraph StateGraph)              │
│  Routes tasks between specialized agents               │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────┬──────────┐
    │            │            │            │          │
    ▼            ▼            ▼            ▼          ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────┐
│Security│  │Perform │  │Logic   │  │Archit. │  │Testing  │
│Agent   │  │Agent   │  │Agent   │  │Agent   │  │Agent    │
└────────┘  └────────┘  └────────┘  └────────┘  └─────────┘
    │            │            │            │          │
    └────────────┼────────────┼────────────┼──────────┘
                 │
    ┌────────────▼──────────────┐
    │  Report Aggregator Agent  │
    │  Combines findings        │
    └────────────┬──────────────┘
                 │
    ┌────────────▼──────────────┐
    │  Test Generator Agent     │
    │  Creates test cases       │
    └──────────────────────────┘
```

### 1.2 Agent Responsibilities

| Agent            | Purpose                   | Checks                            | LLM Model           | Tools                   |
| ---------------- | ------------------------- | --------------------------------- | ------------------- | ----------------------- |
| **Security**     | Vulnerability detection   | SQL injection, XSS, auth bypasses | Groq (Mixtral 8x7B) | Semgrep, CodeQL         |
| **Performance**  | Speed & efficiency        | N+1 queries, nested loops, memory | Groq (LLaMA 2 70B)  | AST analysis, profiling |
| **Logic**        | Business logic validation | Requirements matching, edge cases | Groq (Mixtral 8x7B) | Symbolic execution      |
| **Architecture** | Design patterns           | Microservice boundaries, SOLID    | Groq (LLaMA 2 70B)  | Dependency graph        |
| **Testing**      | Test coverage             | Missing tests, edge cases         | Groq (Mixtral 8x7B) | AST, coverage tools     |

---

## 2. LangGraph Workflow Implementation

### 2.1 Project Structure

```
backend/
└── services/
    └── ai-orchestration/
        ├── src/
        │   ├── agents/
        │   │   ├── security_agent.py
        │   │   ├── performance_agent.py
        │   │   ├── logic_agent.py
        │   │   ├── architecture_agent.py
        │   │   └── testing_agent.py
        │   ├── workflows/
        │   │   ├── code_review_workflow.py
        │   │   └── state.py
        │   ├── tools/
        │   │   ├── code_parser.py
        │   │   ├── semgrep_runner.py
        │   │   ├── codeql_runner.py
        │   │   └── ast_analyzer.py
        │   └── main.py
        ├── requirements.txt
        └── Dockerfile
```

### 2.2 State Definition (Python)

```python
# workflows/state.py
from typing import TypedDict, List, Dict, Any
from dataclasses import dataclass, field

@dataclass
class Finding:
    """Individual finding/issue"""
    issue_type: str  # 'bug', 'security', 'performance', 'style'
    severity: str  # 'critical', 'high', 'medium', 'low'
    title: str
    description: str
    file_path: str
    line_number: int
    code_snippet: str
    suggested_fix: str
    agent_name: str
    confidence: float

@dataclass
class CodeReviewState(TypedDict):
    """Complete state for code review workflow"""
    # Input
    code_content: str
    file_type: str  # 'javascript', 'python', 'java', etc.
    business_requirements: str = ""

    # Processing
    ast: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)

    # Findings from agents
    security_findings: List[Finding] = field(default_factory=list)
    performance_findings: List[Finding] = field(default_factory=list)
    logic_findings: List[Finding] = field(default_factory=list)
    architecture_findings: List[Finding] = field(default_factory=list)
    testing_findings: List[Finding] = field(default_factory=list)

    # Final output
    all_findings: List[Finding] = field(default_factory=list)
    overall_score: float = 0.0
    generated_tests: List[str] = field(default_factory=list)
    report: Dict[str, Any] = field(default_factory=dict)

    # Metadata
    processing_start: str = ""
    processing_end: str = ""
    duration_ms: int = 0
```

### 2.3 LangGraph Workflow (Python)

```python
# workflows/code_review_workflow.py
from langgraph.graph import StateGraph, END
from langgraph.graph.graph import CompiledGraph
from .state import CodeReviewState
from ..agents import (
    security_agent,
    performance_agent,
    logic_agent,
    architecture_agent,
    testing_agent
)
from ..tools import code_parser, ast_analyzer
import time

def create_code_review_workflow() -> CompiledGraph:
    """Create the complete code review workflow"""

    workflow = StateGraph(CodeReviewState)

    # ============ NODES ============

    def parse_code_node(state: CodeReviewState) -> CodeReviewState:
        """Parse code and extract AST"""
        ast = code_parser.parse(state['code_content'], state['file_type'])
        dependencies = ast_analyzer.extract_dependencies(ast)

        state['ast'] = ast
        state['dependencies'] = dependencies
        state['processing_start'] = time.isoformat(time.now())

        return state

    def security_analysis_node(state: CodeReviewState) -> CodeReviewState:
        """Run security agent"""
        findings = security_agent.analyze(
            code=state['code_content'],
            ast=state['ast'],
            requirements=state.get('business_requirements', '')
        )
        state['security_findings'] = findings
        return state

    def performance_analysis_node(state: CodeReviewState) -> CodeReviewState:
        """Run performance agent"""
        findings = performance_agent.analyze(
            code=state['code_content'],
            ast=state['ast'],
            dependencies=state['dependencies']
        )
        state['performance_findings'] = findings
        return state

    def logic_analysis_node(state: CodeReviewState) -> CodeReviewState:
        """Run logic agent"""
        findings = logic_agent.analyze(
            code=state['code_content'],
            ast=state['ast'],
            requirements=state.get('business_requirements', '')
        )
        state['logic_findings'] = findings
        return state

    def architecture_analysis_node(state: CodeReviewState) -> CodeReviewState:
        """Run architecture agent"""
        findings = architecture_agent.analyze(
            code=state['code_content'],
            ast=state['ast'],
            dependencies=state['dependencies']
        )
        state['architecture_findings'] = findings
        return state

    def testing_analysis_node(state: CodeReviewState) -> CodeReviewState:
        """Run testing agent"""
        findings, tests = testing_agent.analyze(
            code=state['code_content'],
            ast=state['ast'],
            existing_tests=[]
        )
        state['testing_findings'] = findings
        state['generated_tests'] = tests
        return state

    def merge_findings_node(state: CodeReviewState) -> CodeReviewState:
        """Merge all findings and calculate scores"""
        all_findings = (
            state['security_findings'] +
            state['performance_findings'] +
            state['logic_findings'] +
            state['architecture_findings'] +
            state['testing_findings']
        )

        # Sort by severity
        severity_scores = {
            'critical': 1.0,
            'high': 0.7,
            'medium': 0.5,
            'low': 0.2
        }

        # Calculate overall score
        if all_findings:
            avg_impact = sum(
                severity_scores.get(f.severity, 0)
                for f in all_findings
            ) / len(all_findings)
            overall_score = max(0, 10 - (avg_impact * 5))
        else:
            overall_score = 10.0

        state['all_findings'] = all_findings
        state['overall_score'] = min(10.0, max(0.0, overall_score))

        return state

    def generate_report_node(state: CodeReviewState) -> CodeReviewState:
        """Generate final report"""
        report = {
            'overall_score': state['overall_score'],
            'total_findings': len(state['all_findings']),
            'by_type': {
                'bugs': len([f for f in state['all_findings'] if f.issue_type == 'bug']),
                'security': len([f for f in state['all_findings'] if f.issue_type == 'security']),
                'performance': len([f for f in state['all_findings'] if f.issue_type == 'performance']),
                'style': len([f for f in state['all_findings'] if f.issue_type == 'style']),
            },
            'by_severity': {
                'critical': len([f for f in state['all_findings'] if f.severity == 'critical']),
                'high': len([f for f in state['all_findings'] if f.severity == 'high']),
                'medium': len([f for f in state['all_findings'] if f.severity == 'medium']),
                'low': len([f for f in state['all_findings'] if f.severity == 'low']),
            },
            'findings': [f.__dict__ for f in state['all_findings']],
            'generated_tests': state['generated_tests'],
        }

        state['report'] = report
        state['processing_end'] = time.isoformat(time.now())

        return state

    # ============ ADD NODES ============
    workflow.add_node("parse_code", parse_code_node)
    workflow.add_node("security", security_analysis_node)
    workflow.add_node("performance", performance_analysis_node)
    workflow.add_node("logic", logic_analysis_node)
    workflow.add_node("architecture", architecture_analysis_node)
    workflow.add_node("testing", testing_analysis_node)
    workflow.add_node("merge", merge_findings_node)
    workflow.add_node("report", generate_report_node)

    # ============ EDGES ============
    workflow.set_entry_point("parse_code")

    # Parse code first
    workflow.add_edge("parse_code", "security")
    workflow.add_edge("parse_code", "performance")
    workflow.add_edge("parse_code", "logic")
    workflow.add_edge("parse_code", "architecture")
    workflow.add_edge("parse_code", "testing")

    # All agents → merge (parallel execution)
    workflow.add_edge("security", "merge")
    workflow.add_edge("performance", "merge")
    workflow.add_edge("logic", "merge")
    workflow.add_edge("architecture", "merge")
    workflow.add_edge("testing", "merge")

    # Merge → report → end
    workflow.add_edge("merge", "report")
    workflow.add_edge("report", END)

    # ============ COMPILE ============
    return workflow.compile()

# Usage
if __name__ == "__main__":
    workflow = create_code_review_workflow()

    # Run workflow
    result = workflow.invoke({
        'code_content': open('payment.js').read(),
        'file_type': 'javascript',
        'business_requirements': 'Users can withdraw if balance > amount and daily limit enforced'
    })

    print(f"Overall Score: {result['overall_score']}")
    print(f"Total Findings: {len(result['all_findings'])}")
    print(f"Generated Tests: {len(result['generated_tests'])}")
```

---

## 3. Individual Agent Implementation

### 3.1 Security Agent (Python)

```python
# agents/security_agent.py
import os
from langchain.llms import Groq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from typing import List
import subprocess
import json

class SecurityAgent:
    def __init__(self):
        self.llm = Groq(
            model="mixtral-8x7b-32768",
            temperature=0.3,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

    def run_semgrep(self, code: str) -> List[dict]:
        """Run Semgrep for static security analysis"""
        # Write code to temp file
        with open('/tmp/code_temp.js', 'w') as f:
            f.write(code)

        # Run semgrep
        result = subprocess.run([
            'semgrep',
            '--config=p/security-audit',
            '/tmp/code_temp.js',
            '--json'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            findings = json.loads(result.stdout)
            return findings.get('results', [])
        return []

    def llm_analysis(self, code: str, semgrep_findings: List[dict]) -> List[dict]:
        """Use LLM for additional security analysis"""
        prompt = PromptTemplate(
            input_variables=["code", "semgrep_findings"],
            template="""
            Analyze this code for security vulnerabilities:

            Code:
            {code}

            Static analysis findings:
            {semgrep_findings}

            Provide additional security vulnerabilities not caught by static analysis.
            Focus on: authentication, authorization, data validation, cryptography.

            Return as JSON array with fields: vulnerability, code_line, severity, fix
            """
        )

        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = chain.run(
            code=code[:2000],  # Limit input
            semgrep_findings=json.dumps(semgrep_findings[:5])
        )

        return json.loads(result)

    def analyze(self, code: str, ast: dict, requirements: str) -> List:
        """Complete security analysis"""
        # Step 1: Run static analysis
        semgrep_findings = self.run_semgrep(code)

        # Step 2: LLM analysis
        llm_findings = self.llm_analysis(code, semgrep_findings)

        # Step 3: Convert to Finding objects
        findings = []

        # From semgrep
        for finding in semgrep_findings[:5]:  # Limit
            findings.append({
                'issue_type': 'security',
                'severity': finding.get('extra', {}).get('severity', 'medium'),
                'title': finding.get('check_id'),
                'description': finding.get('extra', {}).get('message', ''),
                'line_number': finding.get('start', {}).get('line', 0),
                'code_snippet': code.split('\n')[finding.get('start', {}).get('line', 0) - 1],
                'suggested_fix': f"Review the security issue: {finding.get('check_id')}",
                'agent_name': 'security-agent'
            })

        return findings
```

### 3.2 Performance Agent (Python)

```python
# agents/performance_agent.py
from langchain.llms import Groq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
import ast as python_ast

class PerformanceAgent:
    def __init__(self):
        self.llm = Groq(
            model="llama-2-70b-chat",
            temperature=0.2,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

    def analyze_nested_loops(self, code: str) -> List[dict]:
        """Detect nested loops"""
        findings = []
        lines = code.split('\n')

        loop_stack = []
        for i, line in enumerate(lines, 1):
            if 'for ' in line or 'while ' in line:
                loop_stack.append((i, line.strip()))

            if len(loop_stack) >= 2:
                findings.append({
                    'issue_type': 'performance',
                    'severity': 'high',
                    'title': f'Nested loop detected',
                    'description': f'O(n²) or worse complexity potential',
                    'line_number': i,
                    'code_snippet': line,
                    'suggested_fix': 'Consider using hash maps or sorting',
                    'agent_name': 'performance-agent'
                })

        return findings

    def llm_analysis(self, code: str) -> List[dict]:
        """LLM-based performance analysis"""
        prompt = PromptTemplate(
            input_variables=["code"],
            template="""
            Analyze this code for performance issues:

            {code}

            Identify:
            1. Time complexity issues
            2. Memory issues
            3. Blocking operations
            4. Inefficient data structures

            For each issue, provide: line_number, issue, severity, fix
            Return as JSON array.
            """
        )

        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = chain.run(code=code[:2000])

        return json.loads(result)

    def analyze(self, code: str, ast: dict, dependencies: List[str]) -> List:
        """Complete performance analysis"""
        findings = []

        # Detect nested loops
        findings.extend(self.analyze_nested_loops(code))

        # LLM analysis
        findings.extend(self.llm_analysis(code))

        return findings
```

---

## 4. CrewAI Integration (Alternative)

### 4.1 CrewAI vs LangGraph Comparison

| Feature                | LangGraph                 | CrewAI                       |
| ---------------------- | ------------------------- | ---------------------------- |
| **Workflow Control**   | Explicit graph definition | Implicit agent collaboration |
| **Parallel Execution** | Native support            | Requires manual setup        |
| **State Management**   | Explicit state object     | Implicit message passing     |
| **Memory**             | Built-in snapshot         | Plugin-based                 |
| **Best For**           | Complex workflows         | Agent teams                  |

### 4.2 CrewAI Implementation Example

```python
# agents/crew_code_review.py
from crewai import Agent, Task, Crew
from langchain.llms import Groq

# Initialize LLM
llm = Groq(model="mixtral-8x7b-32768")

# Create agents
security_agent = Agent(
    role="Security Specialist",
    goal="Find security vulnerabilities in code",
    backstory="Expert security researcher with 20 years experience",
    llm=llm,
    verbose=True
)

performance_agent = Agent(
    role="Performance Engineer",
    goal="Identify performance bottlenecks",
    backstory="Expert in optimization and algorithm analysis",
    llm=llm,
    verbose=True
)

architecture_agent = Agent(
    role="Architecture Reviewer",
    goal="Validate architectural patterns and SOLID principles",
    backstory="Senior architect with enterprise experience",
    llm=llm,
    verbose=True
)

# Create tasks
security_task = Task(
    description="Review code for SQL injection, XSS, and auth issues",
    agent=security_agent,
    expected_output="List of security findings with severity"
)

performance_task = Task(
    description="Analyze code for N+1 queries, nested loops, memory leaks",
    agent=performance_agent,
    expected_output="List of performance issues with complexity analysis"
)

architecture_task = Task(
    description="Check if code follows SOLID principles and design patterns",
    agent=architecture_agent,
    expected_output="Architecture violations and recommendations"
)

# Create crew
crew = Crew(
    agents=[security_agent, performance_agent, architecture_agent],
    tasks=[security_task, performance_task, architecture_task],
    verbose=2
)

# Execute
result = crew.kickoff(inputs={"code": user_code})
```

---

## 5. Tools Integration

### 5.1 Code Parser Tool

```python
# tools/code_parser.py
import tree_sitter
import json

class CodeParser:
    def __init__(self):
        import tree_sitter_javascript as tsl
        self.language = tsl.language()
        self.parser = tree_sitter.Parser()
        self.parser.set_language(self.language)

    def parse(self, code: str, file_type: str) -> dict:
        """Parse code and extract AST"""
        tree = self.parser.parse(code.encode())

        return {
            'ast': self._tree_to_dict(tree.root_node),
            'functions': self._extract_functions(tree),
            'imports': self._extract_imports(tree),
            'classes': self._extract_classes(tree)
        }

    def _extract_functions(self, tree) -> List[dict]:
        """Extract all functions from AST"""
        functions = []
        # Implementation
        return functions
```

### 5.2 Semgrep Runner

```python
# tools/semgrep_runner.py
import subprocess
import json
from typing import List

class SemgrepRunner:
    @staticmethod
    def run(code: str, rules: str = "p/security-audit") -> List[dict]:
        """Run Semgrep scan"""
        with open('/tmp/scan_code.js', 'w') as f:
            f.write(code)

        result = subprocess.run([
            'semgrep',
            f'--config={rules}',
            '/tmp/scan_code.js',
            '--json'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            return json.loads(result.stdout).get('results', [])
        return []
```

---

## 6. Redis Memory & Snapshots

### 6.1 Memory Implementation

```python
# memory/redis_memory.py
import redis
import json
from typing import Dict, Any

class RedisMemory:
    def __init__(self, host='localhost', port=6379):
        self.redis = redis.Redis(host=host, port=port, decode_responses=True)

    def store_state_snapshot(self, scan_id: str, state: Dict[str, Any]) -> None:
        """Store state snapshot for recovery"""
        self.redis.setex(
            f"scan:{scan_id}:state",
            3600,  # 1 hour TTL
            json.dumps(state, default=str)
        )

    def get_state_snapshot(self, scan_id: str) -> Dict[str, Any]:
        """Retrieve state snapshot"""
        data = self.redis.get(f"scan:{scan_id}:state")
        if data:
            return json.loads(data)
        return None

    def store_agent_findings(self, scan_id: str, agent_name: str, findings: List) -> None:
        """Cache agent findings"""
        self.redis.setex(
            f"scan:{scan_id}:{agent_name}",
            1800,  # 30 min TTL
            json.dumps(findings, default=str)
        )
```

---

## 7. Integration with Backend (Node.js)

### 7.1 Python AI Service API

```python
# main.py - FastAPI service
from fastapi import FastAPI
from workflows.code_review_workflow import create_code_review_workflow
from pydantic import BaseModel
import asyncio

app = FastAPI()
workflow = create_code_review_workflow()

class CodeReviewRequest(BaseModel):
    code_content: str
    file_type: str
    business_requirements: str = ""

@app.post("/api/analyze")
async def analyze_code(request: CodeReviewRequest):
    """Analyze code with LangGraph workflow"""

    # Run in background thread (blocking operation)
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        workflow.invoke,
        {
            'code_content': request.code_content,
            'file_type': request.file_type,
            'business_requirements': request.business_requirements
        }
    )

    return {
        'scan_id': 'generated-uuid',
        'overall_score': result['overall_score'],
        'findings_count': len(result['all_findings']),
        'report': result['report']
    }
```

### 7.2 NestJS Integration

```typescript
// backend/services/ai-orchestration/ai.service.ts
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AIService {
  private aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

  constructor(private httpService: HttpService) {}

  async analyzeCode(
    code: string,
    fileType: string,
    businessRequirements?: string,
  ) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.aiServiceUrl}/api/analyze`, {
        code_content: code,
        file_type: fileType,
        business_requirements: businessRequirements || "",
      }),
    );

    return response.data;
  }
}
```

---

## 8. Deployment (Docker)

### 8.1 AI Service Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libpq-dev \
    semgrep \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ .

# Expose API
EXPOSE 8000

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 8.2 Docker Compose with AI Service

```yaml
# Added to main docker-compose.yml
ai-service:
  build: ./backend/services/ai-orchestration
  ports:
    - "8001:8000"
  environment:
    GROQ_API_KEY: ${GROQ_API_KEY}
    REDIS_URL: redis://redis:6379
    LOG_LEVEL: INFO
  depends_on:
    - redis
  networks:
    - backend
```

---

## 9. Monitoring & Logging

```python
# utils/logging.py
import logging
from pythonjsonlogger import jsonlogger

# JSON logging for structured analysis
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

def log_agent_execution(agent_name: str, input_size: int, output_size: int, duration_ms: int):
    logger.info({
        'event': 'agent_execution',
        'agent': agent_name,
        'input_size': input_size,
        'output_size': output_size,
        'duration_ms': duration_ms
    })
```

---

## 10. Testing

```python
# tests/test_workflow.py
import pytest
from workflows.code_review_workflow import create_code_review_workflow

def test_security_agent():
    workflow = create_code_review_workflow()

    sql_injection_code = """
    query = "SELECT * FROM users WHERE id=" + user_id
    db.execute(query)
    """

    result = workflow.invoke({
        'code_content': sql_injection_code,
        'file_type': 'javascript'
    })

    assert len(result['security_findings']) > 0
    assert any('SQL' in f['title'] for f in result['security_findings'])

def test_nested_loops():
    workflow = create_code_review_workflow()

    nested_code = """
    for i in range(n):
        for j in range(n):
            print(i, j)
    """

    result = workflow.invoke({
        'code_content': nested_code,
        'file_type': 'python'
    })

    assert len(result['performance_findings']) > 0
```

---

## Conclusion

This architecture provides:
✅ **Scalable multi-agent system** using LangGraph  
✅ **Free LLM integration** with Groq  
✅ **Memory & persistence** with Redis snapshots  
✅ **Easy backend integration** via REST API  
✅ **Production-ready** monitoring & logging  
✅ **Full containerization** with Docker

**Next**: Start with Phase 1 deployment and basic agents.
