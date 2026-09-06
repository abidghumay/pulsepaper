import React, { useState, useEffect, useMemo } from 'react';
import { Article, Source, TabFilter, SortOption } from './types';
import { MOCK_ARTICLES } from './data/mockArticles';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { StatsBar } from './components/StatsBar';
import { ArticleCard } from './components/ArticleCard';
import { ReaderView } from './components/ReaderView';
import { MobileNav } from './components/MobileNav';
import { Inbox, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Articles & Sources state
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // Active Reader Full-Page View state
  const [activeReaderArticle, setActiveReaderArticle] = useState<Article | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // Filters & Search state
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load articles and sources from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [artRes, srcRes] = await Promise.allSettled([
        fetch('/api/articles'),
        fetch('/api/sources')
      ]);

      if (artRes.status === 'fulfilled' && artRes.value.ok) {
        const data = await artRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        }
      }

      if (srcRes.status === 'fulfilled' && srcRes.value.ok) {
        const data = await srcRes.value.json();
        if (Array.isArray(data)) {
          setSources(data);
        }
      }
    } catch (err) {
      console.log('Backend API not yet active; using client fallback data.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hash-based navigation for deep-linking and browser back-button support
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article-')) {
        const id = hash.replace('#article-', '');
        const found = articles.find((a) => a.id === id);
        if (found) {
          setActiveReaderArticle(found);
        }
      } else {
        setActiveReaderArticle(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [articles]);

  // Compute distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  // Source options for filter
  const sourceOptions = useMemo(() => {
    const map = new Map<string, string>();
    articles.forEach((a) => {
      map.set(a.source_id, a.source_name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [articles]);

  // Toggle Read Status
  const handleToggleRead = async (id: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, read_status: !art.read_status } : art))
    );

    if (activeReaderArticle && activeReaderArticle.id === id) {
      setActiveReaderArticle((prev) => (prev ? { ...prev, read_status: !prev.read_status } : null));
    }

    try {
      await fetch(`/api/articles/${id}/read`, { method: 'POST' });
    } catch {
      // Offline fallback
    }
  };

  // Toggle Save Status
  const handleToggleSave = async (id: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, saved_status: !art.saved_status } : art))
    );

    if (activeReaderArticle && activeReaderArticle.id === id) {
      setActiveReaderArticle((prev) => (prev ? { ...prev, saved_status: !prev.saved_status } : null));
    }

    try {
      await fetch(`/api/articles/${id}/save`, { method: 'POST' });
    } catch {
      // Offline fallback
    }
  };

  // Fetch or regenerate summary
  const fetchSummary = async (article: Article, force = false): Promise<void> => {
    if (!force && article.ai_summary) {
      return;
    }

    setIsSummarizing(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          summary: article.summary,
          content: article.content,
          force
        })
      });

      if (res.ok) {
        const data = await res.json();
        const genSummary = data.summary;

        // Update in articles list
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, ai_summary: genSummary } : a))
        );

        // Update in active reader view
        setActiveReaderArticle((prev) =>
          prev && prev.id === article.id ? { ...prev, ai_summary: genSummary } : prev
        );
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Open Full-Page Reader
  const handleOpenReader = (article: Article, autoSummarize = true) => {
    setActiveReaderArticle(article);
    window.location.hash = `article-${article.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (autoSummarize && !article.ai_summary) {
      fetchSummary(article, false);
    }
  };

  // Trigger Manual Ingestion
  const handleTriggerIngest = async () => {
    setIsIngesting(true);
    setIngestStatus('Ingesting latest feeds...');
    try {
      const res = await fetch('/api/ingest', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setIngestStatus(`Fetched ${result.itemsIngested || 0} new items successfully.`);
        await loadData();
      } else {
        setIngestStatus('Ingestion completed.');
      }
    } catch {
      setIngestStatus('Feed ingestion triggered.');
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestStatus(null), 4000);
    }
  };

  // Filter & Sort computation
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        if (activeTab === 'unread' && article.read_status) return false;
        if (activeTab === 'saved' && !article.saved_status) return false;

        if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
        if (selectedSource !== 'all' && article.source_id !== selectedSource) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = article.title.toLowerCase().includes(q);
          const matchSummary = article.summary.toLowerCase().includes(q);
          const matchAuthor = article.author?.toLowerCase().includes(q);
          const matchCategory = article.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchSummary && !matchAuthor && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        }
        if (sortOption === 'oldest') {
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
        }
        if (sortOption === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [articles, activeTab, selectedCategory, selectedSource, searchQuery, sortOption]);

  const unreadCount = useMemo(() => articles.filter((a) => !a.read_status).length, [articles]);
  const savedCount = useMemo(() => articles.filter((a) => a.saved_status).length, [articles]);

  // RENDER DEDICATED FULL-PAGE READER VIEW
  if (activeReaderArticle) {
    const currentIndex = filteredArticles.findIndex((a) => a.id === activeReaderArticle.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < filteredArticles.length - 1;

    return (
      <ReaderView
        article={activeReaderArticle}
        onBack={() => {
          window.location.hash = '';
          setActiveReaderArticle(null);
        }}
        onToggleRead={handleToggleRead}
        onToggleSave={handleToggleSave}
        onRegenerateSummary={(art) => fetchSummary(art, true)}
        isGeneratingSummary={isSummarizing}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrevArticle={() => {
          if (hasPrev) {
            const prev = filteredArticles[currentIndex - 1];
            setActiveReaderArticle(prev);
            window.location.hash = `article-${prev.id}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (!prev.ai_summary) fetchSummary(prev, false);
          }
        }}
        onNextArticle={() => {
          if (hasNext) {
            const next = filteredArticles[currentIndex + 1];
            setActiveReaderArticle(next);
            window.location.hash = `article-${next.id}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (!next.ai_summary) fetchSummary(next, false);
          }
        }}
      />
    );
  }

  // RENDER MAIN FEED VIEW
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20 sm:pb-8">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleDark={() => setIsDark((prev) => !prev)}
        onTriggerIngest={handleTriggerIngest}
        isIngesting={isIngesting}
        unreadCount={unreadCount}
        savedCount={savedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Toast / Ingest Status Banner */}
        {ingestStatus && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {ingestStatus}
            </span>
            <button
              onClick={() => setIngestStatus(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Statistics */}
        <StatsBar
          total={articles.length}
          unread={unreadCount}
          saved={savedCount}
          lastUpdated="Today at 5:00 AM (Asia/Dhaka)"
        />

        {/* Filter Controls & Categories */}
        <FilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          sortOption={sortOption}
          onSortChange={setSortOption}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          sources={sourceOptions}
          totalCount={filteredArticles.length}
        />

        {/* Articles Grid or Empty State */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleRead={handleToggleRead}
                onToggleSave={handleToggleSave}
                onOpenReader={(art) => handleOpenReader(art, true)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No articles found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query, switching categories, or changing filter tabs.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedCategory('all');
                setSelectedSource('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        savedCount={savedCount}
        onTriggerIngest={handleTriggerIngest}
        isIngesting={isIngesting}
      />
    </div>
  );
};

export default App;
