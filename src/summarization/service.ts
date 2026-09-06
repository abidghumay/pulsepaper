import { summarizeWithGemini } from './gemini.js';
import { summarizeExtractive } from './fallback.js';

export async function generateSummary(title: string, contentOrAbstract: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      console.log('[Summarization] Utilizing Gemini 2.5 Flash API...');
      return await summarizeWithGemini(title, contentOrAbstract, apiKey);
    } catch (err: any) {
      console.warn('[Summarization Warning] Gemini API failed or rate-limited; falling back to extractive NLP:', err?.message || err);
      // Fallback
    }
  } else {
    console.log('[Summarization] GEMINI_API_KEY not configured; using high-accuracy extractive NLP summarizer.');
  }

  return summarizeExtractive(title, contentOrAbstract);
}
