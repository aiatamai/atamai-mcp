# Context7 MCP Clone - Implementation Plan

## Project Overview

Building a commercial clone of Context7 MCP with full functionality including MCP server, backend API, documentation crawler/parser, and web interfaces styled after Grafana's purple gradient theme.

**Technology Stack**: TypeScript/Node.js monorepo
**Database**: PostgreSQL with full-text search
**Target**: Production-ready, commercially viable product

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  Claude Desktop │ Cursor │ VS Code │ Web UI │ Direct API Clients   │
└────────┬────────────────────────────────────────────────────┬────────┘
         │ MCP Protocol (stdio/HTTP)                         │ REST/HTTP
         │                                                     │
┌────────▼─────────────────────────────────────┐  ┌───────────▼──────┐
│         MCP SERVER (Port 3000)               │  │   WEB API        │
│  - JSON-RPC 2.0 Handler                      │  │   (Port 4000)    │
│  - Tool Registration                         │  │   - Browse Docs  │
│  - Authentication & Rate Limiting            │  │   - Admin Panel  │
└────────┬─────────────────────────────────────┘  └────────┬──────────┘
         │                                                  │
         └──────────────────┬───────────────────────────────┘
                            │
                ┌───────────▼────────────────┐
                │   BACKEND API (NestJS)     │
                │   - Documentation Service  │
                │   - Library Service        │
                │   - Auth Service           │
                └───────────┬────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼────────┐  ┌─────▼──────┐  ┌───────▼────────┐
│   PostgreSQL    │  │   Redis    │  │  Message Queue │
│   - Docs Data   │  │  - Cache   │  │  (BullMQ)      │
│   - Users       │  │  - Rate    │  │  - Crawl Jobs  │
│   - API Keys    │  │    Limits  │  └───────┬────────┘
└─────────────────┘  └────────────┘          │
                                     ┌────────▼────────┐
                                     │  CRAWLER ENGINE │
                                     │  - GitHub API   │
                                     │  - Web Scraper  │
                                     │  - Parser       │
                                     └─────────────────┘
```

## Project Structure

```
atamai-mcp/
├── packages/
│   ├── mcp-server/              # MCP Server (Port 3000)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── server.ts        # MCP server setup
│   │   │   ├── tools/
│   │   │   │   ├── resolve-library-id.ts
│   │   │   │   └── get-library-docs.ts
│   │   │   ├── transport/
│   │   │   │   ├── stdio.ts
│   │   │   │   └── http.ts
│   │   │   └── middleware/
│   │   │       ├── auth.ts
│   │   │       └── rate-limit.ts
│   │   └── package.json
│   │
│   ├── backend-api/             # NestJS Backend (Port 5000)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── libraries/
│   │   │   │   ├── documentation/
│   │   │   │   ├── users/
│   │   │   │   └── crawler/
│   │   │   ├── database/
│   │   │   │   └── migrations/
│   │   │   └── config/
│   │   └── package.json
│   │
│   ├── crawler-engine/          # Crawler Service
│   │   ├── src/
│   │   │   ├── crawlers/
│   │   │   │   ├── github-crawler.ts
│   │   │   │   └── docs-crawler.ts
│   │   │   ├── parsers/
│   │   │   │   ├── markdown-parser.ts
│   │   │   │   └── code-extractor.ts
│   │   │   └── queue/
│   │   └── package.json
│   │
│   └── web-ui/                  # Next.js Frontend (Port 4000)
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx     # Landing page
│       │   │   ├── docs/        # Docs browser
│       │   │   ├── dashboard/   # User dashboard
│       │   │   └── admin/       # Admin panel
│       │   └── components/
│       │       ├── landing/     # Hero, Features, Pricing
│       │       ├── docs/        # DocViewer, CodeBlock
│       │       └── dashboard/   # ApiKeyManager, Stats
│       └── package.json
│
├── docker/
│   ├── mcp-server.Dockerfile
│   ├── backend-api.Dockerfile
│   ├── crawler.Dockerfile
│   └── web-ui.Dockerfile
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml
└── README.md
```

## Database Schema (PostgreSQL)

### Core Tables

**users** - User accounts
- id (UUID), email, password_hash, tier (free/pro/enterprise)
- Rate limits based on tier

**api_keys** - API key management
- id, user_id, key_hash, key_prefix, tier, rate_limit_rpm, rate_limit_rpd
- Tracks last_used_at, expires_at

**libraries** - Library metadata
- id, name, full_name (org/project), description, ecosystem
- repository_url, stars, benchmark_score, reputation
- Searchable with trigram similarity (pg_trgm)

**library_versions** - Version tracking
- id, library_id, version, git_tag, is_latest, release_date
- documentation_status (pending/crawling/indexed/failed)

**documentation_pages** - Documentation content
- id, library_version_id, source_type, source_url, path
- title, content, content_type, page_type, topics[]
- **search_vector (tsvector)** for full-text search
- metadata (JSONB)

**code_examples** - Extracted code snippets
- id, documentation_page_id, language, code, description
- topics[], context, file_path, line_number
- search_vector for code search

**crawl_jobs** - Crawler job tracking
- id, library_version_id, job_type, status
- pages_crawled, pages_indexed, error_message

**api_usage** - Analytics
- id, api_key_id, endpoint, library_id, request_count, timestamp

## Key Technologies

### Backend
- **NestJS**: Enterprise-grade framework with dependency injection
- **TypeORM**: PostgreSQL ORM with migration support
- **Passport.js**: JWT + API key authentication
- **BullMQ**: Redis-based job queue for crawler
- **Redis**: Caching + rate limiting

### MCP Server
- **@modelcontextprotocol/sdk**: Official MCP implementation
- **Stdio + HTTP/SSE transports**: Multiple connection modes
- **Rate limiting**: Tiered (free: 50 rpm, pro: 500 rpm, enterprise: 5000 rpm)

### Crawler
- **Octokit**: GitHub API client (5000 req/hour per token)
- **Cheerio**: Fast HTML/markdown parsing
- **Puppeteer**: For JavaScript-rendered docs (when needed)
- **unified/remark**: Advanced markdown processing

### Frontend
- **Next.js 15**: App Router with Server Components
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality React components
- **Recharts**: Analytics dashboards
- **Prism.js**: Code syntax highlighting

## MCP Server Tools

### Tool 1: resolve-library-id

Converts library name to Context7-compatible ID

**Input**: `{ libraryName: string }`

**Output**:
```json
{
  "libraries": [{
    "id": "/facebook/react",
    "name": "React",
    "description": "...",
    "ecosystem": "javascript",
    "stars": 220000,
    "benchmarkScore": 98,
    "codeSnippets": 15420
  }],
  "selected": "/facebook/react",
  "reasoning": "Exact name match with highest benchmark score"
}
```

### Tool 2: get-library-docs

Retrieves version-specific documentation

**Input**:
```json
{
  "context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",  // optional
  "page": 1,         // 1-10
  "mode": "code"     // "code" or "info"
}
```

**Output**:
```json
{
  "libraryId": "/facebook/react",
  "version": "18.3.1",
  "documentation": [{
    "title": "Using the State Hook",
    "type": "guide",
    "content": "...",
    "codeExamples": [{
      "language": "javascript",
      "code": "const [count, setCount] = useState(0);",
      "description": "Basic useState example"
    }]
  }]
}
```

## REST API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT)

### API Keys
- `GET /api/v1/api-keys` - List user's keys
- `POST /api/v1/api-keys` - Generate new key (format: `atm_live_xxx`)
- `DELETE /api/v1/api-keys/:id` - Revoke key

### Libraries
- `GET /api/v1/libraries` - Search/list libraries
- `GET /api/v1/libraries/:id` - Get library details
- `GET /api/v1/libraries/:id/versions` - List versions

### Documentation
- `POST /api/v1/docs/resolve` - Resolve library ID
- `GET /api/v1/docs/:libraryId` - Get documentation

### Admin
- `GET /api/v1/admin/stats` - System statistics
- `POST /api/v1/admin/crawl` - Trigger crawl job
- `GET /api/v1/admin/jobs` - List crawl jobs

## Crawler Strategy

### Hybrid Approach
1. **GitHub Crawler**: READMEs, docs/, examples/, code files
2. **Official Docs Scraper**: Comprehensive documentation sites

### Workflow
```
Trigger → Job Queue → Worker → [GitHub API + Web Scraper]
       → Parser → Code Extractor → Indexer → PostgreSQL
```

### GitHub Crawler
- Use Octokit with authentication (5000 req/hour)
- Detect versions from git tags (semver parsing)
- Extract: README, docs/, examples/, package.json
- Respect rate limits with exponential backoff

### Docs Site Crawler
- Detect platform (Docusaurus, VitePress, GitBook)
- Parse sitemap.xml for structure
- Extract main content (remove nav/footer)
- Rate limit: 1-2 requests/second

### Parser Engine
- **Markdown**: unified + remark ecosystem
- **HTML**: Cheerio for efficient parsing
- **Code blocks**: Language detection, context extraction
- **Topics**: From headings, keywords, API patterns
- **Chunking**: ~2000 tokens, keep code + explanation together

## Web UI - Grafana Theme

### Landing Page (Purple Gradient)
- Hero section with gradient background: `purple-900 → purple-700 → pink-600`
- Animated overlay with pulse effect
- Feature showcase with icons
- Pricing tiers (Free, Pro, Enterprise)
- Company logos section
- CTA buttons with white/purple contrast

### Documentation Browser
- Search bar with autocomplete
- Library cards with stats (stars, version, last updated)
- Sidebar navigation
- Code syntax highlighting (Prism.js)
- Version selector
- Topic filtering

### Admin Dashboard
- Dark theme (gray-950 background)
- Stats cards grid (Total Libraries, API Requests, Active Users, Crawl Jobs)
- Usage charts (Recharts)
- Recent activity table
- Library management interface

## Authentication & Authorization

### User Flow
1. **Register** → Email + password → JWT tokens (access + refresh)
2. **Generate API Key** → `atm_live_xxx` format (shown once)
3. **MCP Client** → Uses API key in header or environment variable

### API Key Format
```
atm_{env}_{32_random_chars}
env: 'test' | 'live'
Example: atm_live_k8j3h2g1f9d8c7b6a5z4x3w2v1
```

### Rate Limiting (Redis-based)
- **Free**: 50 requests/minute, 1,000/day
- **Pro**: 500 requests/minute, 50,000/day
- **Enterprise**: 5,000 requests/minute, 1,000,000/day

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Initialize pnpm monorepo
- Set up PostgreSQL with migrations
- Create NestJS backend with auth
- Docker Compose dev environment

**Critical Files**:
- `pnpm-workspace.yaml`
- `docker-compose.dev.yml`
- `packages/backend-api/src/database/migrations/001_initial_schema.ts`
- `packages/backend-api/src/modules/auth/auth.service.ts`

### Phase 2: Core API & MCP Server (Weeks 3-4)
- MCP server with stdio + HTTP transports
- Implement both tools (resolve, get-docs)
- Backend library & documentation services
- Rate limiting with Redis

**Critical Files**:
- `packages/mcp-server/src/server.ts`
- `packages/mcp-server/src/tools/resolve-library-id.ts`
- `packages/mcp-server/src/tools/get-library-docs.ts`
- `packages/backend-api/src/modules/documentation/documentation.service.ts`
- `packages/backend-api/src/modules/libraries/libraries.service.ts`

### Phase 3: Crawler Engine (Weeks 5-6)
- BullMQ job queue
- GitHub crawler with Octokit
- Documentation site scraper
- Markdown/HTML parsers
- Code extractor
- Database indexer

**Critical Files**:
- `packages/crawler-engine/src/crawlers/github-crawler.ts`
- `packages/crawler-engine/src/crawlers/docs-crawler.ts`
- `packages/crawler-engine/src/parsers/markdown-parser.ts`
- `packages/crawler-engine/src/parsers/code-extractor.ts`
- `packages/crawler-engine/src/storage/indexer.ts`

### Phase 4: Web UI - Landing & Docs (Weeks 7-8)
- Next.js with App Router
- Landing page with purple gradients
- Documentation browser
- Authentication pages

**Critical Files**:
- `packages/web-ui/src/app/page.tsx`
- `packages/web-ui/src/components/landing/Hero.tsx`
- `packages/web-ui/src/app/docs/page.tsx`
- `packages/web-ui/src/components/docs/DocViewer.tsx`

### Phase 5: Dashboard & Admin (Weeks 9-10)
- User dashboard with API key management
- Admin panel with monitoring
- Analytics and charts
- Billing integration (Stripe)

**Critical Files**:
- `packages/web-ui/src/app/dashboard/page.tsx`
- `packages/web-ui/src/app/admin/page.tsx`
- `packages/web-ui/src/components/dashboard/ApiKeyManager.tsx`

### Phase 6: Initial Data Seeding (Week 11)
- Seed 20-30 popular libraries
  - JS/TS: React, Next.js, Vue, Express, NestJS
  - AI/ML: LangChain, OpenAI SDK, Anthropic SDK
- Validate search quality
- Fix parser issues

### Phase 7: Testing & Optimization (Week 12)
- Unit tests (Jest) - target 80% coverage
- Integration tests (Supertest)
- E2E tests (Playwright)
- Performance optimization
- Security hardening

### Phase 8: Production Deployment (Week 13)
- Cloud infrastructure setup
- Kubernetes/Docker Swarm deployment
- CI/CD pipeline (GitHub Actions)
- Monitoring (Prometheus + Grafana)

### Phase 9: Beta Launch (Week 14)
- Invite early users
- Gather feedback
- Marketing preparation

### Phase 10: Public Launch (Week 15+)
- Product Hunt launch
- Continuous improvement
- Feature expansion

## Critical Implementation Details

### Full-Text Search (PostgreSQL)
```sql
-- Enable extensions
CREATE EXTENSION pg_trgm;
CREATE EXTENSION uuid-ossp;

-- Create tsvector index
CREATE INDEX idx_docs_search ON documentation_pages
  USING gin(search_vector);

-- Auto-update trigger
CREATE TRIGGER tsvector_update_trigger
BEFORE INSERT OR UPDATE ON documentation_pages
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', title, content);
```

### Rate Limiting Logic (Redis)
```typescript
async function checkRateLimit(apiKey: string): Promise<boolean> {
  const minuteKey = `ratelimit:${apiKey}:${getCurrentMinute()}`;
  const dayKey = `ratelimit:${apiKey}:${getCurrentDay()}`;

  const [minuteCount, dayCount] = await redis.mget(minuteKey, dayKey);

  if (minuteCount >= limits.rpm || dayCount >= limits.rpd) {
    return false;
  }

  await redis.multi()
    .incr(minuteKey).expire(minuteKey, 60)
    .incr(dayKey).expire(dayKey, 86400)
    .exec();

  return true;
}
```

### Code Extraction Pattern
```typescript
class CodeExtractor {
  extractFromMarkdown(content: string): CodeBlock[] {
    // Regex: ```language\ncode\n```
    // Extract: language, code, surrounding context (±3 lines)
    // Identify: what API/feature it demonstrates
  }
}
```

## Infrastructure & Deployment

### Development
```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend-api:
    build: ./docker/backend-api.Dockerfile
    ports: ["5000:5000"]

  mcp-server:
    build: ./docker/mcp-server.Dockerfile
    ports: ["3000:3000"]

  crawler:
    build: ./docker/crawler.Dockerfile

  web-ui:
    build: ./docker/web-ui.Dockerfile
    ports: ["4000:3000"]
```

### Production
- **Hosting**: AWS/GCP/Azure
- **Database**: Managed PostgreSQL (RDS/Cloud SQL)
- **Cache**: Managed Redis (ElastiCache/MemoryStore)
- **Container Orchestration**: Kubernetes
- **Load Balancer**: Nginx + SSL (Let's Encrypt)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack

### Estimated Costs
- Development: ~$50/month (local Docker)
- Staging: ~$200/month
- Production (initial): ~$500-1000/month
- Production (at scale): ~$2000-5000/month

## Success Metrics

### Technical
- MCP server response time: <200ms (p95)
- Documentation search: <100ms (p95)
- Crawler throughput: 1000+ pages/hour
- Database query performance: <50ms (p95)
- Uptime: 99.9%

### Business
- Library coverage: 100+ libraries (6 months)
- User acquisition: 1000+ registered users (3 months)
- API requests: 1M+ requests/month (6 months)
- Conversion rate: 5% free → paid

## Risk Mitigation

### Technical Risks
- **Rate limiting from sources**: Token rotation, respectful crawling
- **Documentation quality**: Manual review, user feedback
- **Scale**: Horizontal scaling, caching strategy

### Business Risks
- **Competition**: Superior UX, broader coverage
- **Monetization**: Clear value in paid tiers
- **User acquisition**: SEO, developer community

## Competitive Advantages

1. **Broader Coverage**: Support more libraries than Context7
2. **Better Search**: Semantic search with embeddings (future)
3. **Code-First**: Prioritize code examples over prose
4. **Speed**: Aggressive caching, optimized queries
5. **Developer Experience**: Better docs, examples, SDKs

## Initial Library Focus

**JavaScript/TypeScript** (Priority 1):
- React, Next.js, Vue, Svelte
- Express, NestJS, Fastify
- TypeScript, Node.js
- Axios, Fetch API

**AI/ML Libraries** (Priority 2):
- LangChain, LlamaIndex
- OpenAI SDK, Anthropic SDK
- Transformers.js, ONNX Runtime

**Total Initial Target**: 20-30 well-documented libraries

---

## Next Steps

1. Initialize pnpm monorepo with workspace configuration
2. Set up Docker Compose development environment
3. Create PostgreSQL database with initial migration
4. Build NestJS backend foundation with auth module
5. Implement MCP server with basic tool handlers
6. Create crawler infrastructure with job queue

**Estimated Timeline**: 13-15 weeks to production launch
**Team Size**: 2-3 full-stack developers
**First Milestone**: Working MCP server with mock data (Week 4)
