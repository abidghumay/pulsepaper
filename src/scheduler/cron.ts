import cron, { ScheduledTask } from 'node-cron';
import { runIngestionPipeline } from '../ingestion/pipeline.js';

let cronTask: ScheduledTask | null = null;

export function initDailyScheduler(): ScheduledTask {
  const cronSchedule = process.env.CRON_SCHEDULE || '0 5 * * *';
  const cronTimezone = process.env.CRON_TIMEZONE || 'Asia/Dhaka';

  console.log(`[Scheduler] Initializing automated ingestion cron job at "${cronSchedule}" (Timezone: ${cronTimezone})`);

  cronTask = cron.schedule(
    cronSchedule,
    async () => {
      console.log(`[Scheduler] ⏰ Scheduled trigger initiated at ${new Date().toISOString()} (${cronTimezone})`);
      try {
        const result = await runIngestionPipeline();
        console.log(`[Scheduler] Daily ingestion completed successfully. Ingested ${result.totalNewArticles} new articles.`);
      } catch (err) {
        console.error('[Scheduler Error] Daily ingestion job encountered an error:', err);
      }
    },
    {
      scheduled: true,
      timezone: cronTimezone
    }
  );

  return cronTask;
}

export function stopDailyScheduler() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[Scheduler] Cron job stopped.');
  }
}
