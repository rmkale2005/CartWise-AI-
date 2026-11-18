"""
Data Preprocessing and Validation Engine for CartWise AI
"""
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np

# In-memory cache for processed active dataset
_ACTIVE_DATAFRAME_CACHE: Optional[pd.DataFrame] = None
_ACTIVE_DATASET_ID: Optional[str] = None

# Column alias mappings to accommodate various clickstream formats
COLUMN_ALIASES = {
    "event_time": ["event_time", "timestamp", "time", "date_time", "datetime"],
    "event_type": ["event_type", "action", "type", "event", "activity"],
    "product_id": ["product_id", "item_id", "product", "sku"],
    "category_code": ["category_code", "category", "category_name", "product_category"],
    "category_id": ["category_id", "cat_id"],
    "brand": ["brand", "manufacturer", "vendor"],
    "price": ["price", "amount", "cost", "item_price"],
    "user_id": ["user_id", "customer_id", "visitor_id", "client_id"],
    "user_session": ["user_session", "session_id", "session"]
}

def detect_and_normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names based on known aliases."""
    col_mapping = {}
    lower_cols = {c.lower().strip(): c for c in df.columns}
    
    for standard_col, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias.lower() in lower_cols:
                col_mapping[lower_cols[alias.lower()]] = standard_col
                break
                
    df = df.rename(columns=col_mapping)
    return df

def validate_dataset(filepath: str) -> Tuple[bool, str, Dict[str, Any]]:
    """Inspect CSV and validate minimum requirements."""
    try:
        sample_df = pd.read_csv(filepath, nrows=50)
        sample_df = detect_and_normalize_columns(sample_df)
        
        required = ["event_type", "user_id"]
        missing = [c for c in required if c not in sample_df.columns]
        if missing:
            return False, f"Missing essential columns: {', '.join(missing)}", {}
            
        has_time = "event_time" in sample_df.columns
        has_price = "price" in sample_df.columns
        has_session = "user_session" in sample_df.columns
        
        info = {
            "columns": list(sample_df.columns),
            "has_timestamps": has_time,
            "has_price": has_price,
            "has_session_id": has_session,
            "sample_rows": sample_df.head(3).to_dict(orient="records")
        }
        return True, "Dataset structure is valid", info
    except Exception as e:
        return False, f"Error inspecting CSV: {str(e)}", {}

def load_and_preprocess_dataset(filepath: str, dataset_id: str = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Clean, type-cast, and preprocess the dataset."""
    global _ACTIVE_DATAFRAME_CACHE, _ACTIVE_DATASET_ID
    
    # Read CSV
    df = pd.read_csv(filepath)
    raw_count = len(df)
    
    # Normalize column names
    df = detect_and_normalize_columns(df)
    
    # Deduplicate
    df = df.drop_duplicates()
    dedup_count = len(df)
    
    # Clean event_type
    if "event_type" in df.columns:
        df["event_type"] = df["event_type"].astype(str).str.lower().str.strip()
        # map known equivalents
        df["event_type"] = df["event_type"].replace({
            "buy": "purchase",
            "add_to_cart": "cart",
            "detail": "view",
            "pageview": "view"
        })
    else:
        df["event_type"] = "view"
        
    # Clean timestamps
    if "event_time" in df.columns:
        # Clean UTC suffixes
        clean_time = df["event_time"].astype(str).str.replace(" UTC", "").str.strip()
        df["parsed_time"] = pd.to_datetime(clean_time, errors="coerce")
        # Drop rows with null timestamps
        df = df.dropna(subset=["parsed_time"])
        df = df.sort_values("parsed_time").reset_index(drop=True)
    else:
        # Synthesize chronological order
        df["parsed_time"] = pd.date_range(start="2026-10-01", periods=len(df), freq="1min")
        
    # Clean price
    if "price" in df.columns:
        df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0.0)
        df.loc[df["price"] < 0, "price"] = 0.0
    else:
        df["price"] = 0.0
        
    # Clean category & brand
    if "category_code" not in df.columns:
        df["category_code"] = "general.other"
    else:
        df["category_code"] = df["category_code"].fillna("general.other").astype(str)
        
    if "brand" not in df.columns:
        df["brand"] = "generic"
    else:
        df["brand"] = df["brand"].fillna("generic").astype(str)
        
    if "product_id" not in df.columns:
        df["product_id"] = "unknown"
    else:
        df["product_id"] = df["product_id"].astype(str)
        
    if "user_id" in df.columns:
        df["user_id"] = df["user_id"].astype(str)
    else:
        df["user_id"] = "user_1"
        
    # Generate dataset summary
    summary = {
        "raw_rows": raw_count,
        "clean_rows": len(df),
        "duplicates_removed": raw_count - dedup_count,
        "unique_users": int(df["user_id"].nunique()),
        "unique_products": int(df["product_id"].nunique()),
        "start_date": str(df["parsed_time"].min()),
        "end_date": str(df["parsed_time"].max()),
        "event_counts": df["event_type"].value_counts().to_dict(),
        "total_revenue": round(float(df[df["event_type"] == "purchase"]["price"].sum()), 2)
    }
    
    _ACTIVE_DATAFRAME_CACHE = df
    _ACTIVE_DATASET_ID = dataset_id
    
    return df, summary

def get_active_dataframe() -> Optional[pd.DataFrame]:
    global _ACTIVE_DATAFRAME_CACHE, _ACTIVE_DATASET_ID
    if _ACTIVE_DATAFRAME_CACHE is None:
        from app.database import get_active_dataset
        active = get_active_dataset()
        if active and Path(active["filepath"]).exists():
            df, _ = load_and_preprocess_dataset(active["filepath"], dataset_id=active["id"])
            return df
    return _ACTIVE_DATAFRAME_CACHE

def set_active_dataframe(df: pd.DataFrame, dataset_id: str):
    global _ACTIVE_DATAFRAME_CACHE, _ACTIVE_DATASET_ID
    _ACTIVE_DATAFRAME_CACHE = df
    _ACTIVE_DATASET_ID = dataset_id
