/**
 * Product context from CodeGuardian AI workspace (Asset-Manager monorepo / replit.md).
 * Injected into LLM system prompts so reviews match the intended SaaS surface area.
 */
export const CODEGUARDIAN_DOMAIN_CONTEXT = `
Product: CodeGuardian AI — AI-powered code review and bug detection before merge.
Workspace capabilities to keep in mind:
- Pull request pipeline: risk scores, multi-tab reviews (Overview, Bugs, Security, Performance, Architecture, Edge Cases, AI Chat).
- Direct code scanner: Monaco editor, uploads, language selection, business requirements checks (pass/fail/warning per line item).
- Static multi-agent themes: Security (injection, XSS, secrets), Performance (nested loops, blocking I/O), Architecture (SRP / god functions),
  Logic bugs (async error handling, null-safe access), Edge-case test ideas, Style/refactor nudges, Requirements alignment.
`.trim();
