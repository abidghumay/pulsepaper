export async function summarizeWithGemini(
  title: string,
  abstract: string,
  apiKey: string
): Promise<string> {
  const prompt = `You are a scientific and technical research analyst. Provide a concise, highly readable executive summary of the following research paper/article in clean markdown.

Format with these exact sections:
### Core Contributions
- (2 bullet points on what was built or discovered)

### Key Methodology & Findings
- (2 bullet points on empirical results or technical methods)

### Practical Implications
- (1 bullet point on real-world impact)

Title: ${title}
Abstract/Content:
${abstract}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
        temperature: 0.2,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No candidate content received from Gemini API');
  }

  return text.trim();
}
