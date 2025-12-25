# Context7 MCP Clone - Up-to-Date Code Documentation for LLMs

A production-ready clone of Context7 MCP that provides up-to-date, version-specific documentation and code examples directly to LLMs and AI code editors.

## 🎯 Project Status

**Phase 2 Complete**: Core MCP Server and Backend API ready for development!

### Completed Components
- ✅ pnpm monorepo with workspace configuration
- ✅ Docker Compose development and production environments
- ✅ PostgreSQL database schema with migrations
- ✅ NestJS backend API with authentication
- ✅ Library and documentation services
- ✅ MCP server with both tools (resolve-library-id, get-library-docs)
- ✅ Stdio and HTTP transports for MCP protocol

### In Progress
- 🚀 Rate limiting with Redis
- 🚀 Crawler engine with GitHub API and web scraping
- 🚀 Markdown and HTML parsing with code extraction
- 🚀 Next.js web UI with Grafana theme

## 📦 Project Structure

```
atamai-mcp/
├── packages/
│   ├── mcp-server/           # MCP Protocol Server
│   ├── backend-api/          # NestJS REST API
│   ├── crawler-engine/       # Documentation Crawler
│   └── web-ui/               # Next.js Frontend
├── docker/                   # Container configurations
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── PLAN.md                   # Detailed implementation plan
├── TODO.md                   # Task checklist
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16+ (or use docker-compose)

### Development Setup

1. **Clone and install dependencies**
```bash
cd /Users/atamai/develope/atamai-mcp
pnpm install
```

2. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development environment with Docker**
```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 5000
- MCP Server on port 3000
- Web UI on port 4000

4. **Run migrations**
```bash
# Migrations run automatically when backend starts
# Or manually run:
cd packages/backend-api
pnpm run migration:run
```

## 📚 MCP Server

### Tools Available

#### 1. **resolve-library-id**
Converts a library name to Context7-compatible ID and returns ranked results.

**Input:**
```json
{
  "libraryName": "react"
}
```

**Output:**
```json
{
  "libraries": [
    {
      "id": "/facebook/react",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "ecosystem": "javascript",
      "stars": 220000,
      "benchmarkScore": 98,
      "reputation": "high",
      "codeSnippets": 15420
    }
  ],
  "selected": "/facebook/react",
  "reasoning": "Exact name match with highest benchmark score"
}
```

#### 2. **get-library-docs**
Retrieves version-specific documentation and code examples.

**Input:**
```json
{
  "context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",
  "page": 1,
  "mode": "code"
}
```

**Output:**
```json
{
  "libraryId": "/facebook/react",
  "library": {
    "name": "React",
    "full_name": "facebook/react",
    "ecosystem": "javascript"
  },
  "version": "18.2.0",
  "topic": "hooks",
  "page": 1,
  "totalPages": 5,
  "documentation": [
    {
      "title": "Using the State Hook",
      "type": "guide",
      "content": "...",
      "codeExamples": [
        {
          "language": "javascript",
          "code": "const [count, setCount] = useState(0);",
          "description": "Basic useState example"
        }
      ],
      "url": "https://react.dev/reference/react/useState"
    }
  ]
}
```

### Running MCP Server

**Stdio Mode (for Claude Desktop, Cursor, etc.)**
```bash
cd packages/mcp-server
pnpm start
# Or with hot reload:
pnpm dev
```

**HTTP Mode**
```bash
MCP_TRANSPORT=http MCP_SERVER_PORT=3000 pnpm start
# Access SSE endpoint at: http://localhost:3000/mcp/sse
```

## 🔌 Backend API

### Authentication

**Register**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Libraries

**Search Libraries**
```bash
GET /api/v1/libraries?query=react&ecosystem=javascript&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Get Library by ID**
```bash
GET /api/v1/libraries/{id}
Authorization: Bearer <jwt_token>
```

**Get Available Ecosystems**
```bash
GET /api/v1/libraries/ecosystems
Authorization: Bearer <jwt_token>
```

### Documentation

**Get Documentation**
```bash
GET /api/v1/docs/{libraryId}?topic=hooks&page=1&mode=code
Authorization: Bearer <jwt_token>
```

**Search Documentation**
```bash
GET /api/v1/docs/search/{query}
Authorization: Bearer <jwt_token>
```

### Swagger Documentation

Once the backend is running, visit:
```
http://localhost:5000/docs
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts with tier system
- **api_keys** - API key management with rate limits
- **libraries** - Library metadata
- **library_versions** - Version tracking
- **documentation_pages** - Documentation content with full-text search
- **code_examples** - Code snippets
- **crawl_jobs** - Crawler job tracking
- **api_usage** - Usage analytics

### Features
- Full-text search on documentation
- Trigram similarity for fuzzy matching
- JSONB metadata support
- Automatic tsvector updates
- Materialized views for popular libraries

## 🔄 Deployment

### Production Docker Compose
```bash
docker-compose up -d
```

### Environment Variables
See `.env.example` for all available options:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing key
- `NODE_ENV` - production/development
- `API_PREFIX` - API base path (default: /api/v1)

### Kubernetes Deployment
Deploy manifests are in the plan for Phase 8.

## 📈 Development Roadmap

### Phase 3: Crawler Engine (Weeks 5-6)
- [ ] BullMQ job queue setup
- [ ] GitHub crawler with Octokit
- [ ] Documentation site scraper
- [ ] Markdown/HTML parsers
- [ ] Code extraction engine

### Phase 4: Web UI (Weeks 7-8)
- [ ] Next.js 15 setup with App Router
- [ ] Landing page with purple gradient theme
- [ ] Documentation browser
- [ ] Authentication pages

### Phase 5: Dashboard & Admin (Weeks 9-10)
- [ ] User dashboard
- [ ] API key management
- [ ] Admin panel
- [ ] Analytics and charts

### Phase 6-10: Completion & Launch
- [ ] Data seeding
- [ ] Testing & optimization
- [ ] Production deployment
- [ ] Beta & public launch

## 🧪 Testing

```bash
# Run tests for all packages
pnpm test

# Run tests with coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

## 📝 Code Style

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint
pnpm lint

# Type check
pnpm type-check
```

## 🐛 Debugging

### Backend API
```bash
DEBUG=* pnpm dev
```

### MCP Server
```bash
DEBUG=* pnpm dev
```

### Docker Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f [service-name]
```

## 📖 Documentation

- **PLAN.md** - Comprehensive implementation plan with architecture
- **TODO.md** - Detailed task checklist for all phases
- **API Docs** - Available at `http://localhost:5000/docs` (Swagger)

## 🤝 Contributing

This is a solo development project. Please follow:
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- 80%+ test coverage

## 📄 License

MIT

## 🎯 Key Metrics (Target)

- **Performance**: MCP response <200ms (p95)
- **Search**: <100ms (p95)
- **Uptime**: 99.9%
- **Coverage**: 100+ libraries by month 6
- **Users**: 1000+ registered by month 3

---

## Next Steps

1. Run `docker-compose -f docker-compose.dev.yml up`
2. Wait for migrations to complete
3. Visit http://localhost:5000/docs for API documentation
4. Start using the MCP server with Claude Desktop or Cursor
5. Reference PLAN.md for detailed architecture and TODO.md for task tracking
