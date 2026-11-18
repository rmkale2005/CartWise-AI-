import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Activity,
  Layers,
  Tag,
  DollarSign,
  Clock,
  Eye,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { EDASummary, HourlyActivity, PriceDistribution, CategoryStat } from '../types';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const EVENT_COLORS: Record<string, string> = {
  view: '#38BDF8',
  cart: '#F59E0B',
  purchase: '#10B981'
};

export const DataExploration: React.FC = () => {
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [hourly, setHourly] = useState<HourlyActivity[]>([]);
  const [priceDist, setPriceDist] = useState<PriceDistribution[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, hourRes, priceRes, catRes] = await Promise.all([
        api.getEDASummary(),
        api.getHourlyActivity(),
        api.getPriceDistribution(),
        api.getTopCategories()
      ]);
      setSummary(sumRes);
      setHourly(hourRes.hourly_activity);
      setPriceDist(priceRes.price_distribution);
      setCategories(catRes.top_categories);
    } catch (err: any) {
      setError(err.message || 'Failed to load exploratory data analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating exploratory distributions..." submessage="Compiling histograms, hourly density, and category revenue" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchData} />;
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Exploratory Data Analysis (EDA)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Statistical profile of clickstream events, user activity cycles, and merchandise price tiers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clickstream Events"
          value={summary.total_events.toLocaleString()}
          subtitle={`Span: ${summary.date_range.start.slice(0, 10)} to ${summary.date_range.end.slice(0, 10)}`}
          icon={Activity}
        />
        <MetricCard
          title="Unique Catalog Items"
          value={summary.unique_products.toLocaleString()}
          subtitle={`${summary.unique_categories} product categories`}
          icon={Tag}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400"
        />
        <MetricCard
          title="Average Product Price"
          value={`$${summary.price_stats.mean.toFixed(2)}`}
          subtitle={`Median: $${summary.price_stats.median.toFixed(2)} (Range: $${summary.price_stats.min}-$${summary.price_stats.max})`}
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <MetricCard
          title="Unique Users"
          value={summary.unique_users.toLocaleString()}
          subtitle="Identified visitor profiles"
          icon={Layers}
          iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
        />
      </div>

      {/* Event Breakdown & Price Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Type Proportion (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Clickstream Event Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Relative frequency of views, carts, and purchases
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.event_breakdown}
                    dataKey="count"
                    nameKey="event_type"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {summary.event_breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EVENT_COLORS[entry.event_type] || '#6366F1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {summary.event_breakdown.map((item) => (
              <div key={item.event_type} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 capitalize text-slate-700 dark:text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: EVENT_COLORS[item.event_type] || '#6366F1' }}
                  />
                  {item.event_type}
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {item.count.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Price Histogram (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Price Range Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Histogram of viewed and purchased item price points
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} name="Interactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hourly Traffic & Intent Patterns (24h UTC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of browsing, carting, and purchasing activity across the day
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Views
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Carts
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Purchases
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
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
              <Bar dataKey="views" stackId="a" fill="#38BDF8" name="Views" />
              <Bar dataKey="carts" stackId="a" fill="#F59E0B" name="Carts" />
              <Bar dataKey="purchases" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} name="Purchases" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Categories Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Category Volume & Revenue Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Top categories ranked by total clickstream interaction volume
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l">Category Code</th>
                <th className="py-2.5 px-3">Total Events</th>
                <th className="py-2.5 px-3">Product Views</th>
                <th className="py-2.5 px-3">Cart Adds</th>
                <th className="py-2.5 px-3">Purchases</th>
                <th className="py-2.5 px-3 rounded-r text-right">Realized Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 font-mono">
                    {cat.category}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {cat.total_events.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-sky-600 dark:text-sky-400">
                    {cat.views.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400">
                    {cat.carts.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                    {cat.purchases.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-semibold text-slate-900 dark:text-white">
                    ${cat.revenue.toLocaleString()}
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
