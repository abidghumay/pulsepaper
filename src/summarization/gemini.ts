export async function summarizeWithGemini(
  title: string,
  abstract: string,
  apiKey: string
): Promise<{ summary: string; modelUsed: string }> {
  const prompt = `You are a world-class scientific researcher and technical analyst. Provide an in-depth, exceptionally clear, and well-structured executive summary of the following research paper/article in clean GitHub-flavored markdown.

Your summary must be thorough, precise, and immediately valuable to an engineer or researcher. Avoid vague generalities. Capture the exact technical nuances, benchmarks, and breakthroughs.

Format your response with these exact sections:

### 📌 Core Thesis & TL;DR
A compelling 2-3 sentence overview capturing what was achieved and why it represents a notable development.

### 💡 The Problem & Context
What critical challenge, architectural bottleneck, or open research question does this work address? Why was existing technology insufficient?

### ⚙️ Key Technical Innovations & Methodology
- **Architecture / Method**: Specific technical description of the framework, algorithmic mechanism, or pipeline introduced.
- **Implementation Highlights**: Detailed breakdown of mathematical formulation, training dynamics, or data processing.
- **Optimization**: How inference latency, memory footprint, or scaling was addressed.

### 📊 Benchmark Results & Empirical Findings
- **Empirical Performance**: Exact metrics, accuracy numbers, latency gains, or parameter efficiency compared to prior baselines.
- **Key Discoveries**: Insights discovered from ablation studies, scaling behavior, or qualitative analysis.

### 🚀 Practical Applications & Trade-offs
- **Real-World Impact**: Concrete applications where engineers or researchers can deploy this technology.
- **Limitations**: Computational constraints, data dependencies, or remaining challenges.

Title: ${title}
Abstract / Content:
${abstract}
`;

  // Candidate models in order of priority (handles API version differences seamlessly)
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
        continue; // Try next candidate model
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        console.log(`[Gemini API] Successfully generated summary using ${model}`);
        return { summary: text.trim(), modelUsed: model };
      }
    } catch (err) {
      console.warn(`[Gemini API] Network/call error with model ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content');
}
