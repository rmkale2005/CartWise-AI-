# CartWise: E-commerce Customer Behaviour Mining & Cart Abandonment Prediction

An end-to-end Web Usage Mining, Machine Learning, and Business Analytics platform architected to analyze customer shopping sessions, discover sequential browsing patterns, quantify cart abandonment, and predict whether a live shopping session is likely to end without a purchase.

---

## 1. Project Overview & Objectives

In e-commerce retailing, shopping cart abandonment represents an average revenue loss of 65%–75%. **CartWise** bridges the gap between raw clickstream logs and conversion optimization by applying **Web Usage Mining** and **Predictive Modeling**:

- **Web Usage Mining**: Groups individual click events into discrete shopping sessions using a 30-minute inactivity threshold. Computes first-order Markov state transition probabilities and discovers frequent navigation sequences (e.g., `View -> Cart -> Purchase` vs. `View -> Cart -> Drop`).
- **Cart Abandonment Modeling**: Strictly defines abandonment as sessions containing at least one cart addition event (`cart_count >= 1`) without a corresponding purchase event (`purchase_count == 0`). Non-cart browse-only sessions are isolated to preserve statistical validity.
- **Leak-Free Predictive Inference**: Trains a **Random Forest Classifier (Primary)** and a baseline **Logistic Regression** model using an 80/20 **chronological train/test split** to simulate production deployment without temporal data leakage.
- **Customer Segmentation**: Clusters shoppers into four distinct behavioral archetypes using **K-Means clustering** and visualizes separation via **2D Principal Component Analysis (PCA)**.
- **Evidence-Based Recommendations**: Synthesizes computed metrics into actionable business interventions with explicit distinction between empirical correlation and causation.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide React, React Router v7 |
| **Backend API** | Python 3.15, Starlette / FastAPI, Uvicorn (ASGI), RESTful architecture |
| **Data Processing** | Pandas 3.1, NumPy 2.5 |
| **Machine Learning** | Scikit-learn 1.9 (Random Forest, Logistic Regression, K-Means, PCA, StandardScaler), Joblib |
| **Database** | SQLite3 relational metadata store (datasets, trained model metadata, inference logs) |

---

## 3. Complete Directory Structure

```text
CartWise AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                   # Paths, constants, 30m timeout, expected schema
│   │   ├── database.py                 # SQLite interface for dataset & model metadata
│   │   ├── main.py                     # ASGI application, CORS, Swagger UI, SPA static fallback
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dataset.py              # CSV upload, synthetic demo generation, active switcher
│   │   │   ├── eda.py                  # Event breakdown, hourly density, price histogram, categories
│   │   │   ├── mining.py               # 30-min sessionization, sequence flows, Markov matrix
│   │   │   ├── abandonment.py          # Abandonment KPIs, category breakdown, price brackets
│   │   │   ├── ml.py                   # Model training, test metrics, confusion matrix, inference
│   │   │   ├── segmentation.py         # K-Means clustering & 2D PCA scatter projection
│   │   │   ├── analytics.py            # Overview dashboard KPIs, time-series conversion trend
│   │   │   └── insights.py             # Actionable business recommendations with correlation caveats
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── data_processor.py       # Deduplication, missing-value imputation, timestamp parsing
│   │       ├── sessionizer.py          # 30m inactivity window, behavioral feature extraction
│   │       ├── ml_engine.py            # Leak-free features, chronological split, RF & LR, Joblib
│   │       ├── cluster_engine.py       # K-Means clustering, PCA projection, archetype profiling
│   │       └── demo_data_generator.py  # High-fidelity REES46 synthetic demonstration benchmark
│   ├── data/
│   │   ├── cartwise.db                 # SQLite relational database
│   │   ├── datasets/                   # CSV storage (uploaded files + demo sample)
│   │   └── models/                     # Serialized model bundles (.joblib)
│   ├── requirements.txt                # Python dependencies
│   └── run.py                          # Backend launch script
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # React Router application shell
│   │   ├── main.tsx                    # Vite entry point
│   │   ├── index.css                   # Tailwind styles, dark theme variables, typography
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interfaces for API schemas & state
│   │   ├── services/
│   │   │   └── api.ts                  # Typed client for all backend endpoints
│   │   ├── components/
│   │   │   ├── Layout.tsx              # Sidebar navigation, header, theme toggle, active dataset
│   │   │   ├── MetricCard.tsx          # Metric stat card with trend, icon, and tooltip
│   │   │   ├── ConfusionMatrix.tsx     # Color-coded 2x2 test evaluation confusion matrix
│   │   │   ├── SequenceFlow.tsx        # Visualizer for browsing paths (View -> Cart -> Purchase)
│   │   │   ├── ThemeToggle.tsx         # Dark / Light mode toggle
│   │   │   ├── LoadingSpinner.tsx      # Polished loading indicator
│   │   │   ├── ErrorAlert.tsx          # Error notification banner with retry action
│   │   │   └── EmptyState.tsx          # Empty state with demo loader CTA
│   │   └── pages/
│   │       ├── LandingPage.tsx         # Modern SaaS landing page
│   │       ├── DashboardOverview.tsx   # Executive overview: KPIs, timeline trend, categories
│   │       ├── DatasetManagement.tsx   # Upload CSV, load demo dataset, schema inspector
│   │       ├── DataExploration.tsx     # EDA: event proportion, hourly traffic, price histogram
│   │       ├── CustomerBehaviour.tsx   # Web usage mining: session durations, Markov matrix
│   │       ├── CartAbandonment.tsx     # Abandonment deep dive: rate, category drop-off, funnel
│   │       ├── PredictionPlayground.tsx# Interactive ML inference with probability gauge & drivers
│   │       ├── CustomerSegmentation.tsx# K-Means clusters, 2D PCA scatter, archetype profiles
│   │       ├── ModelPerformance.tsx    # RF vs LR comparison, ROC curves, confusion matrices
│   │       ├── BusinessInsights.tsx    # Computed recommendations & high-risk category alerts
│   │       └── AcademicReport.tsx      # Academic dissertation, diagrams, and methodology
│   ├── dist/                           # Production-built bundle (served automatically by backend)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## 4. Quick Start & Setup Guide (Windows / VS Code)

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.15)
- **Node.js**: Version 18+ (tested on Node 24 & npm 11/12)

### Option A: Single-Server Execution (Recommended)
The backend is configured to automatically serve the production-built React frontend and static assets.

1. **Open PowerShell in the project directory**:
   ```powershell
   cd "C:\Users\Admin\Desktop\CartWise AI"
   ```

2. **Start the CartWise Server**:
   ```powershell
   cd backend
   python run.py
   ```

3. **Open the Application**:
   - **Frontend Application**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **FastAPI / Swagger UI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **OpenAPI Schema**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

### Option B: Independent Development Mode (Hot-Reloading)

If modifying frontend React components or styles:

1. **Terminal 1: Start Backend API**:
   ```powershell
   cd "C:\Users\Admin\Desktop\CartWise AI\backend"
   python run.py
   ```
   *Runs on `http://127.0.0.1:8000`*

2. **Terminal 2: Start Vite Dev Server**:
   ```powershell
   cd "C:\Users\Admin\Desktop\CartWise AI\frontend"
   npm.cmd run dev
   ```
   *Runs on `http://localhost:5173` with automatic API proxy to `http://127.0.0.1:8000`.*

---

## 5. Dataset Schema (REES46 Format)

The system accepts any e-commerce clickstream CSV. Column detection automatically maps aliases (e.g. `event_time` / `timestamp`, `event_type` / `action`, `price` / `amount`).

| Column | Type | Example | Description |
|---|---|---|---|
| `event_time` | String / DateTime | `2019-11-01 00:00:00 UTC` | Interaction timestamp |
| `event_type` | String | `view`, `cart`, `purchase` | User action type |
| `product_id` | String / Int | `1004856` | Catalog product identifier |
| `category_code` | String | `electronics.smartphone` | Hierarchical taxonomy code |
| `brand` | String | `apple`, `samsung` | Manufacturer / brand |
| `price` | Float | `799.00` | Product unit price ($) |
| `user_id` | String / Int | `512435678` | Unique visitor identifier |
| `user_session` | String (Optional) | `uuid-string` | Session ID (derived automatically if absent) |

*Note: The built-in benchmark generates 7,400+ realistic clickstream events across ~400 users, 8 categories, and 1,200 sessions, clearly tagged as **Synthetic Demonstration Data**.*

---

## 6. Academic Deliverables & Methodology

### 6.1 Sessionization Algorithm
Click events are grouped by `user_id` and ordered by timestamp. A session threshold is computed:
$$\Delta t = t(E_{i+1}) - t(E_i) > 1800 \text{ seconds (30 minutes)}$$
When $\Delta t > 1800$ or user ID changes, a new session index is instantiated.

### 6.2 First-Order Markov Transition Probabilities
For each consecutive pair of events in a session, transition frequencies are normalized:
$$P(S_j | S_i) = \frac{N(S_i \to S_j)}{\sum_k N(S_i \to S_k)}$$

### 6.3 Leakage-Free Feature Engineering
Features are strictly computed from actions occurring **prior to the checkout outcome**:
- `view_count`: Total product detail pageviews.
- `cart_count`: Total add-to-cart actions.
- `duration_seconds`: Total active session duration.
- `time_to_first_cart`: Seconds elapsed before the first cart event.
- `views_before_cart`: Browsing depth prior to initial cart commitment.
- `total_cart_value`: Sum of prices of items added to cart ($).
- `cart_to_view_ratio`: Ratio of items carted per product viewed.
- `unique_products` & `unique_categories`: Catalog exploration breadth.

### 6.4 Model Evaluation (Random Forest vs. Logistic Regression)
- **Chronological Split**: Earliest 75% sessions for training, latest 25% holdout for test evaluation.
- **Metrics Calculated**:
  - **Accuracy**: $\frac{TP + TN}{TP + TN + FP + FN}$
  - **Precision**: $\frac{TP}{TP + FP}$
  - **Recall**: $\frac{TP}{TP + FN}$
  - **F1-Score**: $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
  - **ROC-AUC**: Area under the True Positive Rate vs. False Positive Rate curve.
- **Model Persistence**: Complete model bundles including trained estimators, StandardScaler, feature schema, and evaluation matrices are saved via `joblib`.

### 6.5 Customer Segmentation
K-Means ($k=4$) clusters customer vectors across standardized purchase volume, cart drop-offs, spend, and browsing duration. Dimensionality reduction via **Principal Component Analysis (PCA)** projects multidimensional vectors onto a 2D coordinate system for visual interpretation.

---

## 7. License & Academic Attribution
CartWise AI was engineered for academic research, data mining dissertations, and enterprise business intelligence. All analytics are computed dynamically from processed clickstream data.
