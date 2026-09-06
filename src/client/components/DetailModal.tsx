import React from 'react';
import { Article } from '../types';
import { X, ExternalLink, Bookmark, CheckCircle2, Circle, Sparkles, Calendar, User, Newspaper } from 'lucide-react';

interface DetailModalProps {
  article: Article | null;
  onClose: () => void;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onSummarize: (article: Article) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  article,
  onClose,
  onToggleRead,
  onToggleSave,
  onSummarize,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                {article.category}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {article.source_name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Abstract */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Metadata badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate"><strong>Authors:</strong> {article.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span><strong>Published:</strong> {new Date(article.published_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          </div>

          {/* Abstract Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Abstract / Summary
            </h3>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 whitespace-pre-line">
              {article.summary}
            </div>
          </div>

          {/* AI Summary Preview if already generated */}
          {article.ai_summary && (
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 space-y-2">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4" /> AI Synthesized Takeaways
              </div>
              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {article.ai_summary}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleRead(article.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                article.read_status
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {article.read_status ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{article.read_status ? 'Marked as Read' : 'Mark as Read'}</span>
            </button>

            <button
              onClick={() => onToggleSave(article.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                article.saved_status
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${article.saved_status ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{article.saved_status ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSummarize(article)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{article.ai_summary ? 'Re-Summarize' : 'Generate Summary'}</span>
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <span>Open Original Paper</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
