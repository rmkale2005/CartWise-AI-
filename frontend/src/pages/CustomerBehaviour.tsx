import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Clock,
  Eye,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { MiningOverview } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SequenceFlow } from '../components/SequenceFlow';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const CustomerBehaviour: React.FC = () => {
  const [data, setData] = useState<MiningOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.getMiningOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch Web Usage Mining analytics.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Mining browsing sequences..." submessage="Reconstructing 30-min user sessions and state transitions" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchData} />;
  }

  if (!data) return null;

  const { overview, top_sequences, transition_matrix, duration_distribution, views_vs_carts } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            Core Web Usage Mining
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Customer Browsing Behaviour & Path Mining
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sessionization (30-minute inactivity timeout), navigation path sequences, and clickstream transition matrices.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Session Duration"
          value={`${overview.avg_duration_min} mins`}
          subtitle={`${overview.avg_duration_sec}s average active time`}
          icon={Clock}
          tooltip="Average elapsed time between first and last interaction within 30m window"
        />
        <MetricCard
          title="Views Per Session"
          value={overview.avg_views_per_session}
          subtitle="Catalog browsing depth"
          icon={Eye}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
        />
        <MetricCard
          title="Cart Adds Per Session"
          value={overview.avg_carts_per_session}
          subtitle="Item commitment rate"
          icon={ShoppingCart}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <MetricCard
          title="Time to First Cart Addition"
          value={`${Math.round(overview.avg_time_to_first_cart_sec / 60)} mins`}
          subtitle={`${overview.avg_time_to_first_cart_sec}s deliberation phase`}
          icon={Activity}
          iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
          tooltip="Elapsed time from session start until first item added to cart"
        />
      </div>

      {/* Most Common Browsing Sequences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Most Frequent Browsing Sequences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discovered pattern sequences showing user navigation from entry to exit
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {data.total_sessions.toLocaleString()} total sessions analyzed
          </span>
        </div>

        <div className="space-y-2.5">
          {top_sequences.map((item, idx) => (
            <SequenceFlow
              key={idx}
              sequence={item.sequence}
              count={item.count}
              percentage={item.percentage}
            />
          ))}
        </div>
      </div>

      {/* Charts Grid: Duration Histogram & Views vs Carts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Duration Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Session Duration Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Histogram of session lengths partitioned into active time brackets
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={duration_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="bracket" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
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
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* View Depth vs Cart Additions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            View Depth vs. Cart Intent & Purchases
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            How browsing depth influences cart additions and converted orders
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={views_vs_carts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="views_bracket" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
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
                <Bar dataKey="avg_carts" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Avg Carts" />
                <Bar dataKey="avg_purchases" fill="#10B981" radius={[4, 4, 0, 0]} name="Avg Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 1st-Order Markov State Transition Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              First-Order Markov State Transition Probabilities P(S<sub>t+1</sub> | S<sub>t</sub>)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculates empirical probability of transitioning between consecutive clickstream actions
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Row-Normalized (Sum = 1.0)
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Current State (S<sub>t</sub>)</th>
                <th className="py-2.5 px-3">Next: View</th>
                <th className="py-2.5 px-3">Next: Cart</th>
                <th className="py-2.5 px-3">Next: Purchase</th>
                <th className="py-2.5 px-3">Next: Session End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {transition_matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-left font-sans font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {row.state}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${(row.view || 0) > 0.4 ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {((row.view || 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${(row.cart || 0) > 0.2 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {((row.cart || 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${(row.purchase || 0) > 0.2 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {((row.purchase || 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${(row.session_end || 0) > 0.4 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {((row.session_end || 0) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
