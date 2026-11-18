"""
Machine Learning Engine for Cart Abandonment Prediction
Trains Logistic Regression (Baseline) and Random Forest (Primary),
performs chronological evaluation, exports metrics, and provides live inference.
"""
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)
from app.config import MODELS_DIR

# Feature definitions for ML model (strictly leak-free: only features observable prior to or at cart decision)
FEATURE_COLS = [
    "view_count",
    "cart_count",
    "duration_seconds",
    "time_to_first_cart",
    "views_before_cart",
    "unique_products",
    "unique_categories",
    "avg_price",
    "total_cart_value",
    "cart_to_view_ratio",
    "hour_of_day",
    "day_of_week"
]

FEATURE_LABELS = {
    "view_count": "Total Product Views",
    "cart_count": "Items Added to Cart",
    "duration_seconds": "Session Duration (seconds)",
    "time_to_first_cart": "Time to First Cart Addition (seconds)",
    "views_before_cart": "Product Views Before Adding to Cart",
    "unique_products": "Unique Products Explored",
    "unique_categories": "Product Categories Explored",
    "avg_price": "Average Product Price ($)",
    "total_cart_value": "Total Cart Value ($)",
    "cart_to_view_ratio": "Cart-to-View Ratio",
    "hour_of_day": "Hour of Day (0-23)",
    "day_of_week": "Day of Week (0-6)"
}

_TRAINED_MODELS_CACHE: Dict[str, Any] = {}

def prepare_ml_dataset(sessions_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Filters sessions to those with at least one cart addition (cart_count >= 1)
    and prepares feature matrix X and target vector y.
    """
    cart_sessions = sessions_df[sessions_df["has_cart"] == True].copy()
    if cart_sessions.empty:
        raise ValueError("No cart-addition sessions available in the dataset for abandonment training.")
        
    cart_sessions = cart_sessions.sort_values("start_time").reset_index(drop=True)
    
    # Missing values in features
    for col in FEATURE_COLS:
        if col not in cart_sessions.columns:
            cart_sessions[col] = 0.0
        else:
            cart_sessions[col] = pd.to_numeric(cart_sessions[col], errors="coerce").fillna(0.0)
            
    X = cart_sessions[FEATURE_COLS]
    y = cart_sessions["is_abandoned"].astype(int)
    return X, y

def train_and_evaluate_models(sessions_df: pd.DataFrame, test_size: float = 0.25) -> Dict[str, Any]:
    """
    Executes chronological split, scales features, fits Logistic Regression & Random Forest,
    calculates real evaluation metrics, and persists artifacts.
    """
    global _TRAINED_MODELS_CACHE
    X, y = prepare_ml_dataset(sessions_df)
    
    # Chronological Split (Strictly avoids temporal data leakage)
    split_idx = int(len(X) * (1.0 - test_size))
    if split_idx < 10 or (len(X) - split_idx) < 5:
        # Fallback if dataset is very small
        split_idx = max(5, int(len(X) * 0.7))
        
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Fit Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 1. Baseline: Logistic Regression
    lr = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    lr.fit(X_train_scaled, y_train)
    
    lr_preds = lr.predict(X_test_scaled)
    lr_probs = lr.predict_proba(X_test_scaled)[:, 1] if len(np.unique(y_train)) > 1 else np.ones(len(y_test)) * 0.5
    
    # 2. Primary: Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        class_weight="balanced",
        random_state=42
    )
    rf.fit(X_train, y_train)
    
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1] if len(np.unique(y_train)) > 1 else np.ones(len(y_test)) * 0.5
    
    def calculate_metrics(y_true, y_pred, y_prob):
        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))
        try:
            auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            auc = 0.5
        cm = confusion_matrix(y_true, y_pred).tolist()
        
        # ROC curve points (downsampled to 25 points for frontend charting)
        try:
            fpr, tpr, _ = roc_curve(y_true, y_prob)
            step = max(1, len(fpr) // 25)
            roc_points = [{"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3)} for i in range(0, len(fpr), step)]
            if roc_points[-1]["fpr"] != 1.0:
                roc_points.append({"fpr": 1.0, "tpr": 1.0})
        except Exception:
            roc_points = [{"fpr": 0.0, "tpr": 0.0}, {"fpr": 1.0, "tpr": 1.0}]
            
        return {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "roc_curve": roc_points
        }
        
    lr_metrics = calculate_metrics(y_test, lr_preds, lr_probs)
    rf_metrics = calculate_metrics(y_test, rf_preds, rf_probs)
    
    # Feature Importances
    rf_importances = [
        {
            "feature": col,
            "label": FEATURE_LABELS.get(col, col),
            "importance": round(float(imp), 4)
        }
        for col, imp in zip(FEATURE_COLS, rf.feature_importances_)
    ]
    rf_importances.sort(key=lambda x: x["importance"], reverse=True)
    
    lr_coefficients = [
        {
            "feature": col,
            "label": FEATURE_LABELS.get(col, col),
            "coefficient": round(float(coef), 4)
        }
        for col, coef in zip(FEATURE_COLS, lr.coef_[0])
    ]
    lr_coefficients.sort(key=lambda x: abs(x["coefficient"]), reverse=True)
    
    # Save artifacts with joblib
    model_bundle = {
        "random_forest": rf,
        "logistic_regression": lr,
        "scaler": scaler,
        "feature_cols": FEATURE_COLS,
        "feature_labels": FEATURE_LABELS,
        "rf_metrics": rf_metrics,
        "lr_metrics": lr_metrics,
        "rf_importances": rf_importances,
        "lr_coefficients": lr_coefficients,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "abandonment_rate_train": round(float(y_train.mean() * 100), 1),
        "abandonment_rate_test": round(float(y_test.mean() * 100), 1)
    }
    
    bundle_path = MODELS_DIR / "cartwise_model_bundle.joblib"
    joblib.dump(model_bundle, bundle_path)
    
    _TRAINED_MODELS_CACHE = model_bundle
    
    return {
        "status": "success",
        "models": {
            "random_forest": {
                "name": "Random Forest Classifier (Primary)",
                "metrics": rf_metrics,
                "feature_importances": rf_importances
            },
            "logistic_regression": {
                "name": "Logistic Regression (Baseline)",
                "metrics": lr_metrics,
                "coefficients": lr_coefficients
            }
        },
        "dataset_split": {
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "total_cart_sessions": len(X),
            "train_abandon_rate": round(float(y_train.mean() * 100), 1),
            "test_abandon_rate": round(float(y_test.mean() * 100), 1)
        }
    }

def get_loaded_models() -> Dict[str, Any]:
    global _TRAINED_MODELS_CACHE
    if not _TRAINED_MODELS_CACHE:
        bundle_path = MODELS_DIR / "cartwise_model_bundle.joblib"
        if bundle_path.exists():
            _TRAINED_MODELS_CACHE = joblib.load(bundle_path)
    return _TRAINED_MODELS_CACHE

def predict_abandonment(input_features: Dict[str, Any], model_type: str = "rf") -> Dict[str, Any]:
    """
    Performs inference for an incoming shopping session.
    Returns predicted outcome, probability/confidence score, and top contributing drivers.
    """
    models = get_loaded_models()
    if not models:
        raise ValueError("No trained model bundle found. Please train models first.")
        
    feature_row = []
    for col in FEATURE_COLS:
        val = float(input_features.get(col, 0.0))
        feature_row.append(val)
        
    X_input = pd.DataFrame([feature_row], columns=FEATURE_COLS)
    
    if model_type == "lr":
        scaler = models["scaler"]
        X_scaled = scaler.transform(X_input)
        lr = models["logistic_regression"]
        pred_label_idx = int(lr.predict(X_scaled)[0])
        prob_abandon = float(lr.predict_proba(X_scaled)[0][1])
        model_name = "Logistic Regression"
    else:
        rf = models["random_forest"]
        pred_label_idx = int(rf.predict(X_input)[0])
        prob_abandon = float(rf.predict_proba(X_input)[0][1])
        model_name = "Random Forest Classifier"
        
    prob_purchase = 1.0 - prob_abandon
    
    if pred_label_idx == 1:
        outcome = "Likely to Abandon"
        confidence = prob_abandon
        color = "red"
    else:
        outcome = "Likely to Purchase"
        confidence = prob_purchase
        color = "green"
        
    # Analyze key factors driving this prediction
    importances = models["rf_importances"]
    key_factors = []
    
    # Heuristic driver explanation based on feature magnitude and global importance
    view_count = input_features.get("view_count", 0)
    duration = input_features.get("duration_seconds", 0)
    cart_val = input_features.get("total_cart_value", 0)
    time_to_cart = input_features.get("time_to_first_cart", 0)
    views_before = input_features.get("views_before_cart", 0)
    
    if cart_val > 500:
        key_factors.append({
            "factor": f"High Cart Total (${cart_val:,.2f})",
            "impact": "Increases checkout hesitation / price sensitivity",
            "type": "negative" if pred_label_idx == 1 else "neutral"
        })
    elif cart_val > 0 and cart_val <= 150:
        key_factors.append({
            "factor": f"Accessible Cart Total (${cart_val:,.2f})",
            "impact": "Lower financial hurdle favors purchase completion",
            "type": "positive"
        })
        
    if time_to_cart > 300:
        key_factors.append({
            "factor": f"Delayed Cart Addition ({time_to_cart:.0f}s)",
            "impact": "Indicates high deliberation or comparison shopping across tabs",
            "type": "negative"
        })
    elif time_to_cart < 60 and time_to_cart > 0:
        key_factors.append({
            "factor": f"Fast Add-to-Cart ({time_to_cart:.0f}s)",
            "impact": "Indicates high purchase intent and targeted search",
            "type": "positive"
        })
        
    if views_before > 8:
        key_factors.append({
            "factor": f"High Pre-Cart Browsing ({views_before} views)",
            "impact": "Extensive catalog browsing without commitment",
            "type": "negative"
        })
        
    if len(key_factors) < 3:
        for item in importances[:3]:
            feat_name = item["feature"]
            feat_val = input_features.get(feat_name, 0)
            key_factors.append({
                "factor": f"{item['label']} ({feat_val})",
                "impact": f"High overall model predictive weight ({item['importance']*100:.1f}%)",
                "type": "info"
            })
            if len(key_factors) >= 3:
                break
                
    return {
        "model_used": model_name,
        "prediction": outcome,
        "is_abandoned": pred_label_idx,
        "abandonment_probability": round(prob_abandon * 100, 1),
        "purchase_probability": round(prob_purchase * 100, 1),
        "confidence_percentage": round(confidence * 100, 1),
        "color": color,
        "key_factors": key_factors[:3],
        "input_features": input_features
    }
