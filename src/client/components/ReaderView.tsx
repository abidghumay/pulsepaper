import React, { useState } from 'react';
import { Article } from '../types';
import { MarkdownView } from './MarkdownView';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Circle,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';

interface ReaderViewProps {
  article: Article;
  onBack: () => void;
  onToggleRead: (id: string) => void;
  onToggleSave: (id: string) => void;
  onRegenerateSummary: (article: Article) => Promise<void>;
  isGeneratingSummary: boolean;
  onNextArticle?: () => void;
  onPrevArticle?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  article,
  onBack,
  onToggleRead,
  onToggleSave,
  onRegenerateSummary,
  isGeneratingSummary,
  onNextArticle,
  onPrevArticle,
  hasNext,
  hasPrev,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = article.ai_summary || article.summary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Summary of ${article.title}`,
        url: article.url,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      {/* Sticky Reader Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Back to Feed button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 -ml-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Feed</span>
          </button>

          {/* Quick source/category banner (center on desktop) */}
          <div className="hidden sm:flex items-center gap-2 truncate text-xs text-slate-500 max-w-sm">
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {article.source_name}
            </span>
            <span>•</span>
            <span className="truncate">{article.category}</span>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mark Read Toggle */}
            <button
              onClick={() => onToggleRead(article.id)}
              title={article.read_status ? 'Mark as Unread' : 'Mark as Read'}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                article.read_status
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {article.read_status ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span className="hidden xs:inline">{article.read_status ? 'Read' : 'Mark Read'}</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={() => onToggleSave(article.id)}
              title={article.saved_status ? 'Remove Bookmark' : 'Bookmark'}
              className={`p-1.5 rounded-lg transition-colors ${
                article.saved_status
                  ? 'text-amber-500 fill-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${article.saved_status ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              title="Share or Copy Link"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Direct Link to Paper */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              <span>Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Reader Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Article Metadata & Header */}
        <article className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                {article.category}
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {article.source_name}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.published_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Big Headline */}
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Authors */}
            {article.author && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1">
                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{article.author}</span>
              </div>
            )}
          </div>

          {/* AI EXECUTIVE SUMMARY SECTION */}
          <section className="relative rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-sm overflow-hidden transition-all">
            {/* Summary Top Banner */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent border-b border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Executive AI Research Brief
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Comprehensive technical synthesis & key takeaways
                  </p>
                </div>
              </div>

              {/* Action Buttons: Copy & Regenerate */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => onRegenerateSummary(article)}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSummary ? 'Synthesizing...' : 'Regenerate'}</span>
                </button>
              </div>
            </div>

            {/* Summary Body */}
            <div className="p-5 sm:p-7">
              {isGeneratingSummary ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Analyzing with Google Gemini AI...
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Extracting core thesis, technical innovations, empirical benchmarks, and real-world implications.
                    </p>
                  </div>
                </div>
              ) : article.ai_summary ? (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <MarkdownView content={article.ai_summary} />
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-slate-500">
                    No summary generated yet for this paper.
                  </p>
                  <button
                    onClick={() => onRegenerateSummary(article)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Executive Brief</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ORIGINAL ABSTRACT SECTION */}
          <section className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Original Paper Abstract & Text
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 shadow-xs whitespace-pre-line">
              {article.summary}
            </div>
          </section>

          {/* DIRECT CALLOUT LINK */}
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Read Full Paper & Citation
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Access PDF preprints, source code, and community discussions directly at {article.source_name}.
              </p>
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shrink-0"
            >
              <span>Open on {article.source_name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* PREVIOUS / NEXT ARTICLE NAVIGATION */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onPrevArticle}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Paper</span>
            </button>

            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Feed
            </button>

            <button
              onClick={onNextArticle}
              disabled={!hasNext}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next Paper</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>
    </div>
  );
};
