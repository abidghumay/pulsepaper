import { decodeHtmlEntities } from '../ingestion/htmlEntities.js';

export async function summarizeWithGemini(
  title: string,
  abstract: string,
  apiKey: string
): Promise<{ summary: string; modelUsed: string }> {
  // Strip any accidental wrapping quotes or spaces that users often paste into Render environment variables
  const cleanKey = (apiKey || '').trim().replace(/^["']|["']$/g, '').trim();
  if (!cleanKey) {
    throw new Error('GEMINI_API_KEY is empty or contains only quotation marks');
  }

  const cleanTitle = decodeHtmlEntities(title || 'Research Overview');
  const cleanAbstract = decodeHtmlEntities(abstract || '');

  const isThin =
    !cleanAbstract ||
    cleanAbstract.length < 150 ||
    cleanAbstract.includes('Article URL:') ||
    cleanAbstract.includes('Comments URL:');

  const contentContext = isThin
    ? `[Context Note: The source entry only provided the headline and link. Based on the technical subject ("${cleanTitle}"), synthesize a comprehensive, deeply knowledgeable technical brief explaining the technology, system architecture, engineering challenges, and practical significance.]`
    : `Article Content / Abstract:\n${cleanAbstract}`;

  const prompt = `You are a world-class scientific communicator, technical editor, and systems engineer.
Your task is to write a comprehensive, clear, and highly engaging executive brief for the technical release, scientific discovery, or research paper titled below.

MANDATORY RULES:
1. MINIMUM LENGTH: The summary MUST be at least 10 to 15 substantive lines. Do not produce brief, truncated, or lazy outputs.
2. ACCESSIBLE YET RIGOROUS: Write in clear, compelling English that any software engineer, tech executive, or researcher can understand at a glance. Avoid dry jargon dumps, but explain the real engineering substance.
3. ABSOLUTE PROHIBITION ON JUNK: Do not include PR contact info, names of PR spokespersons (e.g. Franziska Kegel), email addresses, phone numbers, HTML entity codes (like &ldquo;), or feed metadata (like Article URL, points, comments).
4. STRICT MARKDOWN FORMAT: Use the exact markdown sections below with their emojis:

### 📌 Executive Overview & Core Breakthrough
Write 3 to 4 engaging, well-crafted sentences summarizing the core breakthrough, what was accomplished, the key parties involved, and why this milestone matters today.

### ⚙️ How It Works & Key Innovations
Provide 3 to 4 detailed, substantive bullet points breaking down the engineering mechanisms, architecture, or research methodology:
- **Core Technology & Architecture**: Specific details on how the system, propulsion, algorithm, or hardware is designed.
- **Operational Execution & Deployment**: How it was tested, launched, trained, or deployed in practice.
- **Performance & Key Metrics**: Notable specifications, payload capacity, efficiency gains, or benchmark results.

### 🚀 Real-World Impact & Industry Significance
Provide 2 to 3 detailed bullet points explaining why this is a game-changer:
- **Market & Ecosystem Influence**: How this alters the competitive landscape, unlocks new capabilities, or reduces costs/barriers to entry.
- **Practical Utility**: How engineers, researchers, or organizations can benefit from or build upon this work.

### 💡 Key Takeaways & What's Next
Provide 2 forward-looking bullet points highlighting the immediate implications and upcoming milestones or next production phases.

Title: ${cleanTitle}
${contentContext}
`;

  // Candidate models in order of stability and quota availability
  const candidateModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000
          }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}: ${errBody.slice(0, 200)}`);
        lastError = new Error(`HTTP ${response.status} on ${model}: ${errBody.slice(0, 150)}`);
        continue;
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 100) {
        console.log(`[Gemini API] Successfully generated 10+ line summary using ${model}`);
        return { summary: text.trim(), modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Network or fetch error with model ${model}:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content');
}
