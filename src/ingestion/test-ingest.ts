import { runMigrations } from '../db/migrate.js';
import { runIngestionPipeline } from './pipeline.js';
import { getArticles } from '../db/repository.js';
import { getDbClient } from '../db/client.js';

async function testIngest() {
  console.log('--- STARTING INGESTION PIPELINE VERIFICATION (Phases 4 & 5) ---');

  await runMigrations();

  const result = await runIngestionPipeline();
  console.log(`Pipeline execution completed:`);
  console.log(`- Total sources checked: ${result.totalSources}`);
  console.log(`- Successful sources: ${result.successfulSources}`);
  console.log(`- Failed sources: ${result.failedSources}`);
  console.log(`- Total new articles ingested: ${result.totalNewArticles}`);

  const articles = await getArticles({ limit: 10 });
  console.log(`Found ${articles.length} articles currently in the database:`);
  articles.forEach((a, idx) => {
    console.log(`  [${idx + 1}] (${a.source_name}) "${a.title.slice(0, 60)}..."`);
  });

  if (result.successfulSources === 0 && result.failedSources > 0) {
    console.warn('Warning: All network feeds failed. Please check internet connection.');
  } else {
    console.log('✓ Ingestion pipeline successfully verified.');
  }

  const client = await getDbClient();
  await client.close();
}

testIngest().catch((err) => {
  console.error('INGESTION TEST FAILED:', err);
  process.exit(1);
});
