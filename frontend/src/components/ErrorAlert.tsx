import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Encountered Data Error',
  message,
  onRetry
}) => {
  return (
    <div className="p-4 my-4 rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">{title}</h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:text-rose-900 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 shadow-xs hover:bg-rose-50 dark:hover:bg-slate-800 transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
