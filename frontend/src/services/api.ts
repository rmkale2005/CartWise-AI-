import {
  DatasetMeta,
  EDASummary,
  HourlyActivity,
  PriceDistribution,
  CategoryStat,
  MiningOverview,
  AbandonmentMetrics,
  MLSummary,
  PredictionResult,
  SegmentationResult,
  Recommendation,
  DashboardData
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errMessage = errData.error;
    } catch {}
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Dataset Management
  loadDemoDataset: () => fetchJson<{ status: string; message: string; dataset: any }>('/dataset/load-demo', { method: 'POST' }),
  listDatasets: () => fetchJson<{ datasets: DatasetMeta[] }>('/dataset/list'),
  getActiveDataset: () => fetchJson<{ active: DatasetMeta | null; message?: string }>('/dataset/active'),
  setActiveDataset: (dataset_id: string) => fetchJson<{ status: string; active_dataset: DatasetMeta }>('/dataset/set-active', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id })
  }),
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ status: string; message: string; dataset: any }>('/dataset/upload', {
      method: 'POST',
      body: formData
    });
  },

  // EDA
  getEDASummary: () => fetchJson<EDASummary>('/eda/summary'),
  getHourlyActivity: () => fetchJson<{ hourly_activity: HourlyActivity[] }>('/eda/hourly'),
  getPriceDistribution: () => fetchJson<{ price_distribution: PriceDistribution[] }>('/eda/price-distribution'),
  getTopCategories: () => fetchJson<{ top_categories: CategoryStat[] }>('/eda/categories'),

  // Web Usage Mining
  getMiningOverview: () => fetchJson<MiningOverview>('/mining/overview'),

  // Cart Abandonment
  getAbandonmentMetrics: () => fetchJson<AbandonmentMetrics>('/abandonment/metrics'),
  getAbandonmentByCategory: () => fetchJson<{ categories: any[] }>('/abandonment/by-category'),
  getAbandonmentByPrice: () => fetchJson<{ price_tiers: any[] }>('/abandonment/by-price'),

  // Machine Learning
  trainModels: () => fetchJson<any>('/ml/train', { method: 'POST' }),
  getModelMetrics: () => fetchJson<MLSummary>('/ml/metrics'),
  predictAbandonment: (payload: { model_type: 'rf' | 'lr'; features: Record<string, number> }) =>
    fetchJson<PredictionResult>('/ml/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  // Customer Segmentation
  getClusters: (k: number = 4) => fetchJson<SegmentationResult>(`/segmentation/clusters?k=${k}`),

  // Analytics & Insights
  getDashboardOverview: () => fetchJson<DashboardData>('/analytics/overview'),
  getInsights: () => fetchJson<{ high_risk_categories: any[]; metrics_summary: any; recommendations: Recommendation[] }>('/insights/recommendations')
};
