import React from 'react';
import { Database, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Active Dataset Loaded',
  description = 'Load the synthetic REES46 demonstration dataset or upload your own e-commerce clickstream CSV to generate real analytics.',
  actionText = 'Load Demonstration Dataset',
  onAction,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        <Database className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Generating & Analyzing...' : actionText}
        </button>
      )}
    </div>
  );
};
