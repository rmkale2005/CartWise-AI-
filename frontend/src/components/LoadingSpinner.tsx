import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Processing clickstream data...',
  submessage = 'Calculating behavioral sequences and model matrices'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-900/50"></div>
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin absolute inset-0" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{message}</h3>
      {submessage && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">{submessage}</p>
      )}
    </div>
  );
};
