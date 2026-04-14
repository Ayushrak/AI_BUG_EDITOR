# CodeGuardian AI - Project Restructuring Guide

This guide shows how to restructure your Replit Asset-Manager codebase into the production-ready CodeGuardian AI platform.

---

## Current State Analysis

Your current structure:

```
Asset-Manager/
├── artifacts/ (Vite apps)
├── lib/ (API utilities)
├── scripts/
frontend/
backend/ (NestJS started)
```

**Issues**:

- ❌ Frontend and backend not integrated properly
- ❌ No microservices separation
- ❌ No AI layer implemented
- ❌ Missing database schema
- ❌ Deployment not configured

---

## Target Structure (Production Ready)

```
codeguardian-ai/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── security-scan.yml
│
├── frontend/                          # Next.js 14 + React 19
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── upload/page.tsx
│   │   │   │   ├── results/[scanId]/page.tsx
│   │   │   │   ├── chat/page.tsx
│   │   │   │   └── analytics/page.tsx
│   │   ├── components/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── code-editor.tsx
│   │   │   ├── issue-card.tsx
│   │   │   ├── score-display.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCodeScans.ts
│   │   │   │   ├── useUpload.ts
│   │   │   │   └── useChat.ts
│   │   │   └── query-client.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json (updated)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                           # Microservices Architecture
│   ├── services/
│   │   ├── api-gateway/              # Kong or NestJS
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   ├── logging.middleware.ts
│   │   │   │   │   └── error.middleware.ts
│   │   │   │   └── controllers/
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── auth/                     # Auth Service
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── github.strategy.ts
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── guards/
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── upload/                  # Upload Service
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── upload.controller.ts
│   │   │   │   ├── upload.service.ts
│   │   │   │   ├── validators/
│   │   │   │   └── storage/
│   │   │   │       ├── s3.provider.ts
│   │   │   │       └── minio.provider.ts
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── analysis/                # Analysis Service
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── analysis.controller.ts
│   │   │   │   ├── analysis.service.ts
│   │   │   │   ├── parsers/
│   │   │   │   │   ├── js-parser.ts
│   │   │   │   │   ├── python-parser.ts
│   │   │   │   │   ├── java-parser.ts
│   │   │   │   │   └── csharp-parser.ts
│   │   │   │   └── kafka/
│   │   │   │       └── producer.ts
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── ai-orchestration/        # Python FastAPI
│   │   │   ├── src/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── security_agent.py
│   │   │   │   │   ├── performance_agent.py
│   │   │   │   │   ├── logic_agent.py
│   │   │   │   │   ├── architecture_agent.py
│   │   │   │   │   └── testing_agent.py
│   │   │   │   ├── workflows/
│   │   │   │   │   ├── code_review_workflow.py
│   │   │   │   │   └── state.py
│   │   │   │   ├── tools/
│   │   │   │   │   ├── code_parser.py
│   │   │   │   │   ├── semgrep_runner.py
│   │   │   │   │   ├── codeql_runner.py
│   │   │   │   │   └── ast_analyzer.py
│   │   │   │   └── main.py
│   │   │   ├── requirements.txt
│   │   │   ├── Dockerfile
│   │   │   └── docker-compose.yml
│   │   │
│   │   ├── report/                  # Report Generation Service
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── report.controller.ts
│   │   │   │   ├── report.service.ts
│   │   │   │   ├── generators/
│   │   │   │   │   ├── pdf.generator.ts
│   │   │   │   │   └── json.generator.ts
│   │   │   │   └── templates/
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   ├── notification/            # Notification Service
│   │   │   ├── src/
│   │   │   │   ├── app.module.ts
│   │   │   │   ├── main.ts
│   │   │   │   ├── notification.controller.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── channels/
│   │   │   │   │   ├── github.provider.ts
│   │   │   │   │   ├── slack.provider.ts
│   │   │   │   │   ├── email.provider.ts
│   │   │   │   │   └── webhook.provider.ts
│   │   │   │   └── kafka/
│   │   │   │       └── consumer.ts
│   │   │   ├── package.json
│   │   │   └── Dockerfile
│   │   │
│   │   └── chat/                    # AI Chat Service
│   │       ├── src/
│   │       │   ├── app.module.ts
│   │       │   ├── main.ts
│   │       │   ├── chat.controller.ts
│   │       │   ├── chat.service.ts
│   │       │   ├── rag/
│   │       │   │   ├── embeddings.service.ts
│   │       │   │   └── retriever.service.ts
│   │       │   └── llm/
│   │       │       └── groq.provider.ts
│   │       ├── package.json
│   │       └── Dockerfile
│   │
│   ├── shared/                       # Shared utilities
│   │   ├── types.ts
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   └── utils/
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── docker-compose.yml            # Local dev stack
│   ├── .env.example
│   └── package.json (monorepo root)
│
├── docs/
│   ├── SYSTEM_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── UI_DESIGN.md
│   ├── AI_AGENTS_DESIGN.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   └── CONTRIBUTING.md
│
├── docker-compose.yml               # Production-like stack
├── Dockerfile (for build)
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## Migration Steps (Week 1)

### Step 1: Create New Directory Structure

```bash
# Create new project root
mkdir -p codeguardian-ai-prod

# Create all service directories
mkdir -p backend/services/{api-gateway,auth,upload,analysis,ai-orchestration,report,notification,chat}
mkdir -p backend/database/migrations
mkdir -p backend/shared
mkdir -p frontend/{public,src/{app,components,lib,styles}}
mkdir -p docs
```

### Step 2: Move & Reorganize Frontend

**From**: `e:\New_Project\AI_BASED_BUG_DETECTAOR\frontend`  
**To**: `codeguardian-ai/frontend`

```bash
# Update package.json with new dependencies
# Keep Next.js, add shadcn/ui, Aceternity UI
```

**New Frontend package.json**:

```json
{
  "name": "codeguardian-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.2.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.35.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "monaco-editor": "^0.50.0",
    "@monaco-editor/react": "^4.6.0",
    "framer-motion": "^10.16.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "recharts": "^2.13.0",
    "react-flow-renderer": "^11.10.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^16.2.2"
  }
}
```

### Step 3: Reorganize Backend

**Current**: `backend/` (basic NestJS)  
**New**: `backend/services/*` (microservices)

```bash
# Move existing backend to api-gateway service
mv backend/src backend/services/api-gateway/src

# Update api-gateway package.json
# Keep NestJS, add Kafka, JWT, Passport
```

### Step 4: Create Microservices

**Create each service with same NestJS structure**:

```bash
# For each service (auth, upload, analysis, report, notification, chat)
mkdir -p backend/services/{service-name}/{src,test}

# Create service package.json
# Create service main.ts
# Create service app.module.ts
```

### Step 5: Create Shared Library

```bash
# backend/shared/package.json
{
  "name": "@codeguardian/shared",
  "version": "1.0.0",
  "main": "index.ts"
}

# backend/shared/types.ts - Common types
# backend/shared/decorators/ - Custom decorators
# backend/shared/guards/ - Auth guards
```

### Step 6: Database Schema

```bash
mkdir backend/database
touch backend/database/schema.sql
touch backend/database/init.sql
mkdir backend/database/migrations
```

### Step 7: Docker Compose

```yaml
# backend/docker-compose.yml
version: "3.8"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: codeguardian
      POSTGRES_PASSWORD: password
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports:
      - "9092:9092"
    # ... configuration

  # Services will be added
```

---

## Integration Points

### Frontend → Backend Communication

```typescript
// frontend/lib/api.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### API Gateway Routing

```typescript
// backend/services/api-gateway/src/app.module.ts
import { Module } from "@nestjs/common";
import { ProxyModule } from "@nestjs/microservices";

@Module({
  imports: [
    ProxyModule.register([
      { name: "AUTH_SERVICE", transport: TransportStrategy.TCP },
      { name: "UPLOAD_SERVICE", transport: TransportStrategy.TCP },
      { name: "ANALYSIS_SERVICE", transport: TransportStrategy.TCP },
    ]),
  ],
})
export class AppModule {}
```

---

## Configuration Files

### .env.example

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Auth
AUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/codeguardian

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=codeguardian

# AI/LLM
GROQ_API_KEY=xxx
OLLAMA_BASE_URL=http://localhost:11434

# File Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET=codeguardian-scans

# Notifications
SLACK_WEBHOOK_URL=xxx
GITHUB_TOKEN=xxx

# Logging
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

---

## Testing Strategy

### Frontend Tests

```typescript
// frontend/__tests__/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '@/components/button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Tests

```typescript
// backend/services/auth/__tests__/auth.service.spec.ts
describe("AuthService", () => {
  it("should generate valid JWT", () => {
    const token = authService.generateToken({ userId: "123" });
    expect(token).toBeDefined();
  });
});
```

### AI Agent Tests

```python
# backend/services/ai-orchestration/__tests__/test_workflow.py
def test_security_agent():
    code = "query = 'SELECT * FROM users'"
    findings = security_agent.analyze(code)
    assert len(findings) > 0
    assert 'SQL' in findings[0]['title']
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
      redis:
        image: redis:7

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
```

---

## Deployment Checklist

- [ ] All services have Dockerfiles
- [ ] docker-compose works locally (`docker-compose up`)
- [ ] Environment variables documented
- [ ] Database schema created and tested
- [ ] Authentication flow works end-to-end
- [ ] Frontend can upload code successfully
- [ ] Backend receives and processes upload
- [ ] Results visible on frontend
- [ ] Monitoring configured
- [ ] Backup strategy documented

---

## Migration Timeline

| Task                       | Duration    | Owner         |
| -------------------------- | ----------- | ------------- |
| Create dir structure       | 0.5 days    | DevOps        |
| Move + reorganize frontend | 1 day       | Frontend Lead |
| Create microservices       | 2 days      | Backend Lead  |
| Setup database             | 1 day       | Backend Lead  |
| Docker compose             | 1 day       | DevOps        |
| Integration testing        | 2 days      | QA            |
| Documentation              | 1 day       | Tech Lead     |
| **Total**                  | **~8 days** |               |

---

## Success Criteria

✅ All services start with `docker-compose up`  
✅ Frontend loads without errors  
✅ User can login via OAuth2  
✅ Upload endpoint works  
✅ Analysis begins on upload  
✅ Results display on frontend  
✅ No console errors in browser  
✅ No service crashes in logs

This restructuring sets you up for production-grade development!
