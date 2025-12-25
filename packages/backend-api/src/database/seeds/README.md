# Database Seeding

This directory contains seed scripts for initializing the Context7 MCP Clone database with test data.

## Available Seeds

### 1. `users.seed.ts`
Creates test users with different subscription tiers for development and testing.

**Test Users:**
- **Free Tier**: `free@example.com` / `Password123!`
  - Rate limit: 50 requests/min, 1,000 requests/day
  - No default API key

- **Pro Tier**: `pro@example.com` / `Password123!`
  - Rate limit: 500 requests/min, 50,000 requests/day
  - Includes default API key with `pro` tier limits
  - Admin panel access

- **Enterprise Tier**: `enterprise@example.com` / `Password123!`
  - Rate limit: 5,000 requests/min, 1,000,000 requests/day
  - Includes default API key with `enterprise` tier limits
  - Full admin panel access

- **Admin**: `admin@example.com` / `Password123!`
  - Enterprise tier with admin privileges
  - Full access to all features and admin panel

### 2. `libraries.seed.ts`
Seeds the database with 15+ popular libraries across multiple ecosystems with mock documentation.

**Seeded Libraries:**

**JavaScript/TypeScript (5)**
- React (facebook/react)
- Next.js (vercel/next.js)
- Vue.js (vuejs/vue)
- Express.js (expressjs/express)
- TypeScript (microsoft/typescript)

**Python (3)**
- Python (python/cpython)
- Django (django/django)
- FastAPI (tiangolo/fastapi)

**AI/ML (3)**
- LangChain (langchain-ai/langchain)
- OpenAI Python SDK (openai/openai-python)
- Anthropic SDK (anthropics/anthropic-sdk-python)

**Rust (2)**
- Rust (rust-lang/rust)
- Tokio (tokio-rs/tokio)

**DevOps & Database (2)**
- Docker (moby/moby)
- Kubernetes (kubernetes/kubernetes)
- PostgreSQL (postgres/postgres)

Each library includes:
- Multiple versions (latest marked)
- Sample documentation pages (Getting Started, API Reference, Examples)
- Topics and metadata for search

### 3. `seed.ts` (Main Orchestrator)
The main seeding script that coordinates all seed operations.

## Running Seeds

### Option 1: Using npm script (Recommended)
```bash
# After building the project
npm run build
npm run seed
```

### Option 2: Direct TypeScript execution
```bash
npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
```

### Option 3: Direct JavaScript execution (after build)
```bash
node dist/database/seeds/seed.js
```

## Environment Setup

The seed script reads from environment variables. Ensure your `.env` file contains:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=context7
```

For Docker Compose development:
```bash
docker-compose -f docker-compose.dev.yml up -d
npm run build
npm run seed
```

## Database Teardown (for re-seeding)

To reset and re-seed the database:

```bash
# Drop and recreate the database
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "DROP DATABASE context7;"
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -c "CREATE DATABASE context7;"

# Run migrations
npm run migration:run

# Run seeds
npm run seed
```

## Seed Output

When running successfully, you'll see output like:

```
🌍 Initializing database connection...
✅ Database connection established

🌱 Starting seed process...

👥 Seeding users...
✅ Created user: free@example.com (free)
✅ Created user: pro@example.com (pro)
  📝 Created API key: atm_live_xxx (500 rpm)
✅ Created user: enterprise@example.com (enterprise)
  📝 Created API key: atm_live_xxx (5000 rpm)
✅ Created user: admin@example.com (enterprise)
  📝 Created API key: atm_live_xxx (5000 rpm)

📚 Seeding libraries...
🌱 Starting library seeding...
✅ Created library: React
  📚 Seeded version 18.2.0
  📚 Seeded version 18.1.0
  📚 Seeded version 17.0.2
...
✨ Library seeding complete!

✨ Seeding complete!

📋 Test User Credentials:
   Free Tier:       free@example.com / Password123!
   Pro Tier:        pro@example.com / Password123!
   Enterprise Tier: enterprise@example.com / Password123!
   Admin:           admin@example.com / Password123!
```

## Integration with Development Workflow

The seed script is designed to be:
- **Idempotent**: Safe to run multiple times (checks for existing records)
- **Non-destructive**: Won't delete existing data, only adds missing records
- **Logged**: Shows detailed progress with emojis for easy scanning
- **Error-resistant**: Continues on individual failures while reporting them

## API Key Format

Generated API keys follow the format:
```
atm_{environment}_{random_chars}

Example: atm_live_k8j3h2g1f9d8c7b6a5z4x3w2v1
```

API keys are hashed with bcrypt before storage, matching the API key generation pattern in the application.

## Testing with Seeds

After running seeds, you can immediately test:

### 1. Authentication
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@example.com","password":"Password123!"}'
```

### 2. API Key Management
```bash
# Login first to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pro@example.com","password":"Password123!"}' | jq -r '.access_token')

# List API keys
curl http://localhost:5000/api/v1/api-keys \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Library Search
```bash
curl "http://localhost:5000/api/v1/libraries?search=react" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Documentation Retrieval
```bash
curl "http://localhost:5000/api/v1/docs/facebook/react" \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- Passwords are hashed with bcrypt (10 rounds) before storage
- Test credentials should never be used in production
- API keys are generated with prefixes only (full secret shown once at creation)
- Each run checks for existing records to prevent duplicates
- All seed operations are logged for debugging and monitoring
