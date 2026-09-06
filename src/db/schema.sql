-- PostgreSQL Relational Schema for PulsePaper Dashboard

-- 1. Sources table
CREATE TABLE IF NOT EXISTS sources (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(1024) NOT NULL,
  category VARCHAR(128) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Articles table
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) PRIMARY KEY,
  source_id VARCHAR(64),
  source_name VARCHAR(255) NOT NULL,
  title VARCHAR(1024) NOT NULL,
  url VARCHAR(2048) UNIQUE NOT NULL,
  author TEXT DEFAULT 'Unknown',
  summary TEXT NOT NULL,
  content TEXT,
  category VARCHAR(128) NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  read_status BOOLEAN DEFAULT false,
  saved_status BOOLEAN DEFAULT false,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ingestion logs table
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id SERIAL PRIMARY KEY,
  source_id VARCHAR(64),
  status VARCHAR(32) NOT NULL,
  items_count INT DEFAULT 0,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_read ON articles(read_status);
CREATE INDEX IF NOT EXISTS idx_articles_saved ON articles(saved_status);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
