export interface Article {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  url: string;
  author: string;
  summary: string;
  content?: string;
  category: string;
  published_at: string;
  created_at?: string;
  read_status: boolean;
  saved_status: boolean;
  ai_summary?: string | null;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
  last_fetched_at?: string | null;
}

export type TabFilter = 'all' | 'unread' | 'saved';
export type SortOption = 'newest' | 'oldest' | 'title';
