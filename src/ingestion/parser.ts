import Parser from 'rss-parser';

export interface ParsedItem {
  id: string;
  title: string;
  url: string;
  author: string;
  summary: string;
  content?: string;
  published_at: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['author', 'rawAuthor'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

// Strip HTML tags and entities
export function stripHtml(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAuthor(rawItem: any): string {
  const candidate = rawItem.creator || rawItem.rawAuthor || rawItem.author;
  if (!candidate) return 'Unknown Author';

  if (typeof candidate === 'string') {
    const cleaned = stripHtml(candidate);
    return cleaned || 'Unknown Author';
  }

  if (Array.isArray(candidate)) {
    const names = candidate
      .map((c) => (typeof c === 'string' ? stripHtml(c) : stripHtml(c?.name || c?._ || '')))
      .filter(Boolean);
    return names.join(', ') || 'Unknown Author';
  }

  if (typeof candidate === 'object') {
    if (candidate.name) return stripHtml(String(candidate.name));
    if (candidate._) return stripHtml(String(candidate._));
  }

  return 'Unknown Author';
}

export async function parseFeedXml(xmlString: string, sourcePrefix: string): Promise<ParsedItem[]> {
  const feed = await parser.parseString(xmlString);
  const items: ParsedItem[] = [];

  for (let i = 0; i < (feed.items || []).length; i++) {
    const raw = feed.items[i];
    try {
      // URL is strictly required
      const url = (raw.link || raw.guid || (raw as any).id || '').trim();
      if (!url || !url.startsWith('http')) {
        continue;
      }

      // Title cleanup
      let title = stripHtml(typeof raw.title === 'string' ? raw.title : '').trim();
      if (!title) {
        title = 'Untitled Publication';
      }
      // Clean arXiv title prefixes if any
      title = title.replace(/^arxiv:\s*[\d\.]+\s*:\s*/i, '');

      // Author extraction (handles string, array of objects, single object)
      const author = extractAuthor(raw);

      // Summary cleanup
      let summary = stripHtml(
        raw.contentSnippet || raw.summary || raw.content || (raw as any).contentEncoded || ''
      ).trim();
      if (!summary) {
        summary = 'No abstract or description provided.';
      }
      if (summary.length > 1500) {
        summary = summary.substring(0, 1500) + '...';
      }

      // Date parsing with fallback to current time
      let published_at = new Date().toISOString();
      if (raw.pubDate || raw.isoDate || (raw as any).published) {
        const dateStr = raw.pubDate || raw.isoDate || (raw as any).published;
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          published_at = parsedDate.toISOString();
        }
      }

      // Create unique deterministic ID based on URL
      const cleanUrl = url.split('#')[0].replace(/\/+$/, '');
      const hashStr = Buffer.from(cleanUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-16);
      const id = `${sourcePrefix}-${hashStr}-${Date.now().toString(36).slice(-4)}`;

      items.push({
        id,
        title,
        url: cleanUrl,
        author,
        summary,
        content: raw.content || (raw as any).contentEncoded || null,
        published_at
      });
    } catch (itemErr) {
      console.warn(`[Feed Parser] Skipped malformed item:`, itemErr);
    }
  }

  return items;
}
