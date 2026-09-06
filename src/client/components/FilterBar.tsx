import React from 'react';
import { TabFilter, SortOption } from '../types';
import { Layers, Bookmark, CheckCircle2, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  sources: { id: string; name: string }[];
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  onTabChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortOption,
  onSortChange,
  selectedSource,
  onSourceChange,
  sources,
  totalCount,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Primary Tabs (All / Unread / Saved) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => onTabChange('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Articles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('unread')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'unread'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Unread Only</span>
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks / Saved</span>
          </button>
        </div>

        {/* Sort and Source Selectors */}
        <div className="flex items-center gap-2 text-xs">
          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Sources ({sources.length})</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Scrollable */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-3 h-3" /> Category:
        </span>
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
