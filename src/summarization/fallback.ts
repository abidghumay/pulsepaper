// Offline Extractive NLP Summarizer (No external API or secrets required)

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'for', 'to', 'of', 'with',
  'by', 'as', 'that', 'this', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'but', 'if', 'we', 'they', 'our', 'their', 'from', 'it', 'its'
]);

function cleanMetadataJunk(text: string): string {
  return text
    .replace(/Article URL:\s*https?:\/\/[^\s]+/gi, '')
    .replace(/Comments URL:\s*https?:\/\/[^\s]+/gi, '')
    .replace(/Points:\s*\d+/gi, '')
    .replace(/#\s*Comments:\s*\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function summarizeExtractive(title: string, text: string): string {
  const cleanedText = cleanMetadataJunk(text || '');

  // If text was only metadata/links or too thin
  if (!cleanedText || cleanedText.length < 40) {
    return `### 📌 Overview\n- **Topic**: ${title}\n- **Summary**: This feed entry is an external technical release, discussion, or web project. The original RSS feed did not provide an article body or research abstract.\n- **Direct Link**: Use the **"Original"** button in the header bar above to view the full project and source code.`;
  }

  // Split into sentences
  const rawSentences = cleanedText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (rawSentences.length <= 2) {
    return `### 📌 Key Highlights\n- ${rawSentences.join('\n- ') || cleanedText}`;
  }

  // Count word frequencies
  const words = cleanedText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const frequencies: Record<string, number> = {};
  for (const w of words) {
    frequencies[w] = (frequencies[w] || 0) + 1;
  }

  // Score sentences
  const scored = rawSentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    let score = 0;
    for (const w of sWords) {
      if (frequencies[w]) {
        score += frequencies[w];
      }
    }
    if (index === 0) score *= 1.3;
    if (index === rawSentences.length - 1) score *= 1.2;

    return { sentence, score: score / (sWords.length || 1), index };
  });

  const topCount = Math.min(3, scored.length);
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  return `### 📌 Key Highlights\n- ${selected.join('\n- ')}`;
}
