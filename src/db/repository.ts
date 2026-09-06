import { getDbClient } from './client.js';

export interface ArticleRecord {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  url: string;
  author: string;
  summary: string;
  content: string | null;
  category: string;
  published_at: string;
  read_status: boolean;
  saved_status: boolean;
  ai_summary: string | null;
  created_at: string;
}

export interface SourceRecord {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  last_fetched_at: string | null;
  created_at: string;
}

export interface ArticleFilterOptions {
  tab?: 'all' | 'unread' | 'saved';
  category?: string;
  sourceId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'title';
  limit?: number;
  offset?: number;
}

export async function getArticles(options: ArticleFilterOptions = {}): Promise<ArticleRecord[]> {
  const client = await getDbClient();
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (options.tab === 'unread') {
    conditions.push(`read_status = false`);
  } else if (options.tab === 'saved') {
    conditions.push(`saved_status = true`);
  }

  if (options.category && options.category !== 'all') {
    conditions.push(`category = $${paramIdx++}`);
    params.push(options.category);
  }

  if (options.sourceId && options.sourceId !== 'all') {
    conditions.push(`source_id = $${paramIdx++}`);
    params.push(options.sourceId);
  }

  if (options.search && options.search.trim()) {
    conditions.push(`(title ILIKE $${paramIdx} OR summary ILIKE $${paramIdx} OR author ILIKE $${paramIdx})`);
    params.push(`%${options.search.trim()}%`);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderClause = 'ORDER BY published_at DESC';
  if (options.sort === 'oldest') {
    orderClause = 'ORDER BY published_at ASC';
  } else if (options.sort === 'title') {
    orderClause = 'ORDER BY title ASC';
  }

  const limitClause = options.limit ? `LIMIT $${paramIdx++}` : '';
  if (options.limit) params.push(options.limit);

  const offsetClause = options.offset ? `OFFSET $${paramIdx++}` : '';
  if (options.offset) params.push(options.offset);

  const query = `
    SELECT * FROM articles
    ${whereClause}
    ${orderClause}
    ${limitClause}
    ${offsetClause}
  `;

  const result = await client.query<ArticleRecord>(query, params);
  return result.rows;
}

export async function getArticleById(id: string): Promise<ArticleRecord | null> {
  const client = await getDbClient();
  const res = await client.query<ArticleRecord>('SELECT * FROM articles WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function toggleReadStatus(id: string): Promise<ArticleRecord | null> {
  const client = await getDbClient();
  const res = await client.query<ArticleRecord>(
    'UPDATE articles SET read_status = NOT read_status WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
}

export async function toggleSavedStatus(id: string): Promise<ArticleRecord | null> {
  const client = await getDbClient();
  const res = await client.query<ArticleRecord>(
    'UPDATE articles SET saved_status = NOT saved_status WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
}

export async function updateArticleSummary(id: string, aiSummary: string): Promise<ArticleRecord | null> {
  const client = await getDbClient();
  const res = await client.query<ArticleRecord>(
    'UPDATE articles SET ai_summary = $1 WHERE id = $2 RETURNING *',
    [aiSummary, id]
  );
  return res.rows[0] || null;
}

export async function upsertArticle(article: {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  url: string;
  author?: string;
  summary: string;
  content?: string;
  category: string;
  published_at: Date | string;
}): Promise<boolean> {
  const client = await getDbClient();
  const res = await client.query(
    `INSERT INTO articles (id, source_id, source_name, title, url, author, summary, content, category, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (url) DO NOTHING
     RETURNING id`,
    [
      article.id,
      article.source_id,
      article.source_name,
      article.title,
      article.url,
      article.author || 'Unknown',
      article.summary,
      article.content || null,
      article.category,
      new Date(article.published_at)
    ]
  );
  return res.rows.length > 0;
}

export async function getAllSources(): Promise<SourceRecord[]> {
  const client = await getDbClient();
  const res = await client.query<SourceRecord>('SELECT * FROM sources ORDER BY name ASC');
  return res.rows;
}

export async function upsertSource(source: {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled?: boolean;
}): Promise<void> {
  const client = await getDbClient();
  await client.query(
    `INSERT INTO sources (id, name, url, category, enabled)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE
     SET name = EXCLUDED.name,
         url = EXCLUDED.url,
         category = EXCLUDED.category`,
    [source.id, source.name, source.url, source.category, source.enabled ?? true]
  );
}

export async function updateSourceFetchedTime(sourceId: string): Promise<void> {
  const client = await getDbClient();
  await client.query('UPDATE sources SET last_fetched_at = NOW() WHERE id = $1', [sourceId]);
}

export async function logIngestion(log: {
  source_id?: string;
  status: string;
  items_count: number;
  error_message?: string;
}): Promise<void> {
  const client = await getDbClient();
  await client.query(
    `INSERT INTO ingestion_logs (source_id, status, items_count, error_message)
     VALUES ($1, $2, $3, $4)`,
    [log.source_id || null, log.status, log.items_count, log.error_message || null]
  );
}
