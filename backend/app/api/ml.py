"""
Machine Learning API Endpoints for Cart Abandonment Prediction
"""
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.sessionizer import get_active_sessions
from app.services.data_processor import get_active_dataframe
from app.services.ml_engine import (
    train_and_evaluate_models,
    get_loaded_models,
    predict_abandonment,
    FEATURE_COLS,
    FEATURE_LABELS
)
from app.database import (
    save_model_meta,
    get_latest_models,
    log_prediction,
    get_active_dataset
)

async def handle_train_models(request: Request):
    """Retrains Logistic Regression and Random Forest on current active dataset."""
    try:
        sessions = get_active_sessions()
        if sessions is None or sessions.empty:
            return JSONResponse({"error": "No sessions available to train models."}, status_code=400)
            
        results = train_and_evaluate_models(sessions)
        
        # Save to DB
        active_ds = get_active_dataset()
        ds_id = active_ds["id"] if active_ds else "unknown"
        
        rf_meta = results["models"]["random_forest"]
        lr_meta = results["models"]["logistic_regression"]
        
        save_model_meta(
            model_id=f"rf_{ds_id}",
            name=rf_meta["name"],
            dataset_id=ds_id,
            model_type="RandomForest",
            accuracy=rf_meta["metrics"]["accuracy"],
            precision=rf_meta["metrics"]["precision"],
            recall=rf_meta["metrics"]["recall"],
            f1=rf_meta["metrics"]["f1_score"],
            roc_auc=rf_meta["metrics"]["roc_auc"],
            metrics=rf_meta["metrics"],
            features=rf_meta["feature_importances"],
            filepath="cartwise_model_bundle.joblib"
        )
        
        save_model_meta(
            model_id=f"lr_{ds_id}",
            name=lr_meta["name"],
            dataset_id=ds_id,
            model_type="LogisticRegression",
            accuracy=lr_meta["metrics"]["accuracy"],
            precision=lr_meta["metrics"]["precision"],
            recall=lr_meta["metrics"]["recall"],
            f1=lr_meta["metrics"]["f1_score"],
            roc_auc=lr_meta["metrics"]["roc_auc"],
            metrics=lr_meta["metrics"],
            features=lr_meta["coefficients"],
            filepath="cartwise_model_bundle.joblib"
        )
        
        return JSONResponse(results)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def handle_get_model_metrics(request: Request):
    """Retrieves current trained model metrics, confusion matrix, ROC curves, feature importances."""
    try:
        models = get_loaded_models()
        if not models:
            # Attempt to auto-train if sessions exist
            sessions = get_active_sessions()
            if sessions is not None and not sessions.empty:
                train_and_evaluate_models(sessions)
                models = get_loaded_models()
            else:
                return JSONResponse({"error": "No trained models found. Please load a dataset first."}, status_code=400)
                
        return JSONResponse({
            "models": {
                "random_forest": {
                    "name": "Random Forest Classifier (Primary)",
                    "type": "Ensemble (Random Forest)",
                    "metrics": models["rf_metrics"],
                    "feature_importances": models["rf_importances"]
                },
                "logistic_regression": {
                    "name": "Logistic Regression (Baseline)",
                    "type": "Generalized Linear Model",
                    "metrics": models["lr_metrics"],
                    "coefficients": models["lr_coefficients"]
                }
            },
            "dataset_split": {
                "train_samples": models.get("train_samples", 0),
                "test_samples": models.get("test_samples", 0),
                "train_abandon_rate": models.get("abandonment_rate_train", 0),
                "test_abandon_rate": models.get("abandonment_rate_test", 0)
            },
            "feature_definitions": [
                {"feature": col, "label": FEATURE_LABELS.get(col, col)}
                for col in FEATURE_COLS
            ]
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_predict(request: Request):
    """Executes prediction on user-submitted session parameters."""
    try:
        payload = await request.json()
        model_type = payload.get("model_type", "rf")
        features = payload.get("features", {})
        
        result = predict_abandonment(features, model_type=model_type)
        
        # Log to DB
        log_prediction(
            model_name=result["model_used"],
            features=features,
            label=result["prediction"],
            prob=result["confidence_percentage"],
            factors=result["key_factors"]
        )
        
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
