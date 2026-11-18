import React from 'react';

interface ConfusionMatrixProps {
  matrix: number[][]; // [[TN, FP], [FN, TP]]
  title?: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  matrix,
  title = 'Test Set Confusion Matrix'
}) => {
  if (!matrix || matrix.length < 2 || matrix[0].length < 2) {
    return <div className="text-xs text-slate-400 p-4">No confusion matrix data available</div>;
  }

  const tn = matrix[0][0];
  const fp = matrix[0][1];
  const fn = matrix[1][0];
  const tp = matrix[1][1];
  const total = tn + fp + fn + tp || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h4>
        <span className="text-xs text-slate-400 font-mono">
          N = {total.toLocaleString()} test sessions
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-xs">
        {/* Header row */}
        <div></div>
        <div className="text-center font-medium text-slate-600 dark:text-slate-300 py-1 bg-slate-50 dark:bg-slate-800/50 rounded">
          Pred: Converted (0)
        </div>
        <div className="text-center font-medium text-slate-600 dark:text-slate-300 py-1 bg-slate-50 dark:bg-slate-800/50 rounded">
          Pred: Abandoned (1)
        </div>

        {/* Row 1: Actual Converted */}
        <div className="font-medium text-slate-600 dark:text-slate-300 pr-2 text-right">
          Actual: Converted
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
            {tn}
          </div>
          <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
            True Negatives ({((tn / total) * 100).toFixed(1)}%)
          </div>
        </div>
        <div className="p-4 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center">
          <div className="text-xl font-bold text-rose-700 dark:text-rose-400 font-mono">
            {fp}
          </div>
          <div className="text-[10px] font-medium text-rose-600 dark:text-rose-400 mt-0.5">
            False Positives (Type I)
          </div>
        </div>

        {/* Row 2: Actual Abandoned */}
        <div className="font-medium text-slate-600 dark:text-slate-300 pr-2 text-right">
          Actual: Abandoned
        </div>
        <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-center">
          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 font-mono">
            {fn}
          </div>
          <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
            False Negatives (Type II)
          </div>
        </div>
        <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-center">
          <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">
            {tp}
          </div>
          <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
            True Positives ({((tp / total) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
};
