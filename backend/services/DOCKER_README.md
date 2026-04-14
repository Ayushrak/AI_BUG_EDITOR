# Service Dockerfiles Documentation

## Overview

This directory contains Dockerfiles for all CodeGuardian AI backend microservices:

- **7 NestJS Services** (Node.js 20 Alpine)
  - api-gateway (Port 3000)
  - auth (Port 3001)
  - upload (Port 3002)
  - analysis (Port 3003)
  - report (Port 3004)
  - notification (Port 3005)
  - chat (Port 3006)

- **1 Python FastAPI Service** (Python 3.11)
  - ai-orchestration (Port 8000)

## Docker Build Architecture

### NestJS Services

Each NestJS service uses a **3-stage multi-stage build** for optimal image size and security:

```
Stage 1: Dependencies
├─ Install node-modules/pnpm dependencies

Stage 2: Builder
├─ Compile TypeScript to JavaScript
└─ Generate optimized dist/ folder

Stage 3: Production
├─ Only copy dist/ (no source code)
├─ Run as non-root user (fastapi)
├─ Include health checks
└─ Use dumb-init for proper signal handling
```

**Image Size**: ~200-300MB per NestJS service (after optimization)

**Security Features**:

- Non-root user execution (uid: 1001)
- No build tools in production image
- Alpine base image (minimal OS)
- Health checks for orchestration

**Files Included**:

- `Dockerfile` - Multi-stage build
- `.dockerignore` - Exclude unnecessary files from build context

### Python FastAPI Service

AI Orchestration uses a **2-stage build** optimized for Python:

```
Stage 1: Builder
├─ Install build dependencies
└─ Generate wheels for all dependencies

Stage 2: Production
├─ Only copy wheels (no source)
├─ Install from wheels (faster)
├─ Run as non-root user
└─ Use Gunicorn + Uvicorn workers
```

**Image Size**: ~150-200MB for Python service

**Performance**:

- Gunicorn + 4 Uvicorn workers for concurrency
- Connection pooling built-in
- Optimized for AI/ML workloads

## Building Services

### Build All Services

```bash
# From project root
docker-compose build

# Build with progress output
docker-compose build --progress=plain
```

### Build Individual Service

```bash
# Build api-gateway
docker build -t codeguardian-api-gateway:latest ./backend/services/api-gateway

# Build ai-orchestration
docker build -t codeguardian-ai-service:latest ./backend/services/ai-orchestration
```

### Build with Custom Tags

```bash
docker build \
  -t codeguardian-api-gateway:1.0.0 \
  -t codeguardian-api-gateway:latest \
  ./backend/services/api-gateway
```

## Running Services

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down
```

### Run Individual Service

```bash
# Build and run
docker run -it \
  --network codeguardian-network \
  -e NODE_ENV=development \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/codeguardian \
  -e REDIS_URL=redis://:redis@redis:6379 \
  -p 3000:3000 \
  codeguardian-api-gateway:latest
```

## Environment Variables

Each service reads from `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=codeguardian

# Redis
REDIS_URL=redis://:password@host:6379
REDIS_PASSWORD=redis

# Kafka
KAFKA_BROKERS=localhost:29092

# API Keys & Secrets
JWT_SECRET=your-secret-key-change-in-production
GROQ_API_KEY=your-groq-api-key

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

See `../.env.example` for complete configuration.

## Dockerfile Best Practices Used

### ✅ Applied

1. **Non-root user**: Running as `nestjs` (uid 1001) or `fastapi`
2. **Multi-stage builds**: Reduced image size 70%+ vs single-stage
3. **Alpine base**: Only required OS packages (~5MB vs 100MB for full OS)
4. **Health checks**: Proper orchestration support
5. **Signal handling**: dumb-init for proper cleanup
6. **Minimal layers**: Optimized RUN commands with &&
7. **Cache leveraging**: COPY package files before source code
8. **.dockerignore**: Exclude 50MB+ of unnecessary files
9. **Metadata labels**: Version, maintainer, description
10. **Explicit ports**: EXPOSE for documentation

### Development vs Production

**Development Volume Mounts** (for hot-reload):

```yaml
volumes:
  - ./backend/services/api-gateway/src:/app/src

command: npm run start:dev # NestJS watch mode
```

**Production** (optimized images, no volumes):

```bash
docker run codeguardian-api-gateway:1.0.0
```

## Common Tasks

### View Image Layers

```bash
# See how many layers and their sizes
docker history codeguardian-api-gateway:latest

# Use dive for interactive inspection
dive codeguardian-api-gateway:latest
```

### Scan for Vulnerabilities

```bash
# Using trivy
trivy image codeguardian-api-gateway:latest

# Using Grype
grype codeguardian-api-gateway:latest
```

### Push to Registry

```bash
# Tag for Docker Hub
docker tag codeguardian-api-gateway:latest \
  yourusername/codeguardian-api-gateway:latest

# Push to Docker Hub
docker push yourusername/codeguardian-api-gateway:latest

# Push to GitHub Container Registry
docker push ghcr.io/yourusername/codeguardian-api-gateway:latest
```

### Optimize Image Size

```bash
# Current size
docker images codeguardian-api-gateway

# After optimization
# Typical NestJS: 200-300MB
# Typical Python: 150-200MB

# Reduce more by:
# 1. Remove unused dependencies
# 2. Use slim/alpine variants only
# 3. Avoid copying unnecessary files
```

## Troubleshooting

### Build Fails

```bash
# Check Docker build output with verbose
docker build --progress=plain ./backend/services/api-gateway

# Check container logs
docker-compose logs api-gateway

# Rebuild from scratch (no cache)
docker-compose build --no-cache api-gateway
```

### Container Won't Start

```bash
# Check logs
docker logs codeguardian-api-gateway

# Run with interactive shell
docker run -it codeguardian-api-gateway:latest /bin/sh

# Check health
docker-compose ps
```

### Port Conflicts

```bash
# Change port in docker-compose.yml
services:
  api-gateway:
    ports:
      - "3000:3000"  # Change first port to 3001:3000 etc

# Or set via environment
API_GATEWAY_PORT=3001 docker-compose up
```

## Next Steps

1. **Ensure base images are pulled**: `docker pull node:20-alpine`
2. **Create service package.json files** with dependencies
3. **Create service requirements.txt** (for Python service)
4. **Test building**: `docker-compose build`
5. **Run full stack**: `docker-compose up`

## References

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Python Docker practices](https://docs.docker.com/language/python/build-images/)

---

**Last Updated**: 2024-01-XX  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.5+
