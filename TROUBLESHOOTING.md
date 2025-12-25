# Troubleshooting Guide - Context7 MCP Clone

## Docker Issues

### ERR_PNPM_LOCKFILE_CONFIG_MISMATCH

**Error Message**:
```
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
Cannot proceed with the frozen installation. The current "overrides"
configuration doesn't match the value found in the lockfile
```

**Cause**:
The `pnpm-lock.yaml` file has a different configuration than what's in `package.json`, or the lockfile is missing/corrupted.

**Solution**:
This has been fixed in the latest version. The Dockerfiles have been updated to remove the `--frozen-lockfile` flag, which allows pnpm to create a fresh lockfile during installation.

If you still encounter this error:

```bash
# Option 1: Remove and regenerate lockfile
rm -f pnpm-lock.yaml
docker-compose -f docker-compose.dev.yml up -d

# Option 2: Clean Docker and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Database Issues

### PostgreSQL Connection Refused

**Error Message**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause**:
PostgreSQL service is not running or not responding.

**Solution**:

```bash
# Check if PostgreSQL is running
docker-compose ps

# If postgres container exists but not running
docker-compose -f docker-compose.dev.yml start postgres

# If connection still fails, restart everything
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Verify PostgreSQL is ready
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -d atamai_dev -c "SELECT 1"
```

### Database Doesn't Exist

**Error Message**:
```
FATAL: database "atamai_dev" does not exist
```

**Solution**:

```bash
# Create database manually
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -c "CREATE DATABASE atamai_dev;"

# Or reset everything
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Seed Script Fails

**Error Message**:
```
❌ Error seeding [library]: ...
```

**Cause**:
Database schema hasn't been created yet.

**Solution**:

```bash
# Run migrations first
cd packages/backend-api
npm run migration:run

# Then run seed
npm run seed

# Or reset and reseed
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
npm run seed
```

---

## Redis Issues

### Redis Connection Refused

**Error Message**:
```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Solution**:

```bash
# Check Redis status
docker-compose ps

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis

# Or verify Redis is working
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
# Should output: PONG
```

### Rate Limiting Not Working

**Symptoms**:
API requests don't get rate limited despite configuration.

**Solution**:

```bash
# Check Redis is connected
docker-compose -f docker-compose.dev.yml exec redis redis-cli
> INFO
> FLUSHDB  # Reset rate limit counter if needed
> EXIT

# Check rate limit keys
docker-compose -f docker-compose.dev.yml exec redis redis-cli
> KEYS ratelimit:*  # Should show rate limit keys
```

---

## Backend API Issues

### Port Already in Use

**Error Message**:
```
Error: listen EADDRINUSE :::5000
```

**Solution**:

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
docker-compose -f docker-compose.dev.yml down
# Edit docker-compose.dev.yml and change port 5000 to something else
docker-compose -f docker-compose.dev.yml up -d
```

### Authentication Failures

**Problem**:
Cannot login with test credentials.

**Solution**:

```bash
# Verify users exist in database
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev -d atamai_dev
> SELECT email, tier FROM "user" LIMIT 5;

# If no users, run seed
npm run seed

# Verify seed completed successfully
npm run seed 2>&1 | grep "✅"
```

### API Returns 401 Unauthorized

**Cause**:
Missing or invalid JWT token.

**Solution**:

```bash
# Login to get token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@example.com","password":"Password123!"}'

# Copy the access_token from response
# Include it in subsequent requests:
curl http://localhost:5000/api/v1/api-keys \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

---

## Frontend Issues

### NEXT_PUBLIC_API_URL Not Working

**Symptom**:
Frontend API calls go to wrong server.

**Solution**:

```bash
# The environment variable is set at build time
# Edit docker-compose.dev.yml:
environment:
  NEXT_PUBLIC_API_URL: http://backend-api:5000  # For Docker
  # or
  NEXT_PUBLIC_API_URL: http://localhost:5000    # For local

# Rebuild after changing
docker-compose -f docker-compose.dev.yml up -d --build web-ui
```

### Dashboard Shows Empty

**Problem**:
Signed in but dashboard is blank.

**Solution**:

1. Check browser console for errors (F12 → Console tab)
2. Verify backend API is running: `curl http://localhost:5000/health`
3. Check token is stored: Browser DevTools → Application → Local Storage → auth_token
4. Try logging out and back in
5. Clear cache and reload: Ctrl+Shift+R

---

## Development Issues

### TypeScript Errors

**Problem**:
Type checking fails with cryptic errors.

**Solution**:

```bash
# Check which file has the error
npm run type-check

# In specific package
cd packages/backend-api
npm run type-check

# Common fixes
# - Add types: npm install --save-dev @types/package-name
# - Check tsconfig.json is correct
# - Ensure imports use correct paths
```

### Module Not Found

**Error Message**:
```
Cannot find module '@/something'
```

**Solution**:

```bash
# Check tsconfig.json paths are configured
cat tsconfig.json | grep -A 10 '"paths"'

# If missing, add paths configuration:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["packages/web-ui/src/*"]
    }
  }
}

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Health Checks

### Verify All Services Running

```bash
# Check containers
docker-compose ps

# Check service health
curl http://localhost:5000/health        # Backend API
curl http://localhost:3000/health        # MCP Server (if implemented)
curl http://localhost:4000               # Web UI

# Check databases
docker-compose exec postgres psql -U dev -d atamai_dev -c "SELECT count(*) FROM \"user\";"
docker-compose exec redis redis-cli ping
```

### Database Health

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U dev -d atamai_dev

# Common queries
SELECT * FROM "user" LIMIT 5;
SELECT * FROM library LIMIT 5;
SELECT count(*) FROM documentation_page;
SELECT count(*) FROM api_key;
```

### Redis Health

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check data
DBSIZE
KEYS *
KEYS ratelimit:*

# Clear if needed
FLUSHDB  # Warning: clears all rate limit data
```

---

## Performance Issues

### Slow API Responses

**Solution**:

```bash
# Check database indexes
docker-compose exec postgres psql -U dev -d atamai_dev
> \d documentation_page  # Check indexes
> EXPLAIN ANALYZE SELECT * FROM library WHERE name LIKE 'react%';

# Check Redis performance
docker-compose exec redis redis-cli --stat

# Check API logs
docker-compose logs backend-api -f  # Follow logs in real-time
```

### High Memory Usage

**Solution**:

```bash
# Check container stats
docker stats

# Limit container memory in docker-compose.yml
services:
  backend-api:
    deploy:
      resources:
        limits:
          memory: 512M

# Restart affected container
docker-compose up -d backend-api
```

---

## Cleanup & Reset

### Hard Reset Everything

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down -v

# Remove Docker images (optional)
docker image rm atamai-mcp-backend-api
docker image rm atamai-mcp-mcp-server
docker image rm atamai-mcp-web-ui
docker image rm atamai-mcp-crawler

# Start fresh
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to be healthy
sleep 10

# Run migrations and seeds
cd packages/backend-api
npm run migration:run
npm run seed
```

### Reset Database Only

```bash
# Backup current data (optional)
docker-compose exec postgres pg_dump -U dev atamai_dev > backup.sql

# Drop and recreate database
docker-compose exec postgres psql -U dev -c "DROP DATABASE atamai_dev;"
docker-compose exec postgres psql -U dev -c "CREATE DATABASE atamai_dev;"

# Run migrations and seeds
npm run migration:run
npm run seed
```

### Reset Redis Cache

```bash
# Clear all Redis data
docker-compose exec redis redis-cli FLUSHALL

# Check it's empty
docker-compose exec redis redis-cli DBSIZE
# Should return: (integer) 0
```

---

## Getting Help

If issues persist:

1. **Check logs**: `docker-compose logs [service-name] -f`
2. **Check configuration**: `docker-compose config` (shows merged config)
3. **Verify services**: `docker-compose ps` (shows running containers)
4. **Review documentation**:
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick start guide
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
   - [STATUS.md](STATUS.md) - Project status
5. **Check recent changes**: `git log --oneline -10`

---

**Last Updated**: December 25, 2025
**Status**: Phase 6 Complete with Docker fixes
