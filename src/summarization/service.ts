import { summarizeWithGemini } from './gemini.js';
import { summarizeExtractive } from './fallback.js';

export interface SummaryResult {
  summary: string;
  provider: 'gemini' | 'extractive';
  model?: string;
  error?: string;
}

export async function generateSummary(
  title: string,
  contentOrAbstract: string
): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (apiKey) {
    try {
      console.log('[Summarization] Requesting AI summary via Gemini API...');
      const result = await summarizeWithGemini(title, contentOrAbstract, apiKey);
      return {
        summary: result.summary,
        provider: 'gemini',
        model: result.modelUsed
      };
    } catch (err: any) {
      console.error('[Summarization Error] Gemini API generation failed:', err?.message || err);
      // Fallback
      const fallbackText = summarizeExtractive(title, contentOrAbstract);
      return {
        summary: fallbackText,
        provider: 'extractive',
        error: err?.message || 'Gemini API call failed'
      };
    }
  } else {
    console.log('[Summarization] GEMINI_API_KEY not configured; using offline extractive NLP summarizer.');
    const fallbackText = summarizeExtractive(title, contentOrAbstract);
    return {
      summary: fallbackText,
      provider: 'extractive'
    };
  }
}
