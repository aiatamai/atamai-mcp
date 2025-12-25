# Quick Start Guide - 5 Minutes to Running

## 🚀 Start Everything (Docker)

```bash
cd /Users/atamai/develope/atamai-mcp
docker-compose -f docker-compose.dev.yml up
```

**Wait ~60 seconds** for all services to start and migrations to complete.

## ✅ Verify It's Working

### Check Services
```bash
# In another terminal
docker-compose -f docker-compose.dev.yml ps
```

All should show "Up" status.

### Check Backend API
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}

# View Swagger docs
open http://localhost:5000/docs
```

### Check MCP Server
```bash
curl http://localhost:3000/health
# Should return: {"status":"healthy"}
```

## 🔑 Create Your First User

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Copy the access_token from response
```

## 📚 Test API Endpoints

```bash
# Set your token
TOKEN="your_access_token_here"

# Search libraries (returns empty, no data yet)
curl -X GET "http://localhost:5000/api/v1/libraries?query=react" \
  -H "Authorization: Bearer $TOKEN"

# Get ecosystems
curl -X GET "http://localhost:5000/api/v1/libraries/ecosystems" \
  -H "Authorization: Bearer $TOKEN"
```

## 🧪 Test MCP Server

### In Stdio Mode (for integration)
```bash
cd packages/mcp-server
pnpm build
pnpm start
# Wait for ready message
# Can now send JSON-RPC requests on stdio
```

### In HTTP Mode (for testing)
```bash
cd packages/mcp-server
MCP_TRANSPORT=http pnpm start

# In another terminal:
curl http://localhost:3000/health
```

## 📂 Project Structure

```
packages/
├── mcp-server/       - MCP protocol server
├── backend-api/      - REST API
├── crawler-engine/   - Coming soon
└── web-ui/           - Coming soon
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [PLAN.md](./PLAN.md) | Full architecture (20KB) |
| [TODO.md](./TODO.md) | Task checklist |
| [TESTING.md](./TESTING.md) | Detailed testing guide |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Dev quick reference |
| [STATUS.md](./STATUS.md) | Project progress |

## 🛑 Stop Services

```bash
docker-compose -f docker-compose.dev.yml down
```

## 🔄 Reset Everything

```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port
lsof -i :5000  # Backend
lsof -i :3000  # MCP Server

# Kill it
kill -9 <PID>
```

### Database Not Ready
```bash
# Wait longer (30-60 seconds) for migrations
# Or restart just backend
docker-compose -f docker-compose.dev.yml restart backend-api
```

### Can't Connect to Backend
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend-api

# Restart all
docker-compose -f docker-compose.dev.yml restart
```

## 🎯 What's Available Now

### Working
- ✅ User registration/login
- ✅ API authentication
- ✅ Library search endpoint (empty until crawler runs)
- ✅ MCP server with 2 tools
- ✅ Swagger API documentation

### Coming Soon
- 🚀 Documentation crawler
- 🚀 Rate limiting
- 🚀 Web UI
- 🚀 Admin dashboard

## 📝 Common Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View backend logs
docker-compose -f docker-compose.dev.yml logs -f backend-api

# Access database
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -d atamai_dev

# Access backend shell
docker-compose -f docker-compose.dev.yml exec backend-api bash

# Rebuild images
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 🎓 Next Steps

1. **Verify everything works** → Run Quick Start above
2. **Read PLAN.md** → Understand architecture
3. **Check TODO.md** → See what's being built
4. **Review TESTING.md** → Learn comprehensive testing
5. **Start Phase 3** → Crawler engine implementation

---

**Time to start**: < 5 minutes with Docker
**Time to test**: ~ 10 minutes with manual curl requests
**Time to understand**: ~ 1 hour with all documentation

Enjoy! 🚀
