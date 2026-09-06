import { generateSummary } from './service.js';

async function testSummarize() {
  console.log('--- STARTING SUMMARIZATION VERIFICATION ---');

  const title = 'Isar Aerospace reaches orbit and deploys payloads on second flight';
  const abstract = `By enabling access to space, we contribute to humanity's progress and our planet's sustainable technological and economic development. Select your journey to orbit and launch with us.

And&oslash;ya, 5 September 2026 &ndash; Today, Isar Aerospace became the first commercial space company from Europe to successfully deliver satellites into orbit, on what was only its second flight. Mission &lsquo;Onward and Upward&rsquo; lifted off from Isar Aerospace&rsquo;s dedicated launch complex at And&oslash;ya Space in Norway at 10:12 pm CEST, deploying payloads in orbit.

Next &lsquo;Spectrum&rsquo; launch vehicles already in production Isar Aerospace's model is designed to build scalable launch capabilities.

Press Contact Isar Aerospace Franziska Kegel`;

  console.log('Generating summary for Isar Aerospace...');
  const result = await generateSummary(title, abstract);
  console.log('Generated Summary Output (Provider:', result.provider, result.model || '', '):');
  console.log('----------------------------------------------------');
  console.log(result.summary);
  console.log('----------------------------------------------------');

  if (/&[a-z0-9#]+;/i.test(result.summary) || result.summary.includes('Franziska Kegel')) {
    throw new Error('Summary still contains unescaped HTML entities or PR contacts!');
  }

  const lines = result.summary.split('\n').filter((l) => l.trim().length > 0);
  console.log(`Summary line count: ${lines.length} lines`);

  if (lines.length < 10) {
    throw new Error(`Summary is too short! Got ${lines.length} lines, expected at least 10.`);
  }

  console.log('✓ Summarization verified successfully.');
}

testSummarize().catch((err) => {
  console.error('SUMMARIZATION TEST FAILED:', err);
  process.exit(1);
});

