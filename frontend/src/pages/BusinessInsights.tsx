import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Recommendation } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const BusinessInsights: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [highRiskCats, setHighRiskCats] = useState<any[]>([]);
  const [metricsSummary, setMetricsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.getInsights()
      .then((res) => {
        setRecommendations(res.recommendations);
        setHighRiskCats(res.high_risk_categories);
        setMetricsSummary(res.metrics_summary);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to generate data-driven business insights.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Synthesizing business intelligence..." submessage="Correlating web mining patterns with revenue opportunities" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            Strategic Analytics
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Data-Driven Business Recommendations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Actionable conversion optimization initiatives strictly derived from empirical clickstream mining.
        </p>
      </div>

      {/* Critical Friction Categories Card */}
      {highRiskCats.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                Primary Friction Points: Top Abandoned Categories
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                The following categories represent the highest concentration of cart drop-offs and lost pipeline value:
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {highRiskCats.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-900/40 text-xs"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {cat.category}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">
                        {cat.abandonment_rate}% Drop-off
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ${cat.lost_value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Initiatives Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Prioritized Optimization Initiatives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {rec.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rec.severity === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {rec.severity} Impact
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  {rec.title}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold block text-slate-900 dark:text-white mb-0.5">
                      Observed Finding:
                    </span>
                    {rec.finding}
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="font-semibold block text-emerald-950 dark:text-emerald-100 mb-0.5">
                      Recommended Action:
                    </span>
                    {rec.action}
                  </div>
                </div>
              </div>

              {/* Correlation Disclaimer Note */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 italic flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{rec.correlation_disclaimer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
