export async function extractArticleTextFromUrl(url: string, timeoutMs = 8000): Promise<string> {
  if (!url || !url.startsWith('http')) return '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timer);

    if (!res.ok) return '';
    const html = await res.text();

    // 1. Extract meta description
    const metaMatch =
      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    const metaDesc = metaMatch ? metaMatch[1].trim() : '';

    // 2. Remove script, style, nav, footer, header, svg tags
    const clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ');

    // 3. Extract paragraph tags
    const paragraphs: string[] = [];
    const pMatches = clean.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    for (const p of pMatches) {
      const text = p
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length > 25) {
        paragraphs.push(text);
      }
    }

    let extracted = paragraphs.join('\n\n');

    // If paragraphs were sparse, strip tags from remaining clean body
    if (extracted.length < 150) {
      extracted = clean
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (metaDesc && !extracted.includes(metaDesc)) {
      extracted = `${metaDesc}\n\n${extracted}`;
    }

    return extracted.slice(0, 4500).trim();
  } catch (err: any) {
    console.warn(`[Page Extractor] Could not fetch content from ${url}:`, err?.message || err);
    return '';
  }
}
