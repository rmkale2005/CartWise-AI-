import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  BrainCircuit,
  CheckCircle2,
  RefreshCw,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../services/api';
import { MLSummary } from '../types';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<MLSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMetrics = () => {
    setLoading(true);
    setError(null);
    api.getModelMetrics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch model evaluation metrics.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.trainModels();
      setSuccessMsg('Models retrained and evaluated successfully with chronological split.');
      fetchMetrics();
    } catch (err: any) {
      setError(err.message || 'Retraining failed.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Evaluating ML test holdout..." submessage="Computing confusion matrix, ROC-AUC, and feature importances" />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchMetrics} />;
  }

  if (!data) return null;

  const { models, dataset_split } = data;
  const rf = models.random_forest;
  const lr = models.logistic_regression;

  // Format ROC curve for charting
  const rocPoints = rf.metrics.roc_curve.map((pt, idx) => ({
    fpr: pt.fpr,
    rf_tpr: pt.tpr,
    lr_tpr: lr.metrics.roc_curve[idx]?.tpr || pt.fpr,
    baseline: pt.fpr
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Model Evaluation
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Machine Learning Evaluation & Model Benchmark
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical test set comparison between Random Forest Classifier (Primary) and Logistic Regression (Baseline).
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-indigo-600/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
          {retraining ? 'Retraining on Active Data...' : 'Retrain Models'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Chronological Validation Split Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              Data Leakage Prevention: Chronological Split Applied
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Earliest 75% sessions used for training ({dataset_split.train_samples} sessions), latest 25% holdout reserved for testing ({dataset_split.test_samples} sessions).
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>Train Abandon Rate: {dataset_split.train_abandon_rate}%</span>
          <span>Test Abandon Rate: {dataset_split.test_abandon_rate}%</span>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Model Comparison: Holdout Evaluation Metrics
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Calculated using standard Scikit-learn test evaluation metrics on unseen chronological sessions
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l">Model Architecture</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3 rounded-r text-right font-bold text-indigo-600 dark:text-indigo-400">
                  ROC-AUC Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {/* Random Forest */}
              <tr className="bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/50">
                <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                  Random Forest Classifier
                </td>
                <td className="py-3 px-3 font-sans font-medium text-indigo-600 dark:text-indigo-400">
                  Primary Model
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {(rf.metrics.accuracy * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {(rf.metrics.precision * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                  {(rf.metrics.recall * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                  {rf.metrics.f1_score.toFixed(4)}
                </td>
                <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {rf.metrics.roc_auc.toFixed(4)}
                </td>
              </tr>

              {/* Logistic Regression */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-3 font-sans font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                  Logistic Regression
                </td>
                <td className="py-3 px-3 font-sans text-slate-500 dark:text-slate-400">
                  Baseline Model
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {(lr.metrics.accuracy * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {(lr.metrics.precision * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {(lr.metrics.recall * 100).toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                  {lr.metrics.f1_score.toFixed(4)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  {lr.metrics.roc_auc.toFixed(4)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrices Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConfusionMatrix
          matrix={rf.metrics.confusion_matrix}
          title="Random Forest: Test Confusion Matrix"
        />
        <ConfusionMatrix
          matrix={lr.metrics.confusion_matrix}
          title="Logistic Regression: Test Confusion Matrix"
        />
      </div>

      {/* ROC Curves & Feature Importance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Receiver Operating Characteristic (ROC Curve)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                True Positive Rate (Recall) vs False Positive Rate
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-indigo-600 dark:text-indigo-400">RF: AUC {rf.metrics.roc_auc.toFixed(3)}</span>
              <span className="text-slate-500 dark:text-slate-400">LR: AUC {lr.metrics.roc_auc.toFixed(3)}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="fpr" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'FPR', position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                />
                <Line type="monotone" dataKey="rf_tpr" stroke="#6366F1" strokeWidth={2} dot={false} name="Random Forest" />
                <Line type="monotone" dataKey="lr_tpr" stroke="#94A3B8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Logistic Regression" />
                <Line type="monotone" dataKey="baseline" stroke="#CBD5E1" strokeWidth={1} dot={false} strokeDasharray="5 5" name="Chance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importances Ranking */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Top Feature Importances (Random Forest Gini Weight)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Relative contribution of each behavioral feature in separating abandonment from purchase
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rf.feature_importances.slice(0, 7)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Predictive Weight']}
                />
                <Bar dataKey="importance" fill="#6366F1" radius={[0, 4, 4, 0]} name="Importance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
