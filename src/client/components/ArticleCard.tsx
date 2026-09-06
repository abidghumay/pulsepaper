import React from 'react';
import { Article } from '../types';
import { ExternalLink, Bookmark, CheckCircle2, Circle, Sparkles, BookOpen, Clock, User } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onSummarize: (article: Article) => void;
  onSelectArticle: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onToggleRead,
  onToggleSave,
  onSummarize,
  onSelectArticle,
}) => {
  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 60) return `${Math.max(1, mins)}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <article
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        article.read_status
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-85 hover:opacity-100'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60'
      }`}
    >
      {/* Top Banner / Metadata */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Tag */}
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              {article.category}
            </span>

            {/* Source Tag */}
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {article.source_name}
            </span>

            {/* AI Summary Available Badge */}
            {article.ai_summary && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200/40 dark:border-purple-900/40">
                <Sparkles className="w-2.5 h-2.5" /> Summary Ready
              </span>
            )}
          </div>

          {/* Time & Read Status Pill */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3" />
              {formatTime(article.published_at)}
            </span>
            {!article.read_status && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Unread" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-start gap-1"
          >
            <span>{article.title}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-slate-400" />
          </a>
        </h2>

        {/* Author */}
        {article.author && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5 line-clamp-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{article.author}</span>
          </p>
        )}

        {/* Abstract / Summary Snippet */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {article.summary}
        </p>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        {/* Left Actions: Read / Details & Summarize */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Read Abstract / Full Details Modal */}
          <button
            onClick={() => onSelectArticle(article)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Details</span>
          </button>

          {/* AI Summarize Button */}
          <button
            onClick={() => onSummarize(article)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              article.ai_summary
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{article.ai_summary ? 'View Summary' : 'Summarize'}</span>
          </button>
        </div>

        {/* Right Actions: Mark Read & Bookmark */}
        <div className="flex items-center gap-1">
          {/* Mark Read Toggle */}
          <button
            onClick={() => onToggleRead(article.id)}
            title={article.read_status ? 'Mark as Unread' : 'Mark as Read'}
            className={`p-2 rounded-lg transition-colors ${
              article.read_status
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {article.read_status ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>

          {/* Save / Bookmark Toggle */}
          <button
            onClick={() => onToggleSave(article.id)}
            title={article.saved_status ? 'Remove from Saved' : 'Save / Bookmark'}
            className={`p-2 rounded-lg transition-colors ${
              article.saved_status
                ? 'text-amber-500 fill-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${article.saved_status ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Direct Paper Link */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Original Paper / Article"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
