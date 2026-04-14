# Deployment & Operations Guide

Comprehensive guide for deploying and operating the AI Orchestration Service in production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Production Configuration](#production-configuration)
6. [Monitoring & Observability](#monitoring--observability)
7. [Scaling & Performance](#scaling--performance)
8. [Disaster Recovery](#disaster-recovery)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to any environment:

- [ ] All tests pass (`pytest`)
- [ ] Code formatted and linted
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables documented
- [ ] Security scan passed (`safety check`)
- [ ] Docker image builds successfully
- [ ] Database migrations run
- [ ] API documentation updated
- [ ] Monitoring configured
- [ ] Alerting rules set up
- [ ] Rollback plan documented
- [ ] Load tested (production only)

---

## Local Deployment

### Development

```bash
cd backend/services/ai-orchestration

# Install dependencies
pip install -r requirements.txt

# Set environment
export GROQ_API_KEY="your-key"
export DEBUG=true

# Run
python main.py

# Access
open http://localhost:8000/docs
```

### Docker Compose (Development)

```bash
# From workspace root
docker-compose up ai-orchestration redis postgres

# Check health
curl http://localhost:8000/health

# View logs
docker-compose logs -f ai-orchestration
```

---

## Docker Deployment

### Build Image

```bash
# Build locally
docker build -t ai-orchestration:latest .

# Build with specific tag
docker build -t ai-orchestration:v1.0.0 .

# Build for production (multi-stage)
docker build \
  --target production \
  -t ai-orchestration:v1.0.0-prod .
```

### Docker Compose Production

```yaml
services:
  ai-orchestration:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: ai-orchestration:v1.0.0
    ports:
      - "8000:8000"
    environment:
      ENVIRONMENT: production
      GROQ_API_KEY: ${GROQ_API_KEY}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      DATABASE_URL: postgresql://user:pass@postgres:5432/codeguardian
      LOG_LEVEL: INFO
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    resources:
      limits:
        cpus: "2"
        memory: 4G
      reservations:
        cpus: "1"
        memory: 2G

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: codeguardian
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: codeguardian
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

---

## Cloud Deployment

### Azure Container Instances (ACI)

```bash
# Create resource group
az group create --name codeguardian --location eastus

# Create container registry
az acr create --resource-group codeguardian \
  --name codeguardianreg --sku Basic

# Login to registry
az acr login --name codeguardianreg

# Build and push image
az acr build --registry codeguardianreg \
  --image ai-orchestration:latest .

# Create container instance
az container create \
  --resource-group codeguardian \
  --name ai-orchestration \
  --image codeguardianreg.azurecr.io/ai-orchestration:latest \
  --registry-login-server codeguardianreg.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --environment-variables \
    GROQ_API_KEY=$GROQ_API_KEY \
    REDIS_URL=redis://<redis-host>:6379 \
  --ports 8000 \
  --cpu 2 \
  --memory 4
```

### Azure Container Apps

```bash
# Create container app environment
az containerapp env create \
  --name codeguardian-env \
  --resource-group codeguardian \
  --location eastus

# Create container app
az containerapp create \
  --name ai-orchestration \
  --resource-group codeguardian \
  --environment codeguardian-env \
  --image codeguardianreg.azurecr.io/ai-orchestration:latest \
  --target-port 8000 \
  --ingress external \
  --registry-server codeguardianreg.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --env-vars \
    GROQ_API_KEY=secretref:groq-key \
    REDIS_URL=secretref:redis-url \
  --min-replicas 2 \
  --max-replicas 10 \
  --cpu 2 \
  --memory 4Gi
```

### Kubernetes Deployment

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: codeguardian

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ai-orchestration-config
  namespace: codeguardian
data:
  LOG_LEVEL: INFO
  ENVIRONMENT: production
  GROQ_MODEL: mixtral-8x7b-32768

---
apiVersion: v1
kind: Secret
metadata:
  name: ai-orchestration-secrets
  namespace: codeguardian
type: Opaque
stringData:
  GROQ_API_KEY: <your-key>
  REDIS_URL: redis://:password@redis:6379
  DATABASE_URL: postgresql://user:pass@postgres:5432/db

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-orchestration
  namespace: codeguardian
  labels:
    app: ai-orchestration
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ai-orchestration
  template:
    metadata:
      labels:
        app: ai-orchestration
    spec:
      containers:
        - name: ai-orchestration
          image: codeguardianreg.azurecr.io/ai-orchestration:v1.0.0
          imagePullPolicy: Always
          ports:
            - containerPort: 8000
              name: http
          envFrom:
            - configMapRef:
                name: ai-orchestration-config
            - secretRef:
                name: ai-orchestration-secrets
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 2
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - ai-orchestration
                topologyKey: kubernetes.io/hostname

---
apiVersion: v1
kind: Service
metadata:
  name: ai-orchestration
  namespace: codeguardian
spec:
  type: ClusterIP
  selector:
    app: ai-orchestration
  ports:
    - port: 80
      targetPort: http
      protocol: TCP
      name: http

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ai-orchestration-hpa
  namespace: codeguardian
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ai-orchestration
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## Production Configuration

### Environment Variables

```bash
# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4
WORKER_CLASS=uvicorn.workers.UvicornWorker
WORKER_TIMEOUT=120

# Groq API
GROQ_API_KEY=<production-key>
GROQ_MODEL=mixtral-8x7b-32768
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=2048
GROQ_REQUEST_TIMEOUT=30

# Redis
REDIS_URL=redis://:password@redis.prod.internal:6379/0
REDIS_POOL_SIZE=20
REDIS_SOCKET_KEEPALIVE=true

# Database
DATABASE_URL=postgresql://user:pass@postgres.prod.internal:5432/codeguardian
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=3600

# Features
ENABLE_CACHING=true
ENABLE_REDIS_SNAPSHOTS=true
CACHE_TTL=3600
MAX_WORKFLOW_TOKENS=10000

# Security
CORS_ORIGINS=https://codeguardian.prod
API_RATE_LIMIT=30/minute
API_MAX_REQUEST_SIZE=50000

# Monitoring
ENABLE_PROMETHEUS=true
ENABLE_JAEGER_TRACING=true
JAEGER_AGENT_HOST=jaeger.prod.internal
JAEGER_AGENT_PORT=6831

# Logging
SENTRY_DSN=<sentry-url>
LOG_OUTPUT=json

# Timezone
TZ=UTC
```

### SSL/TLS

```nginx
# nginx reverse proxy
upstream ai_orchestration {
    server localhost:8000;
}

server {
    listen 443 ssl http2;
    server_name api.codeguardian.prod;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://ai_orchestration;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## Monitoring & Observability

### Health Checks

```bash
# Basic health
curl http://localhost:8000/health

# Detailed metrics
curl http://localhost:8000/metrics

# Deep health check
curl http://localhost:8000/health/deep
```

### Prometheus Metrics

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "ai-orchestration"
    static_configs:
      - targets: ["localhost:8000"]
    metrics_path: "/metrics"
```

### Logging

```python
# Configure structured logging
import json
import logging

logging.basicConfig(
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%SZ'
)
```

### Tracing

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter

jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger.prod",
    agent_port=6831,
)
trace.get_tracer_provider().add_span_processor(
    trace.SimpleSpanProcessor(jaeger_exporter)
)
```

---

## Scaling & Performance

### Horizontal Scaling

```bash
# Auto-scaling with Kubernetes
kubectl autoscale deployment ai-orchestration \
  --min=2 --max=10 --cpu-percent=70

# Monitor scaling
kubectl get hpa ai-orchestration-hpa -w
```

### Performance Tuning

**Connection Pooling:**

```python
# In settings
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
REDIS_POOL_SIZE=20
```

**Worker Configuration:**

```bash
# Production (4 workers for 2 CPUs)
gunicorn \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --worker-connections 1000 \
  --timeout 120 \
  app.main:app
```

**Caching Strategy:**

- Cache analysis results by scan_id (1 hour TTL)
- Cache model list (24 hours TTL)
- Implement Redis Cluster for high availability

---

## Disaster Recovery

### Backup Strategy

```bash
# Database backups (daily)
pg_dump postgresql://user:pass@localhost/codeguardian \
  > backup-$(date +%Y%m%d).sql

# Automated backup with cron
0 2 * * * pg_dump postgresql://user:pass@host/db | gzip > backups/$(date +%Y%m%d).sql.gz

# S3 backup
aws s3 cp backups/$(date +%Y%m%d).sql.gz s3://codeguardian-backups/
```

### Restore Procedure

```bash
# From SQL backup
psql postgresql://user:pass@localhost/codeguardian < backup-20240115.sql

# From AWS
aws s3 cp s3://codeguardian-backups/backup-20240115.sql.gz .
gunzip backup-20240115.sql.gz
psql postgresql://user:pass@localhost/codeguardian < backup-20240115.sql
```

### Failover

```bash
# Redis Sentinel for failover
sentinel_1:26379> MONITOR codeguardian 127.0.0.1 6379 1

# Database failover (PostgreSQL Streaming Replication)
# 1. Stop primary
# 2. Promote replica: pg_ctl promote -D /data
# 3. Update connection strings
```

---

## Troubleshooting

### Common Issues

**Service won't start**

```bash
# Check logs
docker logs ai-orchestration

# Validate configuration
python -c "from app.config.settings import settings; print(settings)"

# Check ports
lsof -i :8000
```

**High Memory Usage**

```bash
# Monitor
docker stats ai-orchestration

# Check for leaks
py-spy record -o profile.svg -- python main.py

# Reduce pool sizes in .env
```

**Slow Responses**

```bash
# Check Groq API latency
curl -w "@curl-format.txt" -o /dev/null -s https://api.groq.com/health

# Monitor database connections
select count(*) from pg_stat_activity;

# Analyze slow queries
EXPLAIN ANALYZE SELECT ...;
```

**Rate Limit Errors**

```bash
# Check current usage
curl http://localhost:8000/metrics | grep analysis_total

# Implement request queue
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export DEBUG=true

# Run with verbose output
python -u main.py

# Use Python debugger
python -m pdb main.py

# Profile with cProfile
python -m cProfile -s cumtime main.py
```

---

## Rollback Plan

```bash
# Identify current version
docker ps | grep ai-orchestration # shows current tag

# Stop current version
docker stop ai-orchestration

# Start previous version
docker run --name ai-orchestration \
  --tag previous-version \
  [all original flags]

# Or with Kubernetes
kubectl rollout undo deployment/ai-orchestration
kubectl rollout status deployment/ai-orchestration
```

---

## Security Checklist

- [ ] All secrets stored in secure vault (not in config)
- [ ] API key rotation scheduled (quarterly)
- [ ] Rate limiting enabled
- [ ] HTTPS/TLS enforced
- [ ] Database encrypted at rest
- [ ] Backups encrypted
- [ ] Access logs centralized
- [ ] Security scanning enabled (SAST/dependency scanning)
- [ ] Database users have minimal privileges
- [ ] API runs as non-root user

---

**Last Updated:** 2024-01-15  
**Owner:** DevOps Team
