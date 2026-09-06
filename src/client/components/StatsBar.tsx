import React from 'react';
import { Newspaper, CheckCircle2, Bookmark, Clock, Sparkles } from 'lucide-react';

interface StatsBarProps {
  total: number;
  unread: number;
  saved: number;
  lastUpdated: string | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ total, unread, saved, lastUpdated }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Feed Items</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{total}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unread</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{unread}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
          <Bookmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved / Starred</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{saved}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
          <Clock className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last Schedule</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {lastUpdated || '5:00 AM Daily'}
          </p>
        </div>
      </div>
    </div>
  );
};
