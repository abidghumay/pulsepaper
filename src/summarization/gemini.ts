export async function summarizeWithGemini(
  title: string,
  abstract: string,
  apiKey: string
): Promise<{ summary: string; modelUsed: string }> {
  const isThin =
    !abstract ||
    abstract.length < 150 ||
    abstract.includes('Article URL:') ||
    abstract.includes('Comments URL:');

  const contentContext = isThin
    ? `[Context Note: The source feed only provided the title and a link without extended body text. Based on this technical title ("${title}"), synthesize a thorough, knowledgeable technical brief on this project, architecture, or research topic.]`
    : `Abstract / Full Content:\n${abstract}`;

  const prompt = `You are a world-class scientific researcher and technical analyst. Provide an in-depth, exceptionally clear, and well-structured executive summary of the following research paper, engineering release, or technical project in clean GitHub-flavored markdown.

Your summary must be thorough, precise, and immediately valuable to an engineer or researcher. Avoid vague generic statements. Never output raw feed metadata like "Article URL" or "Points". Capture the technical substance, architecture, and real-world impact.

Format your response with these exact sections:

### 📌 Core Thesis & TL;DR
A compelling 2-3 sentence overview explaining what this project or paper accomplishes and why it is notable.

### 💡 The Problem & Context
What technical bottleneck, challenge, or motivation does this work address? Why is it relevant to the community?

### ⚙️ Key Technical Innovations & Architecture
- **Methodology & Framework**: Specific technical explanation of the approach, architecture, or engineering mechanisms involved.
- **Key Implementation Details**: How execution, data structures, compilation, or performance is handled.
- **Performance / Efficiency**: Notable optimization techniques or scaling characteristics.

### 📊 Practical Applications & Takeaways
- **Real-World Utility**: Where and how developers, researchers, or organizations can apply or test this.
- **Considerations & Constraints**: Hardware requirements, compatibility limits, or potential open questions.

Title: ${title}
${contentContext}
`;

  // Candidate models in order of priority
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}: ${errBody.slice(0, 150)}`);
        lastError = new Error(`HTTP ${response.status}: ${errBody}`);
        continue;
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        console.log(`[Gemini API] Successfully generated summary using ${model}`);
        return { summary: text.trim(), modelUsed: model };
      }
    } catch (err) {
      console.warn(`[Gemini API] Network error with model ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content');
}
