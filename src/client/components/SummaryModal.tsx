import React, { useState } from 'react';
import { Article } from '../types';
import { X, Sparkles, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface SummaryModalProps {
  article: Article | null;
  summary: string | null;
  isLoading: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  article,
  summary,
  isLoading,
  onClose,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                AI Executive Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs sm:max-w-md">
                {article.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Synthesizing research highlights...
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Extracting core methodologies, key findings, and practical implications.
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 space-y-2 whitespace-pre-line bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {summary}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              No summary generated yet. Click generate below.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            {summary && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
