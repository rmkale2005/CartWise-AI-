export interface DatasetMeta {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  row_count: number;
  user_count: number;
  session_count: number;
  is_active: number;
  is_demo: number;
  uploaded_at: string;
  summary?: {
    raw_rows: number;
    clean_rows: number;
    unique_users: number;
    unique_products: number;
    start_date: string;
    end_date: string;
    total_revenue: number;
    event_counts: Record<string, number>;
  };
}

export interface EDASummary {
  total_events: number;
  unique_users: number;
  unique_products: number;
  unique_categories: number;
  event_breakdown: Array<{
    event_type: string;
    count: number;
    percentage: number;
  }>;
  price_stats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    q25: number;
    q75: number;
  };
  date_range: {
    start: string;
    end: string;
  };
}

export interface HourlyActivity {
  hour: string;
  views: number;
  carts: number;
  purchases: number;
  total: number;
}

export interface PriceDistribution {
  bracket: string;
  count: number;
}

export interface CategoryStat {
  category: string;
  total_events: number;
  views: number;
  carts: number;
  purchases: number;
  revenue: number;
}

export interface MiningOverview {
  total_sessions: number;
  overview: {
    avg_duration_sec: number;
    avg_duration_min: number;
    avg_views_per_session: number;
    avg_carts_per_session: number;
    avg_time_to_first_cart_sec: number;
  };
  top_sequences: Array<{
    sequence: string;
    count: number;
    percentage: number;
  }>;
  transition_matrix: Array<Record<string, any>>;
  duration_distribution: Array<{
    bracket: string;
    count: number;
  }>;
  views_vs_carts: Array<{
    views_bracket: string;
    avg_carts: number;
    avg_purchases: number;
    session_count: number;
  }>;
}

export interface AbandonmentMetrics {
  kpis: {
    total_sessions: number;
    total_cart_sessions: number;
    abandoned_sessions: number;
    converted_sessions: number;
    browse_only_sessions: number;
    cart_abandonment_rate: number;
    session_conversion_rate: number;
    cart_to_purchase_rate: number;
    potential_lost_revenue: number;
    realized_revenue: number;
    avg_session_duration_min: number;
    avg_product_views: number;
  };
  comparison: {
    avg_views: Record<string, number>;
    avg_duration_min: Record<string, number>;
    avg_cart_value: Record<string, number>;
    avg_time_to_first_cart_sec: Record<string, number>;
  };
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  roc_curve: Array<{ fpr: number; tpr: number }>;
}

export interface FeatureImportance {
  feature: string;
  label: string;
  importance?: number;
  coefficient?: number;
}

export interface MLSummary {
  models: {
    random_forest: {
      name: string;
      type: string;
      metrics: ModelMetrics;
      feature_importances: FeatureImportance[];
    };
    logistic_regression: {
      name: string;
      type: string;
      metrics: ModelMetrics;
      coefficients: FeatureImportance[];
    };
  };
  dataset_split: {
    train_samples: number;
    test_samples: number;
    train_abandon_rate: number;
    test_abandon_rate: number;
  };
  feature_definitions: Array<{
    feature: string;
    label: string;
  }>;
}

export interface PredictionResult {
  model_used: string;
  prediction: string;
  is_abandoned: number;
  abandonment_probability: number;
  purchase_probability: number;
  confidence_percentage: number;
  color: string;
  key_factors: Array<{
    factor: string;
    impact: string;
    type: 'positive' | 'negative' | 'neutral' | 'info';
  }>;
  input_features: Record<string, any>;
}

export interface CustomerCluster {
  cluster_id: number;
  name: string;
  description: string;
  color: string;
  priority: string;
  user_count: number;
  percentage: number;
  metrics: {
    avg_purchases: number;
    avg_carts: number;
    avg_views: number;
    avg_duration_sec: number;
    avg_abandonment_rate: number;
    avg_spend: number;
  };
}

export interface SegmentationResult {
  clusters: CustomerCluster[];
  scatter_points: Array<{
    user_id: string;
    cluster: number;
    x: number;
    y: number;
    views: number;
    carts: number;
    purchases: number;
    duration: number;
  }>;
  total_segmented_users: number;
  explained_variance_ratio: number[];
}

export interface Recommendation {
  id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  finding: string;
  action: string;
  correlation_disclaimer: string;
}

export interface DashboardData {
  status: string;
  dataset_info?: {
    name: string;
    is_demo: boolean;
    rows: number;
    start_date: string;
    end_date: string;
  };
  kpis?: {
    total_sessions: number;
    total_customers: number;
    total_purchases: number;
    realized_revenue: number;
    potential_lost_revenue: number;
    cart_abandonment_rate: number;
    session_conversion_rate: number;
    cart_to_purchase_rate: number;
    avg_session_duration_min: number;
    avg_views_per_session: number;
  };
  timeline?: Array<{
    date: string;
    sessions: number;
    cart_sessions: number;
    purchases: number;
    revenue: number;
  }>;
  category_preview?: Array<{
    category: string;
    sessions: number;
  }>;
}
