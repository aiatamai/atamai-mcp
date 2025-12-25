# Development Guide - Context7 MCP Clone

Quick reference for developers working on this project.

## Project Layout

```
atamai-mcp/
├── packages/
│   ├── mcp-server/        # MCP Protocol implementation
│   │   ├── src/
│   │   │   ├── index.ts          # Entry point
│   │   │   ├── server.ts         # Main MCP server
│   │   │   ├── api-client.ts     # Backend API client
│   │   │   ├── types.ts          # TypeScript types
│   │   │   ├── tools/            # MCP tool implementations
│   │   │   └── transports/       # Stdio and HTTP transports
│   │   └── package.json
│   │
│   ├── backend-api/       # NestJS REST API
│   │   ├── src/
│   │   │   ├── main.ts                 # Entry point
│   │   │   ├── app.module.ts           # Root module
│   │   │   ├── config/                 # Configuration
│   │   │   ├── database/               # Database setup & entities
│   │   │   │   ├── entities/           # ORM entities
│   │   │   │   └── migrations/         # SQL migrations
│   │   │   └── modules/                # Feature modules
│   │   │       ├── auth/               # Authentication
│   │   │       ├── libraries/          # Library management
│   │   │       └── documentation/      # Documentation
│   │   └── package.json
│   │
│   ├── crawler-engine/    # Documentation crawler
│   │   ├── src/
│   │   │   ├── crawlers/  # GitHub & docs crawlers
│   │   │   ├── parsers/   # Markdown/HTML parsing
│   │   │   └── queue/     # BullMQ job queue
│   │   └── package.json
│   │
│   └── web-ui/            # Next.js frontend
│       ├── src/
│       │   ├── app/       # App Router pages
│       │   └── components/# React components
│       └── package.json
│
├── docker/                # Dockerfiles
├── scripts/               # Utility scripts
│
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Development compose
├── PLAN.md                # Implementation plan
├── TODO.md                # Task checklist
├── TESTING.md             # Testing guide
└── DEVELOPMENT.md         # This file
```

## Common Commands

### Package Management

```bash
# Install dependencies for all packages
pnpm install

# Install for specific package
cd packages/backend-api && pnpm install

# Add dependency to specific package
cd packages/mcp-server && pnpm add axios

# Update all dependencies
pnpm update

# Clean all node_modules
pnpm -r clean
```

### Development

```bash
# Start all in dev mode
pnpm dev

# Start specific package
cd packages/backend-api && pnpm dev

# Build all packages
pnpm build

# Build specific package
cd packages/mcp-server && pnpm build
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Type check all packages
pnpm type-check

# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Watch tests
pnpm test:watch
```

### Docker

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove data
docker-compose -f docker-compose.dev.yml down -v

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend-api

# Access service shell
docker-compose -f docker-compose.dev.yml exec backend-api bash

# Rebuild images
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Adding a New Feature

### 1. Backend API Feature

Example: Add a new endpoint

```bash
# Create a new module
mkdir -p packages/backend-api/src/modules/new-feature/{dto,repositories}

# Create files
touch packages/backend-api/src/modules/new-feature/new-feature.service.ts
touch packages/backend-api/src/modules/new-feature/new-feature.controller.ts
touch packages/backend-api/src/modules/new-feature/new-feature.module.ts

# Edit app.module.ts to import the new module
```

**Service template:**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NewFeatureService {
  constructor(
    @InjectRepository(SomeEntity)
    private repository: Repository<SomeEntity>,
  ) {}

  async findAll() {
    return this.repository.find();
  }
}
```

**Controller template:**
```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewFeatureService } from './new-feature.service';

@ApiTags('New Feature')
@Controller('new-feature')
export class NewFeatureController {
  constructor(private readonly service: NewFeatureService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

### 2. MCP Tool

Example: Add a new tool

```bash
# Create tool file
touch packages/mcp-server/src/tools/new-tool.ts
```

**Tool template:**
```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from '../api-client.js';

export class NewTool {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  getTool(): Tool {
    return {
      name: 'new-tool',
      description: 'Description of what this tool does',
      inputSchema: {
        type: 'object' as const,
        properties: {
          param1: {
            type: 'string',
            description: 'Description of param1',
          },
        },
        required: ['param1'],
      },
    };
  }

  async handle(param1: string) {
    // Implementation
    return { result: 'data' };
  }
}
```

Then register in `server.ts`:
```typescript
// Add to imports
import { NewTool } from './tools/new-tool.js';

// In MCPServer constructor
this.newTool = new NewTool(this.apiClient);

// In setupHandlers, add to ListToolsRequestSchema
// and in CallToolRequestSchema, add case for 'new-tool'
```

### 3. Web UI Page

```bash
# Create page directory
mkdir -p packages/web-ui/src/app/new-page

# Create page component
touch packages/web-ui/src/app/new-page/page.tsx

# Create component directory
mkdir -p packages/web-ui/src/components/new-component
touch packages/web-ui/src/components/new-component/NewComponent.tsx
```

**Page template:**
```typescript
'use client';

import { NewComponent } from '@/components/new-component/NewComponent';

export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">New Page</h1>
      <NewComponent />
    </div>
  );
}
```

**Component template:**
```typescript
'use client';

export function NewComponent() {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Component Title</h2>
      <p className="text-gray-600">Component content</p>
    </div>
  );
}
```

## Database Changes

### Adding a New Entity

```bash
# Create entity file
touch packages/backend-api/src/database/entities/new-entity.entity.ts
```

**Entity template:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('new_entities')
export class NewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  created_at: Date;
}
```

### Creating a Migration

```bash
# Generate migration (TypeORM generates the SQL)
cd packages/backend-api
npx typeorm migration:generate src/database/migrations/NameOfChange

# Or manually create SQL migration
touch src/database/migrations/1234567890-NameOfChange.sql
```

**Manual migration template:**
```sql
-- src/database/migrations/1234567890-AddNewTable.sql

CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_name ON new_table(name);
```

Then update `database.module.ts` to include the new entity.

## Environment Variables

See `.env.example` for all available variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
POSTGRES_USER=dev
POSTGRES_PASSWORD=dev123
POSTGRES_DB=atamai_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Server
NODE_ENV=development
PORT=5000
MCP_SERVER_PORT=3000
WEB_UI_PORT=4000

# API
API_PREFIX=/api/v1
API_CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
```

## Testing

### Unit Tests

```bash
# Create test file
touch packages/backend-api/src/modules/auth/auth.service.spec.ts
```

**Test template:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await service.register({
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.email).toBe('test@example.com');
    });
  });
});
```

### Integration Tests

```bash
# Create E2E test file
touch packages/backend-api/src/modules/auth/auth.e2e.spec.ts
```

**Integration test template:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.access_token).toBeDefined();
        });
    });
  });
});
```

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend API",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/packages/backend-api/src/main.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/packages/backend-api/dist/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/packages/mcp-server/src/index.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/packages/mcp-server/dist/**/*.js"]
    }
  ]
}
```

### Logging

Use console with prefixes:
```typescript
// Backend
console.log('[AuthService] User registered:', userId);
console.error('[AuthService] Registration failed:', error);

// MCP Server
console.error('[MCP Server] Connecting to backend');
console.error('[MCP Server] Tool called: resolve-library-id');
```

View Docker logs:
```bash
docker-compose -f docker-compose.dev.yml logs -f [service]
```

## Code Style

### TypeScript

```typescript
// Use strict mode (configured in tsconfig.json)
// Use async/await instead of .then()
// Use const/let, not var
// Use arrow functions for callbacks
// Use type annotations explicitly

// Good
const getUser = async (id: string): Promise<User> => {
  const user = await userRepository.findOne(id);
  return user;
};

// Bad
function getUser(id) {
  return userRepository.findOne(id);
}
```

### NestJS

```typescript
// Use dependency injection
// Use decorators consistently
// Use guards/interceptors for cross-cutting concerns
// Use DTOs for validation

@Injectable()
export class MyService {
  constructor(
    @InjectRepository(Entity)
    private repo: Repository<Entity>,
  ) {}
}
```

### React/Next.js

```typescript
// Use functional components with hooks
// Use 'use client' for client components
// Use Tailwind CSS for styling
// Export default components

'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(false);
  return <div>{state ? 'ON' : 'OFF'}</div>;
}
```

## Version Control

```bash
# Create feature branch
git checkout -b feature/description

# Commit with conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update readme"

# Push to remote
git push origin feature/description
```

## Useful Resources

- [PLAN.md](./PLAN.md) - Full architecture and implementation plan
- [TODO.md](./TODO.md) - Task checklist by phase
- [TESTING.md](./TESTING.md) - Testing procedures
- [MCP Specification](https://modelcontextprotocol.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs/)

## Getting Help

1. Check existing code in similar modules
2. Review PLAN.md for architectural guidance
3. Look at test files for usage examples
4. Check docker-compose logs for runtime errors
5. Use TypeScript strict mode to catch errors early

---

Happy coding! 🚀
