import React from 'react';
import { TabFilter } from '../types';
import { Layers, CheckCircle2, Bookmark, RefreshCw } from 'lucide-react';

interface MobileNavProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  unreadCount: number;
  savedCount: number;
  onTriggerIngest: () => void;
  isIngesting: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
  savedCount,
  onTriggerIngest,
  isIngesting,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around">
      <button
        onClick={() => onTabChange('all')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg transition-colors ${
          activeTab === 'all'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span>All</span>
      </button>

      <button
        onClick={() => onTabChange('unread')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg relative transition-colors ${
          activeTab === 'unread'
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <CheckCircle2 className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span>Unread</span>
      </button>

      <button
        onClick={() => onTabChange('saved')}
        className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg relative transition-colors ${
          activeTab === 'saved'
            ? 'text-amber-600 dark:text-amber-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Bookmark className="w-5 h-5" />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
              {savedCount}
            </span>
          )}
        </div>
        <span>Saved</span>
      </button>

      <button
        onClick={onTriggerIngest}
        disabled={isIngesting}
        className="flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50"
      >
        <RefreshCw className={`w-5 h-5 ${isIngesting ? 'animate-spin text-indigo-600' : ''}`} />
        <span>{isIngesting ? 'Fetching' : 'Refresh'}</span>
      </button>
    </nav>
  );
};
