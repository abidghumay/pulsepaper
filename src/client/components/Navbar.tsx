import React from 'react';
import { Newspaper, Search, RefreshCw, Moon, Sun, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onTriggerIngest: () => void;
  isIngesting: boolean;
  unreadCount: number;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  isDark,
  onToggleDark,
  onTriggerIngest,
  isIngesting,
  unreadCount,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">PulsePaper</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                  5 AM Digest
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Automated Paper & Tech Aggregator</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search papers, abstracts, authors..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2">
            {/* Quick Counters (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 text-xs mr-2 font-medium">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {unreadCount} Unread
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/40">
                {savedCount} Saved
              </span>
            </div>

            {/* Ingest Now Button */}
            <button
              onClick={onTriggerIngest}
              disabled={isIngesting}
              title="Trigger source ingestion now"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isIngesting ? 'Fetching...' : 'Fetch Now'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              title="Toggle Dark Mode"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
