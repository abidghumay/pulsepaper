import { fetchWithTimeout } from './fetcher.js';
import { parseFeedXml } from './parser.js';
import { DEFAULT_SOURCES } from '../sources/defaultSources.js';
import {
  getAllSources,
  upsertSource,
  upsertArticle,
  updateSourceFetchedTime,
  logIngestion
} from '../db/repository.js';

export interface IngestionResult {
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalNewArticles: number;
  details: {
    sourceId: string;
    sourceName: string;
    status: 'success' | 'failed';
    newItemsCount: number;
    error?: string;
  }[];
}

export async function runIngestionPipeline(): Promise<IngestionResult> {
  console.log('[Ingestion] Starting paper & article ingestion pipeline...');

  // Ensure default sources are registered and up-to-date
  for (const s of DEFAULT_SOURCES) {
    await upsertSource(s);
  }
  const existingSources = await getAllSources();

  const enabledSources = existingSources.filter((s) => s.enabled);
  console.log(`[Ingestion] Found ${enabledSources.length} active sources to process.`);

  let totalNewArticles = 0;
  let successfulSources = 0;
  let failedSources = 0;
  const details: IngestionResult['details'] = [];

  for (const source of enabledSources) {
    console.log(`[Ingestion] Fetching: ${source.name} (${source.url})...`);
    let sourceNewCount = 0;

    try {
      const xmlData = await fetchWithTimeout(source.url, 12000);
      const items = await parseFeedXml(xmlData, source.id);

      for (const item of items) {
        const inserted = await upsertArticle({
          id: item.id,
          source_id: source.id,
          source_name: source.name,
          title: item.title,
          url: item.url,
          author: item.author,
          summary: item.summary,
          content: item.content,
          category: source.category,
          published_at: item.published_at
        });

        if (inserted) {
          sourceNewCount++;
        }
      }

      await updateSourceFetchedTime(source.id);
      await logIngestion({
        source_id: source.id,
        status: 'success',
        items_count: sourceNewCount
      });

      successfulSources++;
      totalNewArticles += sourceNewCount;
      details.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'success',
        newItemsCount: sourceNewCount
      });

      console.log(`[Ingestion] Successfully processed "${source.name}": ${sourceNewCount} new items.`);
    } catch (err: any) {
      failedSources++;
      const errMsg = err?.message || String(err);
      console.error(`[Ingestion Error] Failed to process "${source.name}":`, errMsg);

      await logIngestion({
        source_id: source.id,
        status: 'failed',
        items_count: 0,
        error_message: errMsg
      });

      details.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        newItemsCount: 0,
        error: errMsg
      });
      // Crucial: continue loop! One broken source NEVER stops the pipeline.
    }
  }

  console.log(`[Ingestion Pipeline Complete] Total new items: ${totalNewArticles}. Success: ${successfulSources}/${enabledSources.length}`);
  return {
    totalSources: enabledSources.length,
    successfulSources,
    failedSources,
    totalNewArticles,
    details
  };
}
