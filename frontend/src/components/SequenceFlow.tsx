import React from 'react';
import { Eye, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';

interface SequenceFlowProps {
  sequence: string;
  count?: number;
  percentage?: number;
}

export const SequenceFlow: React.FC<SequenceFlowProps> = ({
  sequence,
  count,
  percentage
}) => {
  const steps = sequence.split(' -> ').map((s) => s.trim().toLowerCase());

  const getStepBadge = (step: string) => {
    switch (step) {
      case 'view':
        return {
          label: 'Product View',
          icon: Eye,
          classes: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
        };
      case 'cart':
        return {
          label: 'Add to Cart',
          icon: ShoppingCart,
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
        };
      case 'purchase':
        return {
          label: 'Purchase Completed',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
        };
      default:
        return {
          label: step,
          icon: ArrowRight,
          classes: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        };
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {steps.map((step, idx) => {
          const badge = getStepBadge(step);
          const Icon = badge.icon;
          return (
            <React.Fragment key={idx}>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${badge.classes}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {(count !== undefined || percentage !== undefined) && (
        <div className="flex items-center gap-2 shrink-0">
          {count !== undefined && (
            <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
              {count.toLocaleString()} sessions
            </span>
          )}
          {percentage !== undefined && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {percentage}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};
