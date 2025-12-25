-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(100),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  rate_limit_rpm INTEGER NOT NULL DEFAULT 50,
  rate_limit_rpd INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- Libraries table
CREATE TABLE libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  full_name VARCHAR(500) NOT NULL UNIQUE,
  description TEXT,
  ecosystem VARCHAR(50) NOT NULL,
  homepage_url VARCHAR(500),
  repository_url VARCHAR(500),
  stars INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  benchmark_score INTEGER DEFAULT 0,
  reputation VARCHAR(20) DEFAULT 'medium' CHECK (reputation IN ('high', 'medium', 'low')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_crawled_at TIMESTAMP
);

CREATE INDEX idx_libraries_name ON libraries USING gin(name gin_trgm_ops);
CREATE INDEX idx_libraries_ecosystem ON libraries(ecosystem);
CREATE INDEX idx_libraries_active ON libraries(is_active);
CREATE INDEX idx_libraries_full_name ON libraries(full_name);

-- Library Versions table
CREATE TABLE library_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  git_tag VARCHAR(100),
  is_latest BOOLEAN DEFAULT false,
  release_date TIMESTAMP,
  documentation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (documentation_status IN ('pending', 'crawling', 'indexed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(library_id, version)
);

CREATE INDEX idx_library_versions_lib ON library_versions(library_id);
CREATE INDEX idx_library_versions_latest ON library_versions(library_id, is_latest);

-- Documentation Pages table
CREATE TABLE documentation_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_version_id UUID NOT NULL REFERENCES library_versions(id) ON DELETE CASCADE,
  source_type VARCHAR(20) NOT NULL,
  source_url TEXT NOT NULL,
  path TEXT,
  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'markdown',
  page_type VARCHAR(50),
  topics TEXT[],
  code_snippets INTEGER DEFAULT 0,
  search_vector tsvector,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_docs_lib_version ON documentation_pages(library_version_id);
CREATE INDEX idx_docs_topics ON documentation_pages USING gin(topics);
CREATE INDEX idx_docs_search ON documentation_pages USING gin(search_vector);
CREATE INDEX idx_docs_page_type ON documentation_pages(page_type);

-- Trigger for full-text search vector update
CREATE OR REPLACE FUNCTION update_docs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update_trigger
BEFORE INSERT OR UPDATE ON documentation_pages
FOR EACH ROW EXECUTE FUNCTION update_docs_search_vector();

-- Code Examples table
CREATE TABLE code_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documentation_page_id UUID REFERENCES documentation_pages(id) ON DELETE CASCADE,
  library_version_id UUID NOT NULL REFERENCES library_versions(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  topics TEXT[],
  context TEXT,
  file_path TEXT,
  line_number INTEGER,
  search_vector tsvector,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_code_lib_version ON code_examples(library_version_id);
CREATE INDEX idx_code_language ON code_examples(language);
CREATE INDEX idx_code_topics ON code_examples USING gin(topics);
CREATE INDEX idx_code_search ON code_examples USING gin(search_vector);

-- Trigger for code examples full-text search
CREATE OR REPLACE FUNCTION update_code_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.code, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER code_tsvector_update_trigger
BEFORE INSERT OR UPDATE ON code_examples
FOR EACH ROW EXECUTE FUNCTION update_code_search_vector();

-- Crawl Jobs table
CREATE TABLE crawl_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_version_id UUID REFERENCES library_versions(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  pages_crawled INTEGER DEFAULT 0,
  pages_indexed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_lib_version ON crawl_jobs(library_version_id);
CREATE INDEX idx_crawl_jobs_created ON crawl_jobs(created_at);

-- API Usage table
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  library_id UUID REFERENCES libraries(id) ON DELETE SET NULL,
  request_count INTEGER DEFAULT 1,
  response_time_ms INTEGER,
  status_code INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_usage_api_key ON api_usage(api_key_id, date);
CREATE INDEX idx_usage_timestamp ON api_usage(timestamp);
CREATE INDEX idx_usage_date ON api_usage(date);

-- Materialized view for popular libraries
CREATE MATERIALIZED VIEW popular_libraries AS
SELECT
  l.id,
  l.name,
  l.full_name,
  l.ecosystem,
  l.stars,
  COUNT(DISTINCT au.api_key_id) as unique_users,
  COALESCE(SUM(au.request_count), 0) as total_requests,
  MAX(au.timestamp) as last_requested
FROM libraries l
LEFT JOIN api_usage au ON l.id = au.library_id
GROUP BY l.id, l.name, l.full_name, l.ecosystem, l.stars;

CREATE INDEX idx_popular_libs_ecosystem ON popular_libraries(ecosystem);
CREATE UNIQUE INDEX idx_popular_libs_id ON popular_libraries(id);
