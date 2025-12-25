# Phase 3: Crawler Engine - COMPLETE ✅

**Date Completed:** December 24, 2025
**Status:** Phase 3 implementation finished

## Overview

Phase 3 brings the complete crawler infrastructure to the Context7 MCP Clone, enabling automated documentation collection, parsing, and indexing from multiple sources.

## Implemented Components

### 1. Redis-Based Rate Limiting ✅

**Files Created:**
- `packages/backend-api/src/modules/rate-limiting/rate-limiting.service.ts`
- `packages/backend-api/src/modules/rate-limiting/rate-limiting.module.ts`
- `packages/backend-api/src/modules/rate-limiting/rate-limit.guard.ts`

**Features:**
- Tiered rate limiting (Free: 50 rpm/1000 rpd, Pro: 500 rpm/50k rpd, Enterprise: 5000 rpm/1M rpd)
- Redis-backed counters with minute and day windows
- Atomic operations using Redis pipelines
- Global guard applied to all API endpoints
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Automatic rate limit reset based on time windows

**Integration:**
- Rate limiting module imported in `app.module.ts`
- Rate limiting guard registered globally in `main.ts`
- Respects user tier from JWT tokens
- Throws `TooManyRequestsException` when limits exceeded

### 2. BullMQ Job Queue Infrastructure ✅

**Files Created:**
- `packages/crawler-engine/src/queue/job-queue.ts`

**Features:**
- Queue-based job management using BullMQ
- Support for priority-based job scheduling
- Configurable concurrency (3 parallel workers by default)
- Job retry with exponential backoff (3 attempts)
- Job status tracking and monitoring
- Queue statistics (waiting, active, completed, failed, delayed counts)
- Old job cleanup functionality
- Graceful worker and queue shutdown

**Architecture:**
- Uses Redis DB 2 for queue isolation
- Supports custom job processors via `registerWorker()`
- Job history preserved for debugging
- Comprehensive logging of job lifecycle

### 3. GitHub Crawler Implementation ✅

**Files Created:**
- `packages/crawler-engine/src/crawlers/github-crawler.ts`

**Features:**
- Repository metadata extraction (stars, description, tags)
- README file crawling
- package.json extraction (NPM projects)
- Documentation files from `docs/`, `doc/`, `website/` directories
- Example files from `examples/`, `example/`, `samples/`, `demo/` directories
- Git tag/version detection with semantic versioning filtering
- Rate-limited API calls with token support
- Progress tracking for long-running crawls

**Capabilities:**
- Parse full names (owner/repo format)
- Recursively traverse repository structure
- Extract up to 50 files per directory
- Fetch file contents as Base64-decoded UTF-8
- Handle HTTP errors gracefully
- Extract latest 10 versions from git tags

### 4. Documentation Site Scraper ✅

**Files Created:**
- `packages/crawler-engine/src/crawlers/docs-scraper.ts`

**Features:**
- Multi-page documentation site scraping
- Respectful rate limiting (500ms delay between requests)
- Internal link following with depth control
- Page type classification (api, guide, example, other)
- Topic/keyword extraction from headings and meta tags
- Configurable max pages (default 200) and depth (default 5)
- User-Agent identification
- Content deduplication

**Page Analysis:**
- Extract main content (skips nav, footer, sidebars)
- Title extraction from h1 and title tags
- Automatic documentation URL detection
- Support for common doc platforms (Docusaurus, VitePress, GitBook patterns)

### 5. Markdown Parser Implementation ✅

**Files Created:**
- `packages/crawler-engine/src/parsers/markdown-parser.ts`

**Features:**
- Unified markdown processing with remark plugins
- Support for GitHub-Flavored Markdown (GFM)
- YAML/TOML frontmatter extraction
- Heading extraction with slug generation
- Code block identification and extraction
- Automatic topic extraction from headings
- Description extraction from first paragraph
- Table of contents generation
- Smart content chunking (default 2000 chars/chunk)

**Code Example Extraction:**
- Identify code blocks with language specification
- Extract context from surrounding text
- Generate searchable descriptions
- Classify difficulty levels

### 6. Code Extraction Engine ✅

**Files Created:**
- `packages/crawler-engine/src/parsers/code-extractor.ts`

**Features:**
- Code example extraction from mixed content
- Difficulty classification (beginner/intermediate/advanced)
- Function/class/import detection
- Language-specific analysis:
  - JavaScript/TypeScript patterns
  - Python patterns
- Code complexity analysis
- Use case grouping
- Context preservation for better searchability

**Analyzed Metrics:**
- Lines of code
- Async/Promise usage
- Class/Interface definitions
- Nesting depth
- Pattern matching for APIs

### 7. Crawler Engine Orchestrator ✅

**Files Created:**
- `packages/crawler-engine/src/index.ts`

**Features:**
- Main orchestration layer
- Processor registration system
- Job queueing interface
- Queue monitoring
- Graceful shutdown handling
- SIGTERM signal handling

**Exported Components:**
- All crawler classes (GitHubCrawler, DocsScraper)
- All parser classes (MarkdownParser, CodeExtractor)
- Job queue manager and types
- Type definitions for integration

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│      Crawler Engine (index.ts)          │
│   - Orchestration                       │
│   - Job queue management                │
│   - Processor coordination               │
└────────────┬───────────────┬────────────┘
             │               │
     ┌───────▼──────┐   ┌────▼────────┐
     │ Job Queue    │   │ Processors  │
     │ (BullMQ)     │   │ Registry    │
     │ Redis DB 2   │   │             │
     └───────┬──────┘   └────┬────────┘
             │               │
     ┌───────┴───────────────┴──────┐
     │                              │
┌────▼──────┐  ┌────────────────┐  │
│  GitHub   │  │ Docs Scraper   │  │
│  Crawler  │  │  (Web Scraper) │  │
│ (Octokit) │  │   (Cheerio)    │  │
└────┬──────┘  └────────┬───────┘  │
     │                  │          │
     └────────┬─────────┘          │
              │                    │
     ┌────────▼──────────────┐     │
     │   Parsers Layer       │     │
     │  ┌──────────────────┐ │     │
     │  │ Markdown Parser  │ │     │
     │  │ Code Extractor   │ │     │
     │  └──────────────────┘ │     │
     └───────────┬──────────┘      │
                 │                 │
         ┌───────▼─────────┐       │
         │ Structured Data │       │
         │ (to API)        │       │
         └─────────────────┘       │
                                   │
                    Backend API ───┘
                  (rate-limiting
                   + storage)
```

## Data Flow

```
1. Queue a library:
   CrawlJobData → JobQueue.addJob() → BullMQ

2. Process job:
   BullMQ → Worker → GitHubCrawler/DocsScraper → CrawlJobResult

3. Parse content:
   Raw Content → MarkdownParser → ParsedMarkdown
   Raw Content → CodeExtractor → CodeExample[]

4. Store results:
   ParsedData → Backend API → PostgreSQL
```

## Configuration

### Environment Variables
```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# GitHub Token (optional, increases API limits)
GITHUB_TOKEN=ghp_xxxxx

# Crawler Settings
CRAWLER_MAX_PAGES=200
CRAWLER_MAX_DEPTH=5
CRAWLER_DELAY_MS=500
```

### Rate Limiting Tiers
- **Free**: 50 requests/minute, 1,000/day
- **Pro**: 500 requests/minute, 50,000/day
- **Enterprise**: 5,000 requests/minute, 1,000,000/day

## Key Features

### ✅ Atomic Operations
- Redis pipelines for consistent rate limiting
- BullMQ job transactions for reliability

### ✅ Error Handling
- Graceful fallbacks when sources unavailable
- Exponential backoff on job failures
- Comprehensive error logging

### ✅ Performance
- Parallel job processing (3 concurrent by default)
- Efficient content parsing with remark/unified
- Lazy loading of dependencies

### ✅ Monitoring
- Job status tracking
- Queue statistics API
- Detailed logging throughout pipeline

### ✅ Respectful Crawling
- Rate limiting between requests (500ms)
- User-Agent identification
- No aggressive crawling patterns
- Respects robots.txt patterns (future)

## Integration Points

1. **Backend API**
   - Rate limiting module imports Redis
   - Crawl results stored via API endpoints
   - Job status queryable via backend

2. **MCP Server**
   - Tools return crawled documentation
   - resolve-library-id uses crawled metadata
   - get-library-docs queries indexed content

3. **Database**
   - documentation_pages table stores parsed content
   - code_examples table stores extracted code
   - library_versions tracks crawl status

## Testing the Crawler

### Start the crawler engine:
```bash
cd packages/crawler-engine
pnpm dev
```

### Queue a crawl job:
```typescript
import CrawlerEngine, { CrawlJobData } from './src/index';

const engine = new CrawlerEngine();
await engine.initialize();
await engine.registerProcessors();

const job: CrawlJobData = {
  libraryId: '/facebook/react',
  libraryName: 'React',
  fullName: 'facebook/react',
  version: '18.2.0',
  repositoryUrl: 'https://github.com/facebook/react',
  crawlType: 'full',
};

const jobId = await engine.queueCrawl(job);
console.log('Job queued:', jobId);
```

### Check job status:
```typescript
const status = await engine.getJobStatus(jobId);
console.log('Job state:', status?.state);
console.log('Progress:', status?.progress);
```

## Next Steps (Phase 4)

The crawler infrastructure is now complete and ready for:

1. **Web UI Implementation** (Grafana-themed)
   - Landing page with purple gradients
   - Documentation browser interface
   - Admin dashboard

2. **Initial Data Seeding**
   - Queue crawl jobs for popular libraries
   - Populate database with real content
   - Validate search quality

## File Statistics

**New Files Created:** 8
- `rate-limiting.service.ts` (114 lines)
- `rate-limiting.module.ts` (29 lines)
- `rate-limit.guard.ts` (79 lines)
- `job-queue.ts` (232 lines)
- `github-crawler.ts` (372 lines)
- `docs-scraper.ts` (323 lines)
- `markdown-parser.ts` (333 lines)
- `code-extractor.ts` (376 lines)

**Total Phase 3 Code:** ~1,858 lines of TypeScript

**Modified Files:** 2
- `app.module.ts` (added RateLimitingModule import)
- `main.ts` (added global rate limiting guard)

## Verification Checklist

- ✅ Rate limiting service working with Redis
- ✅ Job queue initialized and workers registered
- ✅ GitHub crawler extracting content correctly
- ✅ Documentation scraper handling websites
- ✅ Markdown parser extracting structure
- ✅ Code extractor identifying examples
- ✅ All TypeScript types properly defined
- ✅ Error handling in place
- ✅ Logging throughout pipeline
- ✅ Configuration via environment variables

## Status

**Phase 3 Complete**: 15/15 tasks finished ✅

All core crawler infrastructure is now in place and ready for:
- Data seeding with real libraries
- Web UI development
- Production testing

---

**Ready for Phase 4: Web UI & Landing Page**
