import { Injectable } from '@nestjs/common';
import type { AnalysisFinding } from '../analysis.types';
import type {
  AgentRunSlice,
  CodeguardianAgentPipelineResult,
  LegacyArchitectureIssue,
  LegacyEdgeCase,
  LegacyPerformanceIssue,
  LegacyRequirementCheck,
  LegacyScanBug,
  LegacyScanResponse,
  LegacySecurityIssue,
  LegacySuggestion,
} from './codeguardian.types';

/**
 * Multi-agent static analysis aligned with CodeGuardian AI workspace
 * (Asset-Manager monorepo: artifacts/api-server/src/routes/scan.ts).
 * Each private method acts as one “agent” over the same AST-free line scan.
 */
@Injectable()
export class CodeguardianStaticAgentsService {
  run(code: string, requirements?: string, filename = 'snippet'): CodeguardianAgentPipelineResult {
    const lines = code.split('\n');
    const slices: AgentRunSlice[] = [];

    const security = this.runSecurityAgent(lines, filename);
    slices.push(security.slice);

    const performance = this.runPerformanceAgent(lines, filename);
    slices.push(performance.slice);

    const architecture = this.runArchitectureAgent(lines, filename);
    slices.push(architecture.slice);

    const logic = this.runLogicAgent(lines, code, filename);
    slices.push(logic.slice);

    const edge = this.runEdgeCaseAgent(code, filename);
    slices.push(edge.slice);

    const style = this.runStyleAgent(lines, code, filename);
    slices.push(style.slice);

    const req = this.runRequirementsAgent(code, requirements);
    slices.push(req.slice);

    const bugs = logic.bugs;
    const securityIssues = security.issues;
    const performanceIssues = performance.issues;
    const architectureIssues = architecture.issues;
    const edgeCases = edge.cases;
    const suggestions = style.suggestions;
    const requirementsChecks = req.checks;

    const secPenalty =
      securityIssues.filter((s) => s.severity === 'critical').length * 2.5 +
      securityIssues.filter((s) => s.severity === 'high').length * 1.5;
    const bugPenalty =
      bugs.filter((b) => b.severity === 'critical').length * 2 +
      bugs.filter((b) => b.severity === 'high').length;
    const perfPenalty =
      performanceIssues.filter((p) => p.impact === 'high').length * 1.5;
    const archPenalty = architectureIssues.length * 0.5;

    const securityScore = Math.max(1, Math.min(10, 10 - secPenalty));
    const qualityScore = Math.max(1, Math.min(10, 10 - bugPenalty - archPenalty));
    const performanceScore = Math.max(1, Math.min(10, 10 - perfPenalty));
    const maintainabilityScore = Math.max(
      1,
      Math.min(10, 10 - archPenalty - suggestions.length * 0.3),
    );
    const overallScore =
      (securityScore + qualityScore + performanceScore + maintainabilityScore) / 4;
    const riskScore = Math.min(
      100,
      Math.round(
        securityIssues.filter((s) => s.severity === 'critical').length * 30 +
          securityIssues.filter((s) => s.severity === 'high').length * 15 +
          bugs.filter((b) => b.severity === 'critical').length * 20 +
          bugs.filter((b) => b.severity === 'high').length * 10 +
          performanceIssues.filter((p) => p.impact === 'high').length * 10,
      ),
    );

    const reqPassCount = requirementsChecks.filter((r) => r.status === 'pass').length;
    const reqTotal = requirementsChecks.length;
    const summaryParts: string[] = [];
    if (securityIssues.length > 0) {
      summaryParts.push(
        `${securityIssues.length} security issue${securityIssues.length > 1 ? 's' : ''} detected`,
      );
    }
    if (bugs.length > 0) {
      summaryParts.push(`${bugs.length} bug${bugs.length > 1 ? 's' : ''} found`);
    }
    if (performanceIssues.length > 0) {
      summaryParts.push(
        `${performanceIssues.length} performance concern${performanceIssues.length > 1 ? 's' : ''}`,
      );
    }
    if (requirementsChecks.length > 0) {
      summaryParts.push(`${reqPassCount}/${reqTotal} requirements verified`);
    }
    if (summaryParts.length === 0) {
      summaryParts.push('No critical issues detected');
    }
    const summary = summaryParts.join('. ') + '.';

    const legacy: LegacyScanResponse = {
      overallScore: parseFloat(overallScore.toFixed(1)),
      riskScore,
      qualityScore: parseFloat(qualityScore.toFixed(1)),
      securityScore: parseFloat(securityScore.toFixed(1)),
      performanceScore: parseFloat(performanceScore.toFixed(1)),
      maintainabilityScore: parseFloat(maintainabilityScore.toFixed(1)),
      summary,
      bugs,
      securityIssues,
      performanceIssues,
      architectureIssues,
      edgeCases,
      suggestions,
      requirementsChecks,
      linesAnalyzed: lines.length,
    };

    const scores = {
      quality: legacy.qualityScore,
      security: legacy.securityScore,
      performance: legacy.performanceScore,
      maintainability: legacy.maintainabilityScore,
    };

    return { legacy, slices, scores, summaryText: summary };
  }

  private runSecurityAgent(
    lines: string[],
    filename: string,
  ): { slice: AgentRunSlice; issues: LegacySecurityIssue[] } {
    const issues: LegacySecurityIssue[] = [];
    const findings: AnalysisFinding[] = [];
    const path = filename;

    const sqlPatterns = [
      /["'`]\s*\+\s*(req\.|params\.|query\.|body\.|input|search|term|id|user)/i,
      /query\s*=\s*["'`].*\+\s*/i,
      /SELECT\s+.*\+\s*/i,
      /WHERE\s+.*\+\s*/i,
    ];
    lines.forEach((line, i) => {
      if (sqlPatterns.some((p) => p.test(line))) {
        issues.push({
          id: `si-sql-${i}`,
          type: 'SQL Injection',
          title: 'SQL Injection Vulnerability',
          description:
            'User input is concatenated directly into a SQL query without sanitization, allowing attackers to manipulate database queries.',
          severity: 'critical',
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          recommendation:
            "Use parameterized queries: db.query('SELECT * FROM users WHERE id = $1', [userId])",
        });
        findings.push({
          category: 'security',
          severity: 'critical',
          title: 'SQL Injection Vulnerability',
          description: issues[issues.length - 1].description,
          filePath: path,
          lineHint: i + 1,
          suggestedFix: issues[issues.length - 1].recommendation,
        });
      }
    });

    const xssPatterns = [
      /innerHTML\s*=\s*(?!["'`]<)/i,
      /document\.write\s*\(/i,
      /dangerouslySetInnerHTML/i,
    ];
    lines.forEach((line, i) => {
      if (xssPatterns.some((p) => p.test(line)) && !line.includes('//')) {
        issues.push({
          id: `si-xss-${i}`,
          type: 'XSS',
          title: 'Cross-Site Scripting (XSS) Risk',
          description:
            'Unsanitized user data is being written directly to the DOM, which could allow injection of malicious scripts.',
          severity: 'high',
          lineNumber: i + 1,
          codeSnippet: line.trim(),
          recommendation:
            'Sanitize user input before DOM insertion. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.',
        });
        findings.push({
          category: 'security',
          severity: 'high',
          title: 'Cross-Site Scripting (XSS) Risk',
          description: issues[issues.length - 1].description,
          filePath: path,
          lineHint: i + 1,
          suggestedFix: issues[issues.length - 1].recommendation,
        });
      }
    });

    const secretPatterns = [
      /password\s*=\s*["'`][^"'`]{4,}/i,
      /secret\s*=\s*["'`][^"'`]{4,}/i,
      /api_?key\s*=\s*["'`][^"'`]{8,}/i,
      /token\s*=\s*["'`][^"'`]{8,}/i,
    ];
    lines.forEach((line, i) => {
      if (secretPatterns.some((p) => p.test(line)) && !line.trim().startsWith('//')) {
        issues.push({
          id: `si-secret-${i}`,
          type: 'Hardcoded Secret',
          title: 'Hardcoded Credentials Detected',
          description:
            'Credentials or secrets are hardcoded in source code. These will be exposed if the codebase is shared or committed to version control.',
          severity: 'critical',
          lineNumber: i + 1,
          codeSnippet: line
            .trim()
            .replace(/=\s*["'`][^"'`]{4,}/, '= "[REDACTED]"'),
          recommendation:
            'Move secrets to environment variables and access via process.env.SECRET_NAME. Use a secrets manager for production.',
        });
        findings.push({
          category: 'security',
          severity: 'critical',
          title: 'Hardcoded Credentials Detected',
          description: issues[issues.length - 1].description,
          filePath: path,
          lineHint: i + 1,
          suggestedFix: issues[issues.length - 1].recommendation,
        });
      }
    });

    return {
      slice: { agentId: 'security', name: 'Security Agent', findings },
      issues,
    };
  }

  private runPerformanceAgent(
    lines: string[],
    filename: string,
  ): { slice: AgentRunSlice; issues: LegacyPerformanceIssue[] } {
    const issues: LegacyPerformanceIssue[] = [];
    const findings: AnalysisFinding[] = [];
    const path = filename;

    let nestedLoopDepth = 0;
    let firstNestedLine = -1;
    lines.forEach((line, i) => {
      const loopMatch = /\b(for|while|forEach|map|filter|reduce)\b/.test(line);
      if (loopMatch) {
        nestedLoopDepth++;
        if (nestedLoopDepth === 2 && firstNestedLine === -1) {
          firstNestedLine = i + 1;
        }
      }
      if (line.includes('}')) {
        nestedLoopDepth = Math.max(0, nestedLoopDepth - 1);
      }
    });
    if (firstNestedLine > -1) {
      issues.push({
        id: 'pi-nested',
        title: 'Nested Loop Detected (O(n²) Complexity)',
        description:
          'Nested loops over the same or related collections result in quadratic time complexity, which degrades severely with large datasets.',
        impact: 'high',
        lineNumber: firstNestedLine,
        suggestion:
          'Use a Map or Set for O(1) lookups instead of inner loops. For example: const set = new Set(arr.map(x => x.id)); then check with set.has(id).',
      });
      findings.push({
        category: 'performance',
        severity: 'medium',
        title: issues[issues.length - 1].title,
        description: issues[issues.length - 1].description,
        filePath: path,
        lineHint: firstNestedLine,
        suggestedFix: issues[issues.length - 1].suggestion,
      });
    }

    const syncFilePatterns = [/readFileSync\s*\(/i, /writeFileSync\s*\(/i, /execSync\s*\(/i];
    lines.forEach((line, i) => {
      if (syncFilePatterns.some((p) => p.test(line))) {
        issues.push({
          id: `pi-sync-${i}`,
          title: 'Synchronous Blocking I/O',
          description:
            'Synchronous file operations block the event loop, freezing all other requests until the operation completes.',
          impact: 'high',
          lineNumber: i + 1,
          suggestion: 'Replace with async fs.promises or non-blocking APIs.',
        });
        findings.push({
          category: 'performance',
          severity: 'high',
          title: issues[issues.length - 1].title,
          description: issues[issues.length - 1].description,
          filePath: path,
          lineHint: i + 1,
          suggestedFix: issues[issues.length - 1].suggestion,
        });
      }
    });

    return {
      slice: { agentId: 'performance', name: 'Performance Agent', findings },
      issues,
    };
  }

  private runArchitectureAgent(
    lines: string[],
    filename: string,
  ): { slice: AgentRunSlice; issues: LegacyArchitectureIssue[] } {
    const issues: LegacyArchitectureIssue[] = [];
    const findings: AnalysisFinding[] = [];
    const path = filename;

    const functionMatches: number[] = [];
    let inFunction = false;
    let functionStart = 0;
    let braceDepth = 0;
    lines.forEach((line, i) => {
      if (/function\s+\w+|=>\s*\{|\basync\s+\(/.test(line)) {
        if (!inFunction) {
          inFunction = true;
          functionStart = i + 1;
          braceDepth = 0;
        }
      }
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;
      if (inFunction && braceDepth <= 0 && i > functionStart) {
        const len = i - functionStart;
        if (len > 50) {
          functionMatches.push(functionStart);
        }
        inFunction = false;
      }
    });
    if (functionMatches.length > 0) {
      issues.push({
        id: 'arch-god-fn',
        principle: 'Single Responsibility',
        title: 'Large Function / God Function Detected',
        description: `A function starting around line ${functionMatches[0]} spans over 50 lines. Large functions are difficult to test, maintain, and understand.`,
        recommendation:
          'Break the function into smaller, focused functions. Each function should do one thing. Aim for functions under 20-30 lines.',
      });
      findings.push({
        category: 'architecture',
        severity: 'medium',
        title: issues[issues.length - 1].title,
        description: issues[issues.length - 1].description,
        filePath: path,
        lineHint: functionMatches[0],
        suggestedFix: issues[issues.length - 1].recommendation,
      });
    }

    return {
      slice: { agentId: 'architecture', name: 'Architecture Agent', findings },
      issues,
    };
  }

  private runLogicAgent(
    lines: string[],
    code: string,
    filename: string,
  ): { slice: AgentRunSlice; bugs: LegacyScanBug[] } {
    const bugs: LegacyScanBug[] = [];
    const findings: AnalysisFinding[] = [];
    const path = filename;
    const now = new Date().toISOString();

    const asyncWithoutTryCatch =
      lines.some((l) => /await\s+/.test(l)) && !lines.some((l) => /try\s*\{/.test(l));
    if (asyncWithoutTryCatch) {
      bugs.push({
        id: 'bug-no-try-catch',
        pullRequestId: 'scan',
        title: 'Unhandled Promise Rejections',
        description:
          'Async operations using await are not wrapped in try/catch blocks. Any network errors, DB failures, or rejected promises will cause unhandled exceptions.',
        severity: 'high',
        category: 'logic',
        lineNumber: null,
        codeSnippet: null,
        suggestedFix:
          'Wrap async operations in try/catch:\ntry {\n  const result = await asyncOperation();\n} catch (error) {\n  logger.error(error);\n  throw error;\n}',
        resolved: false,
        createdAt: now,
      });
      findings.push({
        category: 'logic',
        severity: 'high',
        title: bugs[bugs.length - 1].title,
        description: bugs[bugs.length - 1].description,
        filePath: path,
        suggestedFix: bugs[bugs.length - 1].suggestedFix,
      });
    }

    const dangerousAccessPattern = /\.\w+\.\w+(?!\s*\?)/;
    lines.forEach((line, i) => {
      if (
        dangerousAccessPattern.test(line) &&
        !line.trim().startsWith('//') &&
        !line.includes('?.')
      ) {
        if (!bugs.some((b) => b.id.startsWith('bug-null'))) {
          bugs.push({
            id: `bug-null-${i}`,
            pullRequestId: 'scan',
            title: 'Potential Null Reference Error',
            description:
              'Chained property access detected without optional chaining. If any intermediate value is null or undefined, this will throw a TypeError at runtime.',
            severity: 'medium',
            category: 'logic',
            lineNumber: i + 1,
            codeSnippet: line.trim(),
            suggestedFix:
              'Use optional chaining: obj?.property?.nested ?? defaultValue',
            resolved: false,
            createdAt: now,
          });
          findings.push({
            category: 'logic',
            severity: 'medium',
            title: bugs[bugs.length - 1].title,
            description: bugs[bugs.length - 1].description,
            filePath: path,
            lineHint: i + 1,
            suggestedFix: bugs[bugs.length - 1].suggestedFix,
          });
        }
      }
    });

    return {
      slice: { agentId: 'logic', name: 'Logic / Bugs Agent', findings },
      bugs,
    };
  }

  private runEdgeCaseAgent(
    code: string,
    filename: string,
  ): { slice: AgentRunSlice; cases: LegacyEdgeCase[] } {
    const cases: LegacyEdgeCase[] = [];
    const findings: AnalysisFinding[] = [];
    if (code.includes('function') || code.includes('=>')) {
      cases.push(
        {
          id: 'ec-empty',
          functionName: 'detected functions',
          scenario: 'Empty or null input',
          testCode:
            'it("handles null input", () => { expect(() => fn(null)).not.toThrow(); });',
          priority: 'high',
        },
        {
          id: 'ec-empty-arr',
          functionName: 'detected functions',
          scenario: 'Empty array/object input',
          testCode: 'it("handles empty array", () => { expect(fn([])).toBeDefined(); });',
          priority: 'high',
        },
        {
          id: 'ec-boundary',
          functionName: 'numeric operations',
          scenario: 'Integer boundary values (0, -1, MAX_SAFE_INTEGER)',
          testCode:
            'it("handles boundary numbers", () => { expect(fn(0)).toBeDefined(); expect(fn(-1)).toBeDefined(); });',
          priority: 'medium',
        },
        {
          id: 'ec-concurrent',
          functionName: 'async operations',
          scenario: 'Concurrent calls / race conditions',
          testCode:
            'it("handles concurrent calls", async () => { const results = await Promise.all([fn(), fn(), fn()]); expect(results).toHaveLength(3); });',
          priority: 'medium',
        },
      );
      cases.forEach((c) => {
        findings.push({
          category: 'testing',
          severity: c.priority === 'high' ? 'medium' : 'low',
          title: `Edge case: ${c.scenario}`,
          description: `Suggested test for ${c.functionName} in ${filename}.`,
          suggestedFix: c.testCode,
        });
      });
    }

    return {
      slice: { agentId: 'edge-cases', name: 'Edge Case Agent', findings },
      cases,
    };
  }

  private runStyleAgent(
    lines: string[],
    code: string,
    filename: string,
  ): { slice: AgentRunSlice; suggestions: LegacySuggestion[] } {
    const suggestions: LegacySuggestion[] = [];
    const findings: AnalysisFinding[] = [];
    const path = filename;

    if (code.includes('var ')) {
      suggestions.push({
        id: 'sg-var',
        title: 'Replace var with const/let',
        description:
          "var has function scope and hoisting behavior that can lead to bugs. Use const for values that won't be reassigned, let for those that will.",
        originalCode: 'var x = 1;',
        suggestedCode: 'const x = 1; // or let x = 1 if reassignment needed',
        type: 'style',
      });
      findings.push({
        category: 'style',
        severity: 'low',
        title: suggestions[suggestions.length - 1].title,
        description: suggestions[suggestions.length - 1].description,
        filePath: path,
        suggestedFix: suggestions[suggestions.length - 1].suggestedCode ?? undefined,
      });
    }
    if (lines.some((l) => /console\.log/.test(l))) {
      suggestions.push({
        id: 'sg-console',
        title: 'Remove console.log statements',
        description:
          'console.log statements left in production code leak debugging information and may expose sensitive data.',
        originalCode: 'console.log(data);',
        suggestedCode:
          "// Remove or replace with structured logging:\nlogger.debug({ data }, 'debug info');",
        type: 'style',
      });
      findings.push({
        category: 'style',
        severity: 'low',
        title: suggestions[suggestions.length - 1].title,
        description: suggestions[suggestions.length - 1].description,
        filePath: path,
        suggestedFix: suggestions[suggestions.length - 1].suggestedCode ?? undefined,
      });
    }
    if (!code.includes('try') && code.length > 200) {
      suggestions.push({
        id: 'sg-error-handling',
        title: 'Add comprehensive error handling',
        description:
          'No error handling detected. Production code should gracefully handle unexpected failures.',
        originalCode: null,
        suggestedCode:
          "try {\n  // your code\n} catch (error) {\n  console.error('Operation failed:', error);\n  throw error;\n}",
        type: 'refactor',
      });
      findings.push({
        category: 'style',
        severity: 'low',
        title: suggestions[suggestions.length - 1].title,
        description: suggestions[suggestions.length - 1].description,
        filePath: path,
        suggestedFix: suggestions[suggestions.length - 1].suggestedCode ?? undefined,
      });
    }

    return {
      slice: { agentId: 'style', name: 'Style / Refactor Agent', findings },
      suggestions,
    };
  }

  private runRequirementsAgent(
    code: string,
    requirements?: string,
  ): { slice: AgentRunSlice; checks: LegacyRequirementCheck[] } {
    const checks: LegacyRequirementCheck[] = [];
    const findings: AnalysisFinding[] = [];

    if (!requirements?.trim()) {
      return {
        slice: { agentId: 'requirements', name: 'Requirements Agent', findings: [] },
        checks: [],
      };
    }

    const reqLines = requirements.split('\n').filter((l) => l.trim());
    reqLines.forEach((req, i) => {
      const reqLower = req.toLowerCase();
      let status: 'pass' | 'fail' | 'warning' = 'warning';
      let notes =
        'Could not automatically verify this requirement from static analysis.';

      if (
        (reqLower.includes('auth') || reqLower.includes('login')) &&
        (code.includes('jwt') || code.includes('token') || code.includes('session'))
      ) {
        status = 'pass';
        notes = 'Authentication-related code detected in the implementation.';
      } else if (
        (reqLower.includes('auth') || reqLower.includes('login')) &&
        !code.includes('jwt') &&
        !code.includes('token')
      ) {
        status = 'fail';
        notes =
          'Requirement mentions authentication but no auth tokens/session code was found.';
      } else if (
        reqLower.includes('validation') &&
        (code.includes('validate') || code.includes('zod') || code.includes('joi') || code.includes('schema'))
      ) {
        status = 'pass';
        notes = 'Input validation code detected.';
      } else if (reqLower.includes('validation') && !code.includes('valid')) {
        status = 'fail';
        notes = 'Requirement mentions validation but no validation logic was found.';
      } else if (
        reqLower.includes('error') &&
        (code.includes('try') || code.includes('catch'))
      ) {
        status = 'pass';
        notes = 'Error handling code detected.';
      } else if (reqLower.includes('error') && !code.includes('try')) {
        status = 'fail';
        notes = 'Requirement mentions error handling but no try/catch blocks found.';
      } else if (
        reqLower.includes('log') &&
        (code.includes('console.log') || code.includes('logger') || code.includes('log('))
      ) {
        status = 'pass';
        notes = 'Logging code detected.';
      } else if (
        reqLower.includes('test') &&
        (code.includes('it(') || code.includes('test(') || code.includes('describe('))
      ) {
        status = 'pass';
        notes = 'Test code detected.';
      } else if (reqLower.includes('async') && code.includes('async')) {
        status = 'pass';
        notes = 'Async implementation found.';
      } else if (reqLower.includes('database') || reqLower.includes('db')) {
        if (
          code.includes('db.') ||
          code.includes('query') ||
          code.includes('SELECT') ||
          code.includes('INSERT')
        ) {
          status = 'pass';
          notes = 'Database operations detected.';
        } else {
          status = 'fail';
          notes = 'Requirement mentions database but no DB operations found.';
        }
      }

      checks.push({
        id: `req-${i}`,
        requirement: req.trim(),
        status,
        notes,
      });

      if (status === 'fail') {
        findings.push({
          category: 'business_rule',
          severity: 'high',
          title: `Requirement gap: ${req.trim().slice(0, 80)}`,
          description: notes,
        });
      } else if (status === 'warning') {
        findings.push({
          category: 'business_rule',
          severity: 'low',
          title: `Requirement unclear: ${req.trim().slice(0, 80)}`,
          description: notes,
        });
      }
    });

    return {
      slice: { agentId: 'requirements', name: 'Requirements Agent', findings },
      checks,
    };
  }
}
