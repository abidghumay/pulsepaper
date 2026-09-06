import { generateSummary } from './service.js';

async function testSummarize() {
  console.log('--- STARTING SUMMARIZATION VERIFICATION (Phase 8) ---');

  const title = 'Attention Is All You Need';
  const abstract = `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.`;

  console.log('Generating summary for abstract...');
  const summary = await generateSummary(title, abstract);
  console.log('Generated Summary Output:');
  console.log('----------------------------------------------------');
  console.log(summary);
  console.log('----------------------------------------------------');

  if (!summary || summary.length < 20) {
    throw new Error('Summarization returned empty or truncated output');
  }

  console.log('✓ Summarization verified successfully.');
}

testSummarize().catch((err) => {
  console.error('SUMMARIZATION TEST FAILED:', err);
  process.exit(1);
});
