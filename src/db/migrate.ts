import fs from 'fs';
import path from 'path';
import { getDbClient } from './client.js';

export async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const client = await getDbClient();
  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await client.exec(schemaSql);
  console.log('[Migration] Database tables and indexes verified successfully.');
}

// Run directly if invoked as script
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(async () => {
      console.log('[Migration] Migration complete.');
      const client = await getDbClient();
      await client.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration Error]', err);
      process.exit(1);
    });
}
