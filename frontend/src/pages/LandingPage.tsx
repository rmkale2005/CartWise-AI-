import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  BrainCircuit,
  GitFork,
  Users,
  LineChart,
  ArrowRight,
  Database,
  ShieldCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                CartWise <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all"
            >
              Launch Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Academic & Industrial Web Usage Mining Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              E-commerce Customer Behaviour Mining &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Cart Abandonment Prediction
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Transform raw e-commerce clickstream logs into actionable conversion intelligence.
              Uncover 30-minute session browsing sequences, predict cart drop-offs with Random Forest,
              and cluster customer intent via K-Means.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all"
              >
                Launch Analytics Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all"
              >
                Read Academic Methodology
              </Link>
            </div>
          </div>

          {/* Interactive Feature Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <GitFork className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Web Usage Mining
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                30-minute session inactivity boundary grouping, 1st-order Markov transitions, and multi-step browsing sequence extraction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Abandonment Mining
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Rigorous mathematical classification of sessions with cart additions that drop out prior to purchase completion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                ML Predictive Inference
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Chronological train/test split, Random Forest vs Logistic Regression, ROC-AUC evaluation, and live interactive session scoring.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Customer Segmentation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                K-Means clustering on behavioral and transactional attributes, 2D PCA projection scatter, and centroid-derived archetype profiling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-12 border-t border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Modern Academic & Enterprise Architecture
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> React 19 + TypeScript</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> Tailwind CSS</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> Recharts Data Viz</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> Python 3.15 + FastAPI / Starlette</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> Scikit-learn + Pandas + NumPy</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-indigo-500" /> SQLite Metadata Relational DB</span>
          </div>
        </div>
      </section>
    </div>
  );
};
