# Testing Guide - Context7 MCP Clone

This guide walks you through testing all components of the Context7 MCP clone.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)
- curl or Postman (for API testing)
- pnpm (for package management)

## Quick Start - Docker Compose

### 1. Start Development Environment

```bash
cd /Users/atamai/develope/atamai-mcp

# Start all services
docker-compose -f docker-compose.dev.yml up

# In another terminal, check service health
docker-compose -f docker-compose.dev.yml ps
```

Expected output shows all services running:
```
NAME                   STATUS
atamai_postgres_dev    Up (healthy)
atamai_redis_dev       Up (healthy)
atamai_backend_dev     Up
atamai_mcp_server_dev  Up
atamai_crawler_dev     Up
atamai_web_ui_dev      Up
```

### 2. Wait for Services to Start

- PostgreSQL: ~10 seconds
- Redis: ~5 seconds
- Backend API: ~30 seconds (runs migrations)
- MCP Server: ~15 seconds
- Web UI: ~20 seconds

Check backend readiness:
```bash
curl -s http://localhost:5000/health || echo "Not ready yet..."
```

## Testing Backend API

### 1. API Documentation

Once the backend is running, visit:
```
http://localhost:5000/docs
```

This shows the complete Swagger/OpenAPI documentation with all endpoints and schemas.

### 2. Authentication Testing

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Expected response:
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "tier": "free",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Login with existing credentials:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Save the `access_token` for subsequent requests.

### 3. Library Management Testing

Set the token as a variable:
```bash
TOKEN="your_access_token_here"
```

**Search libraries:**
```bash
curl -X GET "http://localhost:5000/api/v1/libraries?query=react&ecosystem=javascript&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Get available ecosystems:**
```bash
curl -X GET "http://localhost:5000/api/v1/libraries/ecosystems" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Documentation Testing

The documentation endpoints are ready but will return empty results until the crawler seeds the database.

**Get documentation for a library** (once data is seeded):
```bash
curl -X GET "http://localhost:5000/api/v1/docs/facebook/react?page=1&mode=code" \
  -H "Authorization: Bearer $TOKEN"
```

**Search documentation:**
```bash
curl -X GET "http://localhost:5000/api/v1/docs/search/hooks" \
  -H "Authorization: Bearer $TOKEN"
```

## Testing MCP Server

### 1. Stdio Mode (Native Integration)

This mode is for direct integration with Claude Desktop, Cursor, VS Code.

**Build the MCP server:**
```bash
cd packages/mcp-server
pnpm build
```

**Start in stdio mode:**
```bash
pnpm start
# Or with hot reload
pnpm dev
```

The server will be ready to receive requests via stdio.

### 2. HTTP Mode (Testing)

**Start in HTTP mode:**
```bash
cd packages/mcp-server
MCP_TRANSPORT=http MCP_SERVER_PORT=3000 pnpm start
```

**Test SSE endpoint (Server-Sent Events):**
```bash
# Open a connection
curl -N http://localhost:3000/mcp/sse

# In another terminal, check health
curl http://localhost:3000/health
```

### 3. Direct Tool Testing

Once the database is seeded with libraries, test the MCP tools:

**Create a test script** (`test-mcp.js`):
```javascript
import { MCPServer } from './packages/mcp-server/dist/server.js';

async function testMCP() {
  const server = new MCPServer('http://localhost:5000');

  console.log('Testing resolve-library-id...');
  const resolveResult = await server.resolveLibraryId({ libraryName: 'react' });
  console.log('Result:', JSON.stringify(resolveResult, null, 2));

  if (resolveResult.selected) {
    console.log('\nTesting get-library-docs...');
    const docsResult = await server.getLibraryDocs({
      libraryId: resolveResult.selected,
      topic: 'hooks',
      page: 1,
      mode: 'code',
    });
    console.log('Result:', JSON.stringify(docsResult, null, 2));
  }
}

testMCP().catch(console.error);
```

## Database Testing

### 1. Connect to PostgreSQL

```bash
# Using Docker
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -d atamai_dev

# Or directly if installed locally
psql postgresql://dev:dev123@localhost:5432/atamai_dev
```

### 2. Check Tables

```sql
-- List tables
\dt

-- Check users
SELECT id, email, tier FROM users;

-- Check libraries (empty until crawler runs)
SELECT id, name, full_name, ecosystem FROM libraries;

-- Check API keys
SELECT id, user_id, key_prefix, is_active FROM api_keys;

-- Check table structure
\d documentation_pages
```

### 3. View Search Indexes

```sql
-- List all indexes
\di

-- Check full-text search setup
SELECT * FROM information_schema.triggers WHERE trigger_name LIKE 'tsvector%';
```

## Redis Testing

### 1. Connect to Redis

```bash
# Using Docker
docker-compose -f docker-compose.dev.yml exec redis redis-cli

# Or directly if installed locally
redis-cli -h localhost -p 6379
```

### 2. Check Keys

```bash
# Show all keys
KEYS *

# Get a key value
GET key-name

# Monitor real-time commands
MONITOR
```

## Local Development (Without Docker)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Services Individually

**Start PostgreSQL** (you need to have it running):
```bash
# If installed via homebrew on macOS
brew services start postgresql

# Or run with Docker
docker run -d \
  --name atamai_postgres \
  -e POSTGRES_USER=dev \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_DB=atamai_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

**Start Redis**:
```bash
docker run -d \
  --name atamai_redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Start Backend API**:
```bash
cd packages/backend-api
pnpm dev
```

**Start MCP Server**:
```bash
cd packages/mcp-server
pnpm dev
```

**Start Web UI**:
```bash
cd packages/web-ui
pnpm dev
```

## Testing Checklist

### Phase 1-2 Verification
- [ ] Docker Compose starts all services without errors
- [ ] PostgreSQL runs migrations successfully
- [ ] Backend API is accessible on http://localhost:5000
- [ ] MCP Server starts without errors
- [ ] Swagger docs available at http://localhost:5000/docs

### API Testing
- [ ] User registration works
- [ ] User login returns valid JWT token
- [ ] Library search returns empty results (expected)
- [ ] API returns 401 without authentication header
- [ ] API returns 429 when rate limit exceeded (to test later)

### MCP Server Testing
- [ ] MCP server starts in stdio mode
- [ ] Tools are listed correctly
- [ ] resolve-library-id tool returns error (expected, no data)
- [ ] get-library-docs tool returns error (expected, no data)

### Database Testing
- [ ] PostgreSQL schema created correctly
- [ ] All tables exist with proper indexes
- [ ] Full-text search triggers are in place
- [ ] Materialized view exists (popular_libraries)

### Integration Testing
- [ ] Backend communicates with PostgreSQL
- [ ] Backend communicates with Redis
- [ ] MCP Server communicates with Backend API
- [ ] HTTP transport responds on correct port

## Troubleshooting

### Backend API fails to start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend-api

# Common issues:
# 1. PORT already in use: Change PORT in docker-compose.dev.yml
# 2. Database not ready: Wait 30 seconds, then restart
# 3. Environment variables: Check .env file
```

### PostgreSQL migration fails
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up postgres
# Wait for it to be healthy, then start other services
```

### Redis connection errors
```bash
# Check Redis is running
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
# Should return: PONG
```

### MCP Server can't connect to backend
```bash
# Check backend is running
curl http://localhost:5000/health

# Check BACKEND_API_URL environment variable
echo $BACKEND_API_URL

# Verify docker network
docker-compose -f docker-compose.dev.yml exec mcp-server ping backend-api
```

## Performance Testing

### 1. Response Time Testing

```bash
# Test authentication response time
time curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

### 2. Load Testing (with Apache Bench)

```bash
# Install ab
brew install httpd

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:5000/health
```

### 3. Monitor Resource Usage

```bash
# Docker stats
docker-compose -f docker-compose.dev.yml stats

# System monitoring
docker-compose -f docker-compose.dev.yml exec backend-api top
```

## Next Steps After Testing

1. **All tests passing?** → Ready for Phase 3 (Rate Limiting & Crawler)
2. **Issues found?** → Check logs and troubleshooting section
3. **Want to seed data?** → Wait for crawler implementation
4. **Ready for production?** → Use `docker-compose.yml` instead of dev version

## Useful Commands

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Remove all data
docker-compose -f docker-compose.dev.yml down -v

# View live logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend-api

# Restart a service
docker-compose -f docker-compose.dev.yml restart backend-api

# Access a service shell
docker-compose -f docker-compose.dev.yml exec backend-api bash
```

---

**Happy Testing!** 🚀

Once you've verified all components are working, we can move to Phase 3: Rate Limiting and Crawler Engine.
