# NestJS Service Boilerplate Documentation

All 7 NestJS services follow this structure and patterns.

## Service Structure

```
service-name/
├── src/
│   ├── main.ts                 # Bootstrap file
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts       # Root controller
│   ├── app.service.ts         # Root service
│   ├── health/
│   │   └── health.controller.ts # Health check endpoint
│   ├── dto/                    # Data Transfer Objects (added per service)
│   ├── entities/               # TypeORM entities (added per service)
│   ├── config/                 # Configuration files
│   └── common/                 # Shared filters, guards, interceptors
├── test/                       # Test files
├── dist/                       # Compiled output
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── nest-cli.json              # NestJS CLI config
├── Dockerfile                 # Container build
├── .dockerignore              # Docker build exclusions
└── .gitignore                 # Git exclusions
```

## Each NestJS Service Includes

### 1. Main Entry Point (`main.ts`)

- NestFactory app initialization
- Global pipes (validation)
- CORS configuration
- Port listening with logger

### 2. Root Module (`app.module.ts`)

- ConfigModule for environment variables
- Service-specific modules (Auth, Kafka, etc.)
- Controllers and providers imported

### 3. Controllers

- `app.controller.ts` - Basic endpoint
- `health.controller.ts` - `/health` endpoint for Docker Compose health checks

### 4. Service

- `app.service.ts` - Basic business logic

## Available Services

| Service      | Port | Description                          |
| ------------ | ---- | ------------------------------------ |
| api-gateway  | 3000 | Request routing, rate limiting, auth |
| auth         | 3001 | User authentication, JWT, OAuth2     |
| upload       | 3002 | File upload and storage              |
| analysis     | 3003 | Code parsing, static analysis        |
| report       | 3004 | Report generation, PDF output        |
| notification | 3005 | Slack, Email, GitHub, Webhooks       |
| chat         | 3006 | RAG-based Q&A, WebSocket             |

## Quick Start

### Install Dependencies

```bash
cd backend/services/api-gateway
pnpm install
```

### Development

```bash
# Watch mode with hot-reload
pnpm start:dev

# Debug mode
pnpm start:debug
```

### Production Build

```bash
pnpm build
pnpm start:prod
```

### Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov
```

## Development Patterns

### Adding a New Module

```bash
nest g module features/users --no-spec
nest g controller features/users --no-spec
nest g service features/users --no-spec
```

### Creating DTOs

```typescript
// src/features/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Creating Entities

```typescript
// src/features/users/entities/user.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
```

## Environment Variables

Each service reads from `.env`:

```bash
NODE_ENV=development
SERVICE_PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
LOG_LEVEL=info
```

## Health Check

All services expose `/health` endpoint:

```bash
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "service": "api-gateway",
  "uptime": 123.45
}
```

## Logging

Using NestJS Logger:

```typescript
import { Logger } from "@nestjs/common";

export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log("Doing something...");
    this.logger.error("An error occurred", error);
    this.logger.warn("Warning message");
  }
}
```

## Common Tasks

### Add Repository

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find();
  }
}
```

### Add Middleware

```typescript
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.path}`);
    next();
  }
}
```

### Add Guard

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

## Testing

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it("should return hello message", () => {
    expect(controller.getHello()).toBe("CodeGuardian AI - API Gateway Service");
  });
});
```

## Next Steps

1. **Run docker-compose** to start infrastructure
2. **Install dependencies** in each service
3. **Implement feature modules** (users, scans, analysis, etc.)
4. **Add database entities** and repositories
5. **Create API endpoints** with DTOs
6. **Add authentication** and authorization
7. **Implement inter-service communication** via Kafka

## References

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport.js for NestJS](https://docs.nestjs.com/security/authentication)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/compression)

---

**Last Updated**: 2024-01-XX  
**NestJS Version**: 10.3+  
**Node.js Version**: 20+
