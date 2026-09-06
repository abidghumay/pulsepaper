import { summarizeWithGemini } from './gemini.js';
import { summarizeExtractive } from './fallback.js';
import { extractArticleTextFromUrl } from '../ingestion/pageExtractor.js';
import { decodeHtmlEntities } from '../ingestion/htmlEntities.js';

export interface SummaryResult {
  summary: string;
  provider: 'gemini' | 'extractive';
  model?: string;
  error?: string;
  extractedText?: string;
}

export async function generateSummary(
  title: string,
  contentOrAbstract: string,
  url?: string
): Promise<SummaryResult> {
  const cleanTitle = decodeHtmlEntities(title || 'Research Overview');
  let textToSummarize = decodeHtmlEntities(contentOrAbstract?.trim() || '');
  let extractedText: string | undefined;

  // If content is very thin, missing, or just a URL stub (common with Hacker News RSS), fetch the real article page!
  const isThinContent =
    !textToSummarize ||
    textToSummarize.length < 160 ||
    textToSummarize.includes('Article URL:') ||
    textToSummarize.includes('Comments URL:');

  if (isThinContent && url && url.startsWith('http')) {
    console.log(`[Summarization] Thin content detected (${textToSummarize.length} chars). Extracting real page text from ${url}...`);
    const pageText = await extractArticleTextFromUrl(url);
    if (pageText && pageText.length > 150) {
      console.log(`[Summarization] Successfully extracted ${pageText.length} characters from web page.`);
      textToSummarize = decodeHtmlEntities(pageText);
      extractedText = textToSummarize;
    }
  }

  // Strip wrapping quotes and whitespace from environment variable
  const rawKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '').trim() : '';

  if (apiKey && apiKey.length > 10) {
    try {
      console.log('[Summarization] Requesting AI summary via Google Gemini API...');
      const result = await summarizeWithGemini(cleanTitle, textToSummarize, apiKey);
      return {
        summary: result.summary,
        provider: 'gemini',
        model: result.modelUsed,
        extractedText
      };
    } catch (err: any) {
      console.error('[Summarization Error] Gemini API generation failed:', err?.message || err);
      // Fallback
      const fallbackText = summarizeExtractive(cleanTitle, textToSummarize);
      return {
        summary: fallbackText,
        provider: 'extractive',
        error: err?.message || 'Gemini API call failed',
        extractedText
      };
    }
  } else {
    console.log('[Summarization] GEMINI_API_KEY not configured or empty; using offline extractive NLP summarizer.');
    const fallbackText = summarizeExtractive(cleanTitle, textToSummarize);
    return {
      summary: fallbackText,
      provider: 'extractive',
      extractedText
    };
  }
}
