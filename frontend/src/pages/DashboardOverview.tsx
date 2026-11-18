import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  ShoppingCart,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { EmptyState } from '../components/EmptyState';

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    api.getDashboardOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch dashboard metrics.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadDemo = () => {
    setLoading(true);
    api.loadDemoDataset()
      .then(() => loadData())
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating session metrics..." submessage="Synthesizing clickstream event trends" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={loadData} />;
  }

  if (!data || data.status === 'empty' || !data.kpis) {
    return (
      <EmptyState
        title="No Active Dataset Available"
        description="Load the synthetic REES46 dataset to generate real clickstream metrics, or upload an e-commerce event log."
        actionText="Load REES46 Demo Dataset"
        onAction={handleLoadDemo}
      />
    );
  }

  const { kpis, dataset_info, timeline = [], category_preview = [] } = data;

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Executive summary of shopping behavior, cart abandonment, and conversion metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dataset"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Switch Dataset
          </Link>
          <Link
            to="/prediction"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all"
          >
            Predict Abandonment
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Dataset Notice Banner */}
      {dataset_info && (
        <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Active Source:</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">{dataset_info.name}</span>
            {dataset_info.is_demo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Synthetic Demo
              </span>
            )}
          </div>
          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            {dataset_info.rows.toLocaleString()} events analyzed &bull; Range: {dataset_info.start_date} to {dataset_info.end_date}
          </div>
        </div>
      )}

      {/* Core KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Sessions"
          value={kpis.total_sessions.toLocaleString()}
          subtitle="30-min window grouped"
          icon={Users}
          tooltip="User sessions partitioned by inactivity threshold"
        />
        <MetricCard
          title="Unique Customers"
          value={kpis.total_customers.toLocaleString()}
          subtitle="Distinct user identities"
          icon={Eye}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
        />
        <MetricCard
          title="Cart Abandonment"
          value={`${kpis.cart_abandonment_rate}%`}
          subtitle={`${kpis.total_sessions - kpis.total_purchases} non-converting sessions`}
          trend="Critical KPI"
          trendType="negative"
          icon={ShoppingCart}
          iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          tooltip="Sessions with cart additions that did not result in a purchase"
        />
        <MetricCard
          title="Session Conversion"
          value={`${kpis.session_conversion_rate}%`}
          subtitle="Overall session-to-order"
          trend={`${kpis.cart_to_purchase_rate}% of carts`}
          trendType="positive"
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <MetricCard
          title="Total Purchases"
          value={kpis.total_purchases.toLocaleString()}
          subtitle="Verified order events"
          icon={TrendingUp}
          iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
        />
        <MetricCard
          title="Realized Revenue"
          value={`$${kpis.realized_revenue.toLocaleString()}`}
          subtitle={`Lost pipeline: $${kpis.potential_lost_revenue.toLocaleString()}`}
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
      </div>

      {/* Charts Grid: Timeline & Category Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Session & Order Timeline (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Session Traffic & Conversion Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily timeline of shopping sessions, cart adds, and completed purchases
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                Sessions
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Purchases
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                <Area type="monotone" dataKey="purchases" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Active Categories (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Product Categories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primary session category distribution
                </p>
              </div>
              <Link to="/abandonment" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View Rates &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {category_preview.map((cat, idx) => {
                const maxVal = category_preview[0]?.sessions || 1;
                const pct = Math.round((cat.sessions / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {cat.category}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {cat.sessions} sessions
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Avg duration: {kpis.avg_session_duration_min} mins
            </span>
            <span>{kpis.avg_views_per_session} views / session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
