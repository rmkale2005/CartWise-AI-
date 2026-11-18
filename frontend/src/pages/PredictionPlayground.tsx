import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Zap,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

// Interactive presets for quick testing
const PRESETS = [
  {
    name: 'Decisive Buyer',
    description: 'Fast add-to-cart, targeted product views, modest cart total',
    features: {
      view_count: 3,
      cart_count: 1,
      duration_seconds: 140,
      time_to_first_cart: 45,
      views_before_cart: 2,
      unique_products: 2,
      unique_categories: 1,
      avg_price: 85.0,
      total_cart_value: 85.0,
      cart_to_view_ratio: 0.33,
      hour_of_day: 14,
      day_of_week: 2
    }
  },
  {
    name: 'Hesitant Window Shopper',
    description: 'High view count, slow add-to-cart, multi-category browsing',
    features: {
      view_count: 12,
      cart_count: 2,
      duration_seconds: 780,
      time_to_first_cart: 420,
      views_before_cart: 8,
      unique_products: 7,
      unique_categories: 3,
      avg_price: 320.0,
      total_cart_value: 640.0,
      cart_to_view_ratio: 0.16,
      hour_of_day: 21,
      day_of_week: 6
    }
  },
  {
    name: 'Cart Price-Shock Drop',
    description: 'Expensive electronics cart, lingering session time',
    features: {
      view_count: 6,
      cart_count: 3,
      duration_seconds: 620,
      time_to_first_cart: 180,
      views_before_cart: 3,
      unique_products: 4,
      unique_categories: 2,
      avg_price: 680.0,
      total_cart_value: 1890.0,
      cart_to_view_ratio: 0.5,
      hour_of_day: 19,
      day_of_week: 4
    }
  }
];

export const PredictionPlayground: React.FC = () => {
  const [modelType, setModelType] = useState<'rf' | 'lr'>('rf');
  const [features, setFeatures] = useState<Record<string, number>>(PRESETS[1].features);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: string, value: string) => {
    const num = parseFloat(value) || 0;
    setFeatures((prev) => {
      const updated = { ...prev, [key]: num };
      // auto update ratio
      if (key === 'cart_count' || key === 'view_count') {
        const v = key === 'view_count' ? num : updated.view_count || 1;
        const c = key === 'cart_count' ? num : updated.cart_count || 0;
        updated.cart_to_view_ratio = parseFloat((c / Math.max(1, v)).toFixed(3));
      }
      return updated;
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictAbandonment({
        model_type: modelType,
        features
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Ensure models are trained.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFeatures(preset.features);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            Machine Learning Inference
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Cart Abandonment Predictive Playground
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Simulate customer session characteristics to evaluate real-time abandonment risk and driving factors.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Test Archetypes:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Form & Prediction Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Session Behavioral Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inputs are strictly leak-free observable actions prior to checkout completion
              </p>
            </div>

            {/* Model Selector Toggle */}
            <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModelType('rf')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  modelType === 'rf'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Random Forest
              </button>
              <button
                type="button"
                onClick={() => setModelType('lr')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  modelType === 'lr'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Logistic Reg.
              </button>
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Views Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={features.view_count || ''}
                  onChange={(e) => handleInputChange('view_count', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cart Additions Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={features.cart_count || ''}
                  onChange={(e) => handleInputChange('cart_count', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Total Session Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="7200"
                  value={features.duration_seconds || ''}
                  onChange={(e) => handleInputChange('duration_seconds', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Approx {Math.round((features.duration_seconds || 0) / 60)} minutes
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Time to First Cart Addition (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={features.time_to_first_cart || ''}
                  onChange={(e) => handleInputChange('time_to_first_cart', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Views Before First Cart Addition
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={features.views_before_cart || ''}
                  onChange={(e) => handleInputChange('views_before_cart', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Total Cart Value ($)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={features.total_cart_value || ''}
                  onChange={(e) => handleInputChange('total_cart_value', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Unique Products Explored
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={features.unique_products || ''}
                  onChange={(e) => handleInputChange('unique_products', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Categories Explored
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={features.unique_categories || ''}
                  onChange={(e) => handleInputChange('unique_categories', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-indigo-600/30"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running Model Inference...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Run Cart Abandonment Prediction
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Result Display (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ML Prediction Outcome
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {modelType === 'rf' ? 'Random Forest (100 trees)' : 'Logistic Regression'}
              </span>
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Status Hero Card */}
                <div
                  className={`p-5 rounded-xl border text-center ${
                    result.is_abandoned === 1
                      ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60'
                      : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Predicted Outcome
                  </div>
                  <div
                    className={`text-2xl font-extrabold tracking-tight ${
                      result.is_abandoned === 1
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {result.prediction}
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 mt-1">
                    {result.confidence_percentage}% Model Confidence
                  </div>
                </div>

                {/* Probability Gauges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Abandonment Probability
                    </span>
                    <span className="font-mono">{result.abandonment_probability}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all"
                      style={{ width: `${result.abandonment_probability}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium pt-1">
                    <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Purchase Probability
                    </span>
                    <span className="font-mono">{result.purchase_probability}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${result.purchase_probability}%` }}
                    />
                  </div>
                </div>

                {/* Key Contributing Factors */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Key Influencing Drivers
                  </h4>
                  <div className="space-y-2">
                    {result.key_factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs"
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {factor.factor}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {factor.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <BrainCircuit className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-50" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Awaiting Session Input
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  Adjust session parameters on the left or pick a test archetype above, then click predict.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
