# Quick Reference Guide - Context7 MCP Clone

## Project Overview

Context7 MCP Clone is a commercial documentation API service that provides:
- **MCP Server**: JSON-RPC 2.0 tools for IDE integration
- **REST API**: Comprehensive endpoints for all operations
- **Web UI**: Professional dashboard and documentation browser
- **Crawler**: Automated documentation indexing from GitHub and websites
- **Database**: PostgreSQL with full-text search

## Key Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Libraries
```
GET /api/v1/libraries?search=react
GET /api/v1/libraries/:id
GET /api/v1/libraries/:id/versions
```

### Documentation
```
POST /api/v1/docs/resolve
GET /api/v1/docs/:libraryId?topic=hooks&page=1&mode=code
```

### API Keys
```
GET /api/v1/api-keys
POST /api/v1/api-keys
DELETE /api/v1/api-keys/:id
```

### Admin
```
GET /api/v1/admin/stats
GET /api/v1/admin/jobs
```

## Test Credentials

```
Free: free@example.com / Password123!
Pro: pro@example.com / Password123!
Enterprise: enterprise@example.com / Password123!
Admin: admin@example.com / Password123!
```

## Starting the System

```bash
# 1. Start services
docker-compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
pnpm install

# 3. Build backend
cd packages/backend-api && pnpm build

# 4. Run database seeds
pnpm run seed

# 5. Start MCP server
cd packages/mcp-server && pnpm dev

# 6. Start backend API (in new terminal)
cd packages/backend-api && pnpm dev

# 7. Start web UI (in new terminal)
cd packages/web-ui && pnpm dev
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Web UI | 4000 | Next.js frontend |
| Backend API | 5000 | NestJS REST API |
| MCP Server | 3000 | Protocol server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & rate limiting |

## Database

**Tables**:
- users (4 test accounts)
- api_keys (with rate limits)
- libraries (15 seeded)
- library_versions (45+ versions)
- documentation_pages (90+ pages)
- code_examples
- crawl_jobs

**Test Data**: 15 libraries across 6 ecosystems

## Rate Limits

| Tier | Per Minute | Per Day |
|------|-----------|---------|
| Free | 50 | 1,000 |
| Pro | 500 | 50,000 |
| Enterprise | 5,000 | 1,000,000 |

## Architecture

```
┌─────────────────────┐
│   Claude Desktop    │
│   Cursor / VS Code  │
└──────────┬──────────┘
           │ (MCP Protocol)
           ▼
    ┌──────────────┐
    │  MCP Server  │
    │  (Port 3000) │
    └──────┬───────┘
           │
     ┌─────▼─────┐
     │  Backend   │
     │  API       │
     │ (Port 5000)│
     └──────┬─────┘
            │
    ┌───────┴────────┐
    ▼                ▼
┌─────────┐      ┌────────┐
│PostgreSQL      Redis    │
│ Database  │   │ Cache   │
└──────────┘    └─────────┘
```

## File Structure

```
atamai-mcp/
├── packages/
│   ├── mcp-server/          # JSON-RPC 2.0 tools
│   ├── backend-api/         # NestJS REST API
│   ├── crawler-engine/      # Job queue & crawlers
│   └── web-ui/              # Next.js frontend
├── docker/                  # Dockerfiles
├── PLAN.md                  # Architecture
├── PHASE6_COMPLETE.md       # Phase 6 details
└── STATUS.md                # Project status
```

## Common Commands

```bash
# Development
pnpm install                 # Install deps
pnpm build                   # Build all packages
pnpm dev                     # Run dev servers
pnpm test                    # Run tests

# Database
npm run seed                 # Load test data
npm run migration:run        # Run migrations

# Docker
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# Linting
pnpm lint                    # Check code
pnpm format                  # Format code
```

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=context7

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

## Key Features

### Authentication
- JWT tokens with 24h expiration
- Bcrypt password hashing (10 rounds)
- Token persistence in localStorage

### API Keys
- Format: `atm_live_xxxxx`
- Shown once at creation
- Hashed before storage
- Tiered rate limits

### Rate Limiting
- Per-minute and per-day limits
- Redis-backed tracking
- Automatic reset at boundaries

### Documentation Search
- Full-text search (PostgreSQL)
- Trigram similarity matching
- Pagination support
- Topic filtering

### Admin Features
- System statistics dashboard
- Crawler job monitoring
- Real-time statistics (10s refresh)
- Tier-based access control

## Troubleshooting

### Docker Issues
```bash
# Clean up and restart
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Database Connection
```bash
# Verify PostgreSQL
docker-compose exec postgres psql -U postgres -c "\l"

# Run migrations
npm run migration:run
```

### Rate Limiting Not Working
```bash
# Check Redis
docker-compose exec redis redis-cli
> INFO
> FLUSHDB  # Reset if needed
```

### Seed Script Errors
```bash
# Re-seed database
pnpm run seed

# Or manually reset
docker-compose exec postgres psql -U postgres
> DROP DATABASE context7;
> CREATE DATABASE context7;
```

## API Example

```javascript
// Login
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'pro@example.com',
    password: 'Password123!'
  })
});
const { access_token } = await response.json();

// Search libraries
const libs = await fetch(
  'http://localhost:5000/api/v1/libraries?search=react',
  {
    headers: { 'Authorization': `Bearer ${access_token}` }
  }
);
const data = await libs.json();
console.log(data);
```

## MCP Tool Usage

```python
# resolve-library-id
{
  "libraryName": "react"
  // Returns: "/facebook/react" + metadata
}

# get-library-docs
{
  "context7CompatibleLibraryID": "/facebook/react",
  "topic": "hooks",
  "page": 1,
  "mode": "code"
  // Returns: Documentation with code examples
}
```

## Monitoring

**Logs**:
- Backend: stdout with timestamps
- MCP Server: stdio with request logging
- Crawler: Job status in database

**Health**:
- API: `GET /health`
- Database: Connection pooling status
- Redis: `redis-cli INFO`

## Performance Tips

1. **Search**: Indexed full-text search is fast
2. **Rate Limiting**: Redis operations <5ms
3. **Caching**: Consider adding page caching
4. **Pagination**: Always use pagination for large results

## Security Checklist

- ✅ JWT authentication required
- ✅ Passwords bcrypt hashed
- ✅ API keys hashed
- ✅ Rate limiting enabled
- ✅ CORS configured
- ✅ Input validation active
- 🔲 HTTPS (production only)
- 🔲 SSL certificates

## Next Steps

1. **Testing** (Phase 7)
   - Unit tests (80%+ coverage)
   - Integration tests
   - E2E tests
   - Performance testing

2. **Optimization** (Phase 8)
   - Query optimization
   - Caching strategy
   - Index tuning
   - Load testing

3. **Deployment** (Phase 9)
   - Kubernetes setup
   - CI/CD pipeline
   - Monitoring stack
   - Backup procedures

4. **Launch** (Phase 10)
   - Beta testing
   - Marketing
   - Community building
   - Growth tracking

## Documentation

- **[PLAN.md](PLAN.md)** - Complete architecture
- **[STATUS.md](STATUS.md)** - Project progress
- **[PHASE6_COMPLETE.md](PHASE6_COMPLETE.md)** - Phase 6 details
- **[PHASE7_NEXT_STEPS.md](PHASE7_NEXT_STEPS.md)** - Testing plan
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Project summary

## Support

For detailed information:
- Architecture: See PLAN.md
- Current Status: See STATUS.md
- Phase Details: See PHASE*_COMPLETE.md files
- Development: See DEVELOPMENT.md
- Testing: See TESTING.md

---

**Version**: Phase 6 Complete
**Last Updated**: December 24, 2025
**Status**: Production-Ready MVP
