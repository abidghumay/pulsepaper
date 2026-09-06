import { ConfiguredSource } from './types.js';

export const DEFAULT_SOURCES: ConfiguredSource[] = [
  {
    id: 'arxiv-ai',
    name: 'arXiv cs.AI (Artificial Intelligence)',
    url: 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=15',
    category: 'AI & Machine Learning',
    type: 'arxiv',
    enabled: true,
    description: 'Latest research papers and preprints on artificial intelligence from arXiv.'
  },
  {
    id: 'arxiv-lg',
    name: 'arXiv cs.LG (Machine Learning)',
    url: 'http://export.arxiv.org/api/query?search_query=cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=15',
    category: 'AI & Machine Learning',
    type: 'arxiv',
    enabled: true,
    description: 'Latest research papers on machine learning architectures, models, and empirical methods.'
  },
  {
    id: 'arxiv-cr',
    name: 'arXiv cs.CR (Cryptography & Security)',
    url: 'http://export.arxiv.org/api/query?search_query=cat:cs.CR&sortBy=submittedDate&sortOrder=descending&max_results=15',
    category: 'Computer Science',
    type: 'arxiv',
    enabled: true,
    description: 'Security protocols, cryptography research, and distributed systems vulnerabilities.'
  },
  {
    id: 'hackernews',
    name: 'Hacker News Frontpage',
    url: 'https://hnrss.org/frontpage',
    category: 'Computer Science',
    type: 'rss',
    enabled: true,
    description: 'Top trending articles, tools, and discussions from the hacker community.'
  },
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'Tech News',
    type: 'rss',
    enabled: true,
    description: 'Industry coverage, breakthrough announcements, and funding in artificial intelligence.'
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    category: 'Systems & Hardware',
    type: 'rss',
    enabled: true,
    description: 'In-depth reporting on emerging technologies, computing, and biotechnology.'
  }
];
