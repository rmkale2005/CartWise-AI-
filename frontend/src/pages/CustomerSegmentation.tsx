import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShoppingCart
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { api } from '../services/api';
import { SegmentationResult, CustomerCluster } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const CLUSTER_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#9CA3AF', '#EC4899'];

export const CustomerSegmentation: React.FC = () => {
  const [data, setData] = useState<SegmentationResult | null>(null);
  const [kClusters, setKClusters] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClusters = (k: number) => {
    setLoading(true);
    setError(null);
    api.getClusters(k)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to compute K-Means customer segmentation.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClusters(kClusters);
  }, [kClusters]);

  if (loading) {
    return <LoadingSpinner message="Executing K-Means clustering..." submessage="Standardizing behavioral vectors and reducing dimensionality with PCA" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={() => fetchClusters(kClusters)} />;
  }

  if (!data) return null;

  const { clusters, scatter_points, total_segmented_users, explained_variance_ratio } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Unsupervised Learning
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Customer Behavioral Segmentation (K-Means)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clustering customer identities based on purchase frequency, cart drop-offs, and browsing engagement.
          </p>
        </div>

        {/* K Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Clusters (k):</span>
          {[3, 4, 5].map((k) => (
            <button
              key={k}
              onClick={() => setKClusters(k)}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-all ${
                kClusters === k
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              k = {k}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Archetype Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.cluster_id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cluster.color || CLUSTER_COLORS[cluster.cluster_id % 5] }}
                />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {cluster.priority}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {cluster.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {cluster.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cohort Size:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {cluster.user_count} users ({cluster.percentage}%)
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Avg Abandonment:</span>
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                  {cluster.metrics.avg_abandonment_rate}%
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Avg Purchases:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {cluster.metrics.avg_purchases}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2D PCA Dimensionality Reduction Scatter Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Principal Component Analysis (PCA) 2D Cluster Separation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standardized behavioral vectors projected onto first two principal components
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            PCA Explained Variance: [PC1: {((explained_variance_ratio[0] || 0) * 100).toFixed(1)}%, PC2: {((explained_variance_ratio[1] || 0) * 100).toFixed(1)}%]
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name="Principal Component 1"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Principal Component 2"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <ZAxis range={[35, 35]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '11px'
                }}
                formatter={(val: any, name: any, item: any) => [
                  `Cluster ${item.payload.cluster}: Views=${item.payload.views}, Carts=${item.payload.carts}, Purchases=${item.payload.purchases}`,
                  'Customer Vector'
                ]}
              />
              <Scatter data={scatter_points}>
                {scatter_points.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {clusters.map((c) => (
            <span key={c.cluster_id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: c.color || CLUSTER_COLORS[c.cluster_id % 5] }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Cluster Metrics Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Cluster Centroid Characteristics & Performance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Empirical mean values calculated per cluster from standardized behavioural features
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l">Cluster Archetype</th>
                <th className="py-2.5 px-3">Users Count</th>
                <th className="py-2.5 px-3">Avg Views</th>
                <th className="py-2.5 px-3">Avg Carts</th>
                <th className="py-2.5 px-3">Avg Purchases</th>
                <th className="py-2.5 px-3">Abandonment Rate</th>
                <th className="py-2.5 px-3 rounded-r text-right">Strategic Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {clusters.map((c) => (
                <tr key={c.cluster_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: c.color }}
                    />
                    {c.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {c.user_count} ({c.percentage}%)
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {c.metrics.avg_views}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {c.metrics.avg_carts}
                  </td>
                  <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {c.metrics.avg_purchases}
                  </td>
                  <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-semibold">
                    {c.metrics.avg_abandonment_rate}%
                  </td>
                  <td className="py-3 px-3 text-right font-sans font-medium text-indigo-600 dark:text-indigo-400">
                    {c.priority}
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
