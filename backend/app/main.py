"""
CartWise AI Backend Server
FastAPI & Starlette Application
"""
import os
import json
from contextlib import asynccontextmanager
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import JSONResponse, HTMLResponse, FileResponse
from pathlib import Path

# Paths
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

# Fallback for SPA routing
async def handle_spa_fallback(request: Request):
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse({"error": "Frontend build not found"}, status_code=404)
from starlette.routing import Route, Mount
from starlette.requests import Request

from app.database import init_db, get_active_dataset
from app.config import DATASETS_DIR
from app.services.demo_data_generator import generate_demo_dataset
from app.services.data_processor import load_and_preprocess_dataset
from app.services.sessionizer import sessionize_events, extract_session_features
from app.services.ml_engine import train_and_evaluate_models
from app.database import save_dataset_meta

# Import Route Handlers
from app.api.dataset import (
    handle_load_demo,
    handle_upload_csv,
    handle_list_datasets,
    handle_get_active_dataset,
    handle_set_active_dataset
)
from app.api.eda import (
    handle_eda_summary,
    handle_eda_hourly,
    handle_eda_price_distribution,
    handle_eda_categories
)
from app.api.mining import handle_mining_overview
from app.api.abandonment import (
    handle_abandonment_metrics,
    handle_abandonment_by_category,
    handle_abandonment_by_price
)
from app.api.ml import (
    handle_train_models,
    handle_get_model_metrics,
    handle_predict
)
from app.api.segmentation import handle_get_clusters
from app.api.analytics import handle_dashboard_overview
from app.api.insights import handle_get_insights

@asynccontextmanager
async def lifespan(app: Starlette):
    """Application startup & shutdown events."""
    # Initialize DB schema
    init_db()
    
    # Check if an active dataset already exists; if not, initialize demo dataset
    active = get_active_dataset()
    demo_path = DATASETS_DIR / "rees46_demo_sample.csv"
    
    if not active or not demo_path.exists():
        print("[Startup] Initializing REES46 synthetic demonstration dataset...")
        try:
            generate_demo_dataset(num_sessions=1200, output_filename="rees46_demo_sample.csv")
            df, summary = load_and_preprocess_dataset(str(demo_path), dataset_id="dataset_demo_rees46")
            sess_events = sessionize_events(df)
            sessions_df = extract_session_features(sess_events)
            
            save_dataset_meta(
                dataset_id="dataset_demo_rees46",
                name="REES46 E-commerce Demo Dataset (Synthetic)",
                filename="rees46_demo_sample.csv",
                filepath=str(demo_path),
                row_count=summary["clean_rows"],
                user_count=summary["unique_users"],
                session_count=len(sessions_df),
                is_demo=True,
                is_active=True,
                summary=summary
            )
            
            print("[Startup] Training baseline machine learning models...")
            train_and_evaluate_models(sessions_df)
            print("[Startup] CartWise AI backend ready with active demonstration dataset!")
        except Exception as e:
            print(f"[Startup Warning] Could not auto-seed demo data: {e}")
    else:
        # Load existing active dataset into memory cache
        try:
            df, summary = load_and_preprocess_dataset(active["filepath"], dataset_id=active["id"])
            sess_events = sessionize_events(df)
            extract_session_features(sess_events)
            print(f"[Startup] Loaded active dataset '{active['name']}' with {len(df)} records into cache.")
        except Exception as e:
            print(f"[Startup Warning] Could not preload active dataset: {e}")
            
    yield

# Health & Meta endpoints
async def handle_health(request: Request):
    return JSONResponse({
        "status": "healthy",
        "service": "CartWise AI Backend",
        "version": "1.0.0"
    })

async def handle_openapi(request: Request):
    """OpenAPI 3.0 specification for Swagger UI."""
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "CartWise AI API",
            "version": "1.0.0",
            "description": "E-commerce Customer Behaviour Mining and Cart Abandonment Prediction API"
        },
        "paths": {
            "/api/health": {"get": {"summary": "Service health check", "responses": {"200": {"description": "Healthy"}}}},
            "/api/dataset/upload": {"post": {"summary": "Upload a CSV dataset", "responses": {"200": {"description": "Dataset uploaded"}}}},
            "/api/dataset/load-demo": {"post": {"summary": "Load synthetic REES46 demo dataset", "responses": {"200": {"description": "Demo dataset loaded"}}}},
            "/api/dataset/list": {"get": {"summary": "List all datasets", "responses": {"200": {"description": "List of datasets"}}}},
            "/api/dataset/active": {"get": {"summary": "Get active dataset info", "responses": {"200": {"description": "Active dataset metadata"}}}},
            "/api/eda/summary": {"get": {"summary": "Exploratory data analysis summary", "responses": {"200": {"description": "EDA stats"}}}},
            "/api/mining/overview": {"get": {"summary": "Web usage mining overview & sequences", "responses": {"200": {"description": "Mining metrics"}}}},
            "/api/abandonment/metrics": {"get": {"summary": "Cart abandonment KPIs & comparisons", "responses": {"200": {"description": "Abandonment metrics"}}}},
            "/api/ml/metrics": {"get": {"summary": "ML evaluation metrics, confusion matrix, ROC curve", "responses": {"200": {"description": "Model metrics"}}}},
            "/api/ml/predict": {"post": {"summary": "Inference endpoint for abandonment prediction", "responses": {"200": {"description": "Prediction result"}}}},
            "/api/segmentation/clusters": {"get": {"summary": "Customer K-Means clustering & PCA scatter data", "responses": {"200": {"description": "Clusters"}}}}
        }
    }
    return JSONResponse(spec)

async def handle_docs(request: Request):
    """Serves standard interactive Swagger UI."""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>CartWise AI - API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body style="margin: 0; background: #fafafa;">
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            deepLinking: true
          });
        };
      </script>
    </body>
    </html>
    """
    return HTMLResponse(html_content)

# Routes definitions
routes = [
    Route("/health", handle_health, methods=["GET"]),
    Route("/api/health", handle_health, methods=["GET"]),
    Route("/docs", handle_docs, methods=["GET"]),
    Route("/openapi.json", handle_openapi, methods=["GET"]),
    
    # Dataset routes
    Route("/api/dataset/upload", handle_upload_csv, methods=["POST"]),
    Route("/api/dataset/load-demo", handle_load_demo, methods=["POST"]),
    Route("/api/dataset/list", handle_list_datasets, methods=["GET"]),
    Route("/api/dataset/active", handle_get_active_dataset, methods=["GET"]),
    Route("/api/dataset/set-active", handle_set_active_dataset, methods=["POST"]),
    
    # EDA routes
    Route("/api/eda/summary", handle_eda_summary, methods=["GET"]),
    Route("/api/eda/hourly", handle_eda_hourly, methods=["GET"]),
    Route("/api/eda/price-distribution", handle_eda_price_distribution, methods=["GET"]),
    Route("/api/eda/categories", handle_eda_categories, methods=["GET"]),
    
    # Mining routes
    Route("/api/mining/overview", handle_mining_overview, methods=["GET"]),
    
    # Abandonment routes
    Route("/api/abandonment/metrics", handle_abandonment_metrics, methods=["GET"]),
    Route("/api/abandonment/by-category", handle_abandonment_by_category, methods=["GET"]),
    Route("/api/abandonment/by-price", handle_abandonment_by_price, methods=["GET"]),
    
    # ML routes
    Route("/api/ml/train", handle_train_models, methods=["POST"]),
    Route("/api/ml/metrics", handle_get_model_metrics, methods=["GET"]),
    Route("/api/ml/predict", handle_predict, methods=["POST"]),
    
    # Segmentation routes
    Route("/api/segmentation/clusters", handle_get_clusters, methods=["GET"]),
    
    # Dashboard & Insights routes
    Route("/api/analytics/overview", handle_dashboard_overview, methods=["GET"]),
    Route("/api/insights/recommendations", handle_get_insights, methods=["GET"]),
]

# Mount frontend static files and SPA fallback if frontend/dist exists
if (FRONTEND_DIST / "assets").exists():
    routes.append(Mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets"))
if FRONTEND_DIST.exists():
    routes.append(Route("/{path:path}", handle_spa_fallback, methods=["GET"]))

# CORS Middleware to support modern SPA Frontend
middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True
    )
]

app = Starlette(
    debug=True,
    routes=routes,
    middleware=middleware,
    lifespan=lifespan
)
