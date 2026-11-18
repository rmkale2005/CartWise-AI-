import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  TrendingDown,
  DollarSign,
  Clock,
  Eye,
  Layers,
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
  Cell
} from 'recharts';
import { api } from '../services/api';
import { AbandonmentMetrics } from '../types';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const CartAbandonment: React.FC = () => {
  const [metrics, setMetrics] = useState<AbandonmentMetrics | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [priceTiers, setPriceTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, cRes, pRes] = await Promise.all([
        api.getAbandonmentMetrics(),
        api.getAbandonmentByCategory(),
        api.getAbandonmentByPrice()
      ]);
      setMetrics(mRes);
      setCategories(cRes.categories);
      setPriceTiers(pRes.price_tiers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cart abandonment analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating cart abandonment metrics..." submessage="Partitioning cart sessions, lost revenue, and category drop-off" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchData} />;
  }

  if (!metrics) return null;

  const { kpis, comparison, funnel } = metrics;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Cart Abandonment Analysis
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Mathematical segmentation of intent sessions: distinguishing browse-only, abandoned, and converted checkouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cart Abandonment Rate"
          value={`${kpis.cart_abandonment_rate}%`}
          subtitle={`${kpis.abandoned_sessions} of ${kpis.total_cart_sessions} cart sessions dropped`}
          trend="Primary Loss Factor"
          trendType="negative"
          icon={ShoppingCart}
          iconBg="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          tooltip="Calculated strictly as: (Abandoned Cart Sessions / Total Sessions with at least one Cart Addition) * 100"
        />
        <MetricCard
          title="Cart-to-Purchase Conversion"
          value={`${kpis.cart_to_purchase_rate}%`}
          subtitle={`${kpis.converted_sessions} sessions successfully checked out`}
          trend="Checkout Efficiency"
          trendType="positive"
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <MetricCard
          title="Unrealized Cart Pipeline"
          value={`$${kpis.potential_lost_revenue.toLocaleString()}`}
          subtitle="Total cart value in abandoned sessions"
          icon={TrendingDown}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <MetricCard
          title="Browse-Only (No Cart)"
          value={kpis.browse_only_sessions.toLocaleString()}
          subtitle={`${((kpis.browse_only_sessions / kpis.total_sessions) * 100).toFixed(1)}% of all traffic`}
          icon={Eye}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
          tooltip="Sessions with zero cart events are excluded from the cart abandonment target pool"
        />
      </div>

      {/* Conversion Funnel Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          E-commerce Purchase Funnel
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Session progression from initial arrival to final purchase completion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {funnel.map((stage, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stage {idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {stage.percentage}%
                </span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {stage.count.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                {stage.stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid: Category Abandonment & Price Tier Sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abandonment Rate by Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Cart Abandonment Rate by Category (%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Percentage of cart-addition sessions abandoning per product category
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`${val}%`, 'Abandonment Rate']}
                />
                <Bar dataKey="abandonment_rate" fill="#F43F5E" radius={[0, 4, 4, 0]}>
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.abandonment_rate > 70 ? '#E11D48' : '#F43F5E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Abandonment by Cart Total Tier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Abandonment Rate vs. Cart Total Value ($)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Price elasticity curve: correlation between order size and drop-off rate
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceTiers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="tier" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`${val}%`, 'Abandonment Rate']}
                />
                <Bar dataKey="abandonment_rate" fill="#FB923C" radius={[4, 4, 0, 0]} name="Abandonment %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Behavioral Profile Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Abandoned vs. Converted Sessions: Behavioral Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comparative empirical averages computed directly from active session clickstream logs
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l">Behavioral Metric</th>
                <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400">Abandoned Sessions</th>
                <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">Converted Sessions</th>
                <th className="py-2.5 px-3 text-sky-600 dark:text-sky-400">Browse-Only Sessions</th>
                <th className="py-2.5 px-3 rounded-r text-right">Behavioral Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  Average Product Views
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_views.abandoned} views
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_views.converted} views
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {comparison.avg_views.browse_only} views
                </td>
                <td className="py-3 px-3 text-right font-sans text-slate-500 dark:text-slate-400">
                  Buyers browse with higher specificity
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  Average Active Duration
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_duration_min.abandoned} mins
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_duration_min.converted} mins
                </td>
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {comparison.avg_duration_min.browse_only} mins
                </td>
                <td className="py-3 px-3 text-right font-sans text-slate-500 dark:text-slate-400">
                  Prolonged hesitation marks drop-off
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  Average Cart Total Value
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  ${comparison.avg_cart_value.abandoned.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  ${comparison.avg_cart_value.converted.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  $0.00
                </td>
                <td className="py-3 px-3 text-right font-sans text-slate-500 dark:text-slate-400">
                  High cart totals introduce friction
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                  Time to First Cart Addition
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_time_to_first_cart_sec.abandoned.toFixed(0)}s
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {comparison.avg_time_to_first_cart_sec.converted.toFixed(0)}s
                </td>
                <td className="py-3 px-3 text-slate-400">
                  N/A
                </td>
                <td className="py-3 px-3 text-right font-sans text-slate-500 dark:text-slate-400">
                  Buyers add items 2-3x faster
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
