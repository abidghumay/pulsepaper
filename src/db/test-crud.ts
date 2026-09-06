import { runMigrations } from './migrate.js';
import {
  upsertSource,
  getAllSources,
  upsertArticle,
  getArticles,
  getArticleById,
  toggleReadStatus,
  toggleSavedStatus,
  updateArticleSummary
} from './repository.js';
import { getDbClient } from './client.js';

async function testCrud() {
  console.log('--- STARTING DATABASE & CRUD VERIFICATION (Phase 3) ---');

  // 1. Run migrations
  await runMigrations();
  console.log('✓ Migrations ran successfully.');

  // 2. Test Sources CRUD
  const testSource = {
    id: 'test-src-1',
    name: 'Test arXiv Feed',
    url: 'https://example.com/rss',
    category: 'Computer Science',
    enabled: true
  };
  await upsertSource(testSource);
  const sources = await getAllSources();
  const foundSource = sources.find((s) => s.id === 'test-src-1');
  if (!foundSource) throw new Error('Failed to retrieve upserted source');
  console.log('✓ Sources upsert and retrieve verified.');

  // 3. Test Articles CRUD & Deduplication
  const uniqueSuffix = Date.now();
  const articleId = `art-test-${uniqueSuffix}`;
  const articleUrl = `https://arxiv.org/abs/2403.99999-test-${uniqueSuffix}`;
  const testArticle = {
    id: articleId,
    source_id: 'test-src-1',
    source_name: 'Test arXiv Feed',
    title: 'Benchmarking Autonomous Agent Architecture',
    url: articleUrl,
    author: 'Ada Lovelace, Alan Turing',
    summary: 'A formal analysis of autonomous reasoning loops and deterministic consensus.',
    category: 'Computer Science',
    published_at: new Date().toISOString()
  };

  const insertedFirst = await upsertArticle(testArticle);
  if (!insertedFirst) throw new Error('Initial article insertion failed');
  console.log('✓ Article insertion verified.');

  // Duplicate insert test
  const insertedSecond = await upsertArticle(testArticle);
  if (insertedSecond) throw new Error('Duplicate URL should NOT be inserted twice');
  console.log('✓ Article deduplication (ON CONFLICT DO NOTHING) verified.');

  // 4. Test Read/Save toggles
  const readToggled = await toggleReadStatus(articleId);
  if (!readToggled || readToggled.read_status !== true) throw new Error('Read toggle to true failed');
  console.log('✓ Toggle read_status verified.');

  const savedToggled = await toggleSavedStatus(articleId);
  if (!savedToggled || savedToggled.saved_status !== true) throw new Error('Saved toggle to true failed');
  console.log('✓ Toggle saved_status verified.');

  // 5. Test AI Summary update
  const summarized = await updateArticleSummary(articleId, '### Summary\n- Key insight');
  if (!summarized || summarized.ai_summary !== '### Summary\n- Key insight') {
    throw new Error('Update AI summary failed');
  }
  console.log('✓ AI summary persistence verified.');

  // 6. Test Filtering
  const unreadArts = await getArticles({ tab: 'unread' });
  const hasReadInUnread = unreadArts.some((a) => a.id === articleId);
  if (hasReadInUnread) throw new Error('Read article showed up in unread query');
  console.log('✓ Filter queries verified.');

  console.log('--- ALL DATABASE & CRUD TESTS PASSED ---');
  const client = await getDbClient();
  await client.close();
}

testCrud().catch((err) => {
  console.error('DATABASE CRUD TEST FAILED:', err);
  process.exit(1);
});
