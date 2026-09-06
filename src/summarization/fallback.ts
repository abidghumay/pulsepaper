// Offline Extractive NLP Summarizer (No external API or secrets required)

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'for', 'to', 'of', 'with',
  'by', 'as', 'that', 'this', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'but', 'if', 'we', 'they', 'our', 'their', 'from', 'it', 'its'
]);

export function summarizeExtractive(title: string, text: string): string {
  if (!text || text.trim().length === 0) {
    return `- **Overview**: ${title}\n- **Note**: No extended abstract available for summarization.`;
  }

  // Split into sentences
  const rawSentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (rawSentences.length <= 2) {
    return `### Key Takeaways\n- ${rawSentences.join('\n- ') || text}`;
  }

  // Count word frequencies
  const words = text
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
    // Boost first sentence and conclusion
    if (index === 0) score *= 1.3;
    if (index === rawSentences.length - 1) score *= 1.2;

    return { sentence, score: score / (sWords.length || 1), index };
  });

  // Pick top 3-4 sentences in original order
  const topCount = Math.min(3, scored.length);
  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  return `### Executive Highlights\n- ${selected.join('\n- ')}`;
}
