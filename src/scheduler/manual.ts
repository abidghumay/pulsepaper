import { runMigrations } from '../db/migrate.js';
import { runIngestionPipeline } from '../ingestion/pipeline.js';
import { getDbClient } from '../db/client.js';

async function main() {
  console.log('====================================================');
  console.log('       PULSEPAPER MANUAL INGESTION RUNNER           ');
  console.log('====================================================');

  try {
    // 1. Ensure migrations are in place
    await runMigrations();

    // 2. Execute pipeline
    const startTime = Date.now();
    const result = await runIngestionPipeline();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('----------------------------------------------------');
    console.log(`Ingestion Finished in ${duration}s`);
    console.log(`Sources processed: ${result.successfulSources} successful / ${result.failedSources} failed`);
    console.log(`New articles saved: ${result.totalNewArticles}`);
    console.log('----------------------------------------------------');
    console.table(
      result.details.map((d) => ({
        Source: d.sourceName,
        Status: d.status,
        'New Articles': d.newItemsCount,
        Error: d.error ? d.error.slice(0, 40) + '...' : 'None'
      }))
    );

    const client = await getDbClient();
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during manual ingestion:', err);
    process.exit(1);
  }
}

main();
