import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { runMigrations } from '../db/migrate.js';
import {
  getArticles,
  getArticleById,
  toggleReadStatus,
  toggleSavedStatus,
  updateArticleSummary,
  getAllSources,
  upsertSource
} from '../db/repository.js';
import { runIngestionPipeline } from '../ingestion/pipeline.js';
import { generateSummary } from '../summarization/service.js';
import { initDailyScheduler } from '../scheduler/cron.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    timezone: process.env.CRON_TIMEZONE || 'Asia/Dhaka'
  });
});

// GET /api/articles
app.get('/api/articles', async (req: Request, res: Response) => {
  try {
    const { tab, category, sourceId, search, sort, limit, offset } = req.query;
    const articles = await getArticles({
      tab: tab as any,
      category: category as string,
      sourceId: sourceId as string,
      search: search as string,
      sort: sort as any,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0
    });
    res.json(articles);
  } catch (err: any) {
    console.error('[API Error] Failed to retrieve articles:', err);
    res.status(500).json({ error: 'Failed to retrieve articles' });
  }
});

// GET /api/articles/:id
app.get('/api/articles/:id', async (req: Request, res: Response) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err: any) {
    console.error('[API Error] Failed to retrieve article:', err);
    res.status(500).json({ error: 'Failed to retrieve article' });
  }
});

// POST /api/articles/:id/read
app.post('/api/articles/:id/read', async (req: Request, res: Response) => {
  try {
    const updated = await toggleReadStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('[API Error] Failed to toggle read status:', err);
    res.status(500).json({ error: 'Failed to toggle read status' });
  }
});

// POST /api/articles/:id/save
app.post('/api/articles/:id/save', async (req: Request, res: Response) => {
  try {
    const updated = await toggleSavedStatus(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('[API Error] Failed to toggle saved status:', err);
    res.status(500).json({ error: 'Failed to toggle saved status' });
  }
});

// POST /api/articles/:id/summarize
app.post('/api/articles/:id/summarize', async (req: Request, res: Response) => {
  try {
    const article = await getArticleById(req.params.id);
    const title = article ? article.title : (req.body.title || 'Untitled');
    const content = article ? (article.summary || article.content || '') : (req.body.summary || req.body.content || '');

    const summary = await generateSummary(title, content);

    if (article) {
      await updateArticleSummary(article.id, summary);
    }

    res.json({ summary });
  } catch (err: any) {
    console.error('[API Error] Failed to summarize article:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// GET /api/sources
app.get('/api/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await getAllSources();
    res.json(sources);
  } catch (err: any) {
    console.error('[API Error] Failed to retrieve sources:', err);
    res.status(500).json({ error: 'Failed to retrieve sources' });
  }
});

// POST /api/sources
app.post('/api/sources', async (req: Request, res: Response) => {
  try {
    const { id, name, url, category, enabled } = req.body;
    if (!id || !name || !url || !category) {
      return res.status(400).json({ error: 'id, name, url, and category are required' });
    }
    await upsertSource({ id, name, url, category, enabled });
    res.status(201).json({ success: true });
  } catch (err: any) {
    console.error('[API Error] Failed to add/update source:', err);
    res.status(500).json({ error: 'Failed to add source' });
  }
});

// POST /api/ingest (Manual Ingestion Trigger)
app.post('/api/ingest', async (_req: Request, res: Response) => {
  try {
    const result = await runIngestionPipeline();
    res.json({
      success: true,
      itemsIngested: result.totalNewArticles,
      result
    });
  } catch (err: any) {
    console.error('[API Error] Ingestion trigger failed:', err);
    res.status(500).json({ error: 'Ingestion failed', details: err?.message });
  }
});

// Serve frontend static build if present
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[Server] Serving static frontend build from ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Boot server
async function startServer() {
  try {
    // 1. Run migrations
    await runMigrations();

    // 2. Start 5:00 AM Asia/Dhaka scheduler
    initDailyScheduler();

    // 3. Listen
    app.listen(PORT, () => {
      console.log(`🚀 PulsePaper server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Fatal Server Startup Error]', err);
    process.exit(1);
  }
}

startServer();
