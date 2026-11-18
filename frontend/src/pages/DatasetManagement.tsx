import React, { useState, useEffect } from 'react';
import {
  Upload,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DatasetMeta } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export const DatasetManagement: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDatasets = () => {
    setLoading(true);
    api.listDatasets()
      .then((res) => {
        setDatasets(res.datasets);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.uploadDataset(selectedFile);
      setSuccessMsg(res.message);
      setSelectedFile(null);
      fetchDatasets();
    } catch (err: any) {
      setError(err.message || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.loadDemoDataset();
      setSuccessMsg(res.message);
      fetchDatasets();
    } catch (err: any) {
      setError(err.message || 'Failed to generate demonstration dataset.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await api.setActiveDataset(id);
      fetchDatasets();
      setSuccessMsg('Active dataset updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dataset Management & Ingestion
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Upload real-world REES46 clickstream CSV files or load the synthetic benchmark dataset.
        </p>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchDatasets} />}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ingestion Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Upload Custom CSV */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upload Clickstream CSV
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  REES46 format or generic e-commerce event stream
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Supported columns: <code className="text-indigo-600 dark:text-indigo-400">event_time</code>,{' '}
              <code className="text-indigo-600 dark:text-indigo-400">event_type</code>,{' '}
              <code className="text-indigo-600 dark:text-indigo-400">product_id</code>,{' '}
              <code className="text-indigo-600 dark:text-indigo-400">price</code>,{' '}
              <code className="text-indigo-600 dark:text-indigo-400">user_id</code>. Missing values and duplicates are cleaned automatically.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/60 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900/60 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validating & Sessionizing...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload & Process Dataset
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Load Synthetic Demo Dataset */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Load Demonstration Dataset
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Clearly labelled synthetic REES46 benchmark
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Instantly provisions 6,000+ realistic e-commerce clickstream events spanning ~400 users, 8 product categories, and 1,200 sessions. Pre-configures behavioral sequences and trains initial Random Forest models.
            </p>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 mb-4">
              <strong>Academic Integrity Notice:</strong> Synthetic dataset results are clearly tagged to ensure zero ambiguity during research demonstrations.
            </div>
          </div>

          <button
            onClick={handleLoadDemo}
            disabled={demoLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
          >
            {demoLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Synthesizing Data & Retraining...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate & Activate Demo Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Available Datasets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Registered Datasets
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          All clickstream datasets persisted in the local SQLite metadata database.
        </p>

        {loading ? (
          <LoadingSpinner message="Fetching dataset catalog..." />
        ) : datasets.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No datasets uploaded yet. Load the demo dataset above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l">Status</th>
                  <th className="py-2.5 px-3">Dataset Name</th>
                  <th className="py-2.5 px-3">Event Rows</th>
                  <th className="py-2.5 px-3">Users</th>
                  <th className="py-2.5 px-3">Derived Sessions</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 rounded-r text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3">
                      {d.is_active === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {d.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {d.row_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {d.user_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {d.session_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      {d.is_demo === 1 ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          Synthetic Demo
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Uploaded CSV
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {d.is_active !== 1 && (
                        <button
                          onClick={() => handleSetActive(d.id)}
                          className="px-2.5 py-1 rounded text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        >
                          Set Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
