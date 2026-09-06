export interface ConfiguredSource {
  id: string;
  name: string;
  url: string;
  category: string;
  type: 'rss' | 'atom' | 'arxiv';
  enabled: boolean;
  description?: string;
}
