"""
Web Usage Mining & Sessionization Engine for CartWise AI
Groups clickstream events into sessions, extracts browsing sequences,
calculates duration, time-to-cart, transition matrices, and abandonment metrics.
"""
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from datetime import timedelta
from app.config import DEFAULT_INACTIVITY_TIMEOUT_SECONDS

# In-memory cache for session records
_ACTIVE_SESSIONS_CACHE: Optional[pd.DataFrame] = None
_ACTIVE_SESSIONS_DATASET_ID: Optional[str] = None

def sessionize_events(
    df: pd.DataFrame,
    inactivity_seconds: int = DEFAULT_INACTIVITY_TIMEOUT_SECONDS,
    force_recompute: bool = False
) -> pd.DataFrame:
    """
    Groups clickstream events into user sessions using an inactivity window.
    If 'user_session' is already present and valid, can leverage it or re-derive.
    """
    df_sorted = df.sort_values(["user_id", "parsed_time"]).copy()
    
    # Calculate time delta between consecutive events for the same user
    df_sorted["prev_time"] = df_sorted.groupby("user_id")["parsed_time"].shift(1)
    df_sorted["time_diff"] = (df_sorted["parsed_time"] - df_sorted["prev_time"]).dt.total_seconds()
    
    # New session starts if time_diff is NaN (first event for user) or time_diff > inactivity threshold
    df_sorted["is_new_session"] = (df_sorted["time_diff"].isna()) | (df_sorted["time_diff"] > inactivity_seconds)
    df_sorted["session_seq"] = df_sorted.groupby("user_id")["is_new_session"].cumsum()
    df_sorted["computed_session_id"] = "sess_" + df_sorted["user_id"].astype(str) + "_" + df_sorted["session_seq"].astype(str)
    
    # If user_session was absent or re-sessionization is requested, use computed_session_id
    if "user_session" not in df_sorted.columns or force_recompute or df_sorted["user_session"].isna().mean() > 0.3:
        df_sorted["final_session_id"] = df_sorted["computed_session_id"]
    else:
        df_sorted["final_session_id"] = df_sorted["user_session"].fillna(df_sorted["computed_session_id"])
        
    return df_sorted

def extract_session_features(events_df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms event logs into session-level behavioral features.
    """
    global _ACTIVE_SESSIONS_CACHE
    
    sessions = []
    grouped = events_df.groupby("final_session_id")
    
    for session_id, group in grouped:
        group = group.sort_values("parsed_time")
        user_id = group["user_id"].iloc[0]
        start_time = group["parsed_time"].iloc[0]
        end_time = group["parsed_time"].iloc[-1]
        duration_seconds = max(1.0, (end_time - start_time).total_seconds())
        
        event_types = group["event_type"].tolist()
        view_count = event_types.count("view")
        cart_count = event_types.count("cart")
        purchase_count = event_types.count("purchase")
        total_interactions = len(event_types)
        
        unique_products = group["product_id"].nunique()
        unique_categories = group["category_code"].nunique()
        avg_price = float(group["price"].mean()) if "price" in group.columns else 0.0
        max_price = float(group["price"].max()) if "price" in group.columns else 0.0
        
        cart_rows = group[group["event_type"] == "cart"]
        total_cart_value = float(cart_rows["price"].sum()) if not cart_rows.empty else 0.0
        
        # Time to first cart
        if cart_count > 0:
            first_cart_time = cart_rows["parsed_time"].iloc[0]
            time_to_first_cart = max(0.0, (first_cart_time - start_time).total_seconds())
            views_before_cart = len(group[(group["parsed_time"] < first_cart_time) & (group["event_type"] == "view")])
        else:
            time_to_first_cart = 0.0
            views_before_cart = view_count
            
        # Browsing sequence representation
        seq_tokens = []
        for et in event_types:
            if not seq_tokens or seq_tokens[-1] != et:
                seq_tokens.append(et)
        sequence_str = " -> ".join(seq_tokens)
        
        # Outcome determination
        has_cart = cart_count > 0
        has_purchase = purchase_count > 0
        
        if has_cart and not has_purchase:
            session_category = "abandoned"
            is_abandoned = 1
        elif has_purchase:
            session_category = "converted"
            is_abandoned = 0
        else:
            session_category = "browse_only"
            is_abandoned = None  # Not part of abandonment target pool
            
        sessions.append({
            "session_id": session_id,
            "user_id": user_id,
            "start_time": start_time,
            "end_time": end_time,
            "duration_seconds": round(duration_seconds, 1),
            "duration_minutes": round(duration_seconds / 60.0, 2),
            "view_count": view_count,
            "cart_count": cart_count,
            "purchase_count": purchase_count,
            "total_interactions": total_interactions,
            "unique_products": unique_products,
            "unique_categories": unique_categories,
            "avg_price": round(avg_price, 2),
            "max_price": round(max_price, 2),
            "total_cart_value": round(total_cart_value, 2),
            "time_to_first_cart": round(time_to_first_cart, 1),
            "views_before_cart": views_before_cart,
            "cart_to_view_ratio": round(cart_count / max(1, view_count), 3),
            "hour_of_day": start_time.hour,
            "day_of_week": start_time.weekday(),
            "has_cart": has_cart,
            "has_purchase": has_purchase,
            "is_abandoned": is_abandoned,
            "session_category": session_category,
            "sequence": sequence_str,
            "primary_category": group["category_code"].iloc[0] if "category_code" in group.columns else "general"
        })
        
    sessions_df = pd.DataFrame(sessions)
    _ACTIVE_SESSIONS_CACHE = sessions_df
    return sessions_df

def get_mining_analytics(sessions_df: pd.DataFrame, events_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes web usage mining stats: sequence frequencies, transition matrix,
    duration bins, view vs cart correlations.
    """
    # 1. Top Sequences
    sequence_counts = sessions_df["sequence"].value_counts().head(8).to_dict()
    top_sequences = [
        {"sequence": seq, "count": count, "percentage": round(count / len(sessions_df) * 100, 1)}
        for seq, count in sequence_counts.items()
    ]
    
    # 2. First-order Markov Transition Probabilities between clickstream events
    # Transitions: view->view, view->cart, cart->purchase, cart->view, etc.
    transition_pairs = []
    for _, group in events_df.groupby("final_session_id"):
        evs = group["event_type"].tolist()
        for i in range(len(evs) - 1):
            transition_pairs.append((evs[i], evs[i+1]))
        if evs:
            transition_pairs.append((evs[-1], "session_end"))
            
    t_df = pd.DataFrame(transition_pairs, columns=["from_state", "to_state"])
    t_counts = t_df.groupby(["from_state", "to_state"]).size().unstack(fill_value=0)
    # Probabilities
    t_probs = t_counts.div(t_counts.sum(axis=1), axis=0).round(3).fillna(0.0)
    
    matrix_data = []
    states = list(t_probs.index)
    all_targets = list(t_probs.columns)
    for s in states:
        row = {"state": s}
        for target in all_targets:
            row[target] = float(t_probs.loc[s, target])
        matrix_data.append(row)
        
    # 3. Session Duration Distribution (bins: <1m, 1-3m, 3-5m, 5-10m, 10-20m, 20m+)
    bins = [0, 60, 180, 300, 600, 1200, float("inf")]
    labels = ["< 1 min", "1-3 mins", "3-5 mins", "5-10 mins", "10-20 mins", "> 20 mins"]
    duration_binned = pd.cut(sessions_df["duration_seconds"], bins=bins, labels=labels).value_counts().reindex(labels, fill_value=0)
    duration_distribution = [{"bracket": str(k), "count": int(v)} for k, v in duration_binned.items()]
    
    # 4. View vs Cart Correlation Bins
    vc_bins = [0, 2, 5, 10, 20, float("inf")]
    vc_labels = ["1-2 Views", "3-5 Views", "6-10 Views", "11-20 Views", "21+ Views"]
    sessions_df["view_bin"] = pd.cut(sessions_df["view_count"], bins=vc_bins, labels=vc_labels)
    views_vs_carts = sessions_df.groupby("view_bin", observed=False).agg(
        avg_carts=("cart_count", "mean"),
        avg_purchases=("purchase_count", "mean"),
        session_count=("session_id", "count")
    ).reset_index().fillna(0.0)
    
    views_vs_carts_data = [
        {
            "views_bracket": str(row["view_bin"]),
            "avg_carts": round(float(row["avg_carts"]), 2),
            "avg_purchases": round(float(row["avg_purchases"]), 2),
            "session_count": int(row["session_count"])
        }
        for _, row in views_vs_carts.iterrows()
    ]
    
    return {
        "top_sequences": top_sequences,
        "transition_matrix": matrix_data,
        "duration_distribution": duration_distribution,
        "views_vs_carts": views_vs_carts_data,
        "avg_session_duration_sec": round(float(sessions_df["duration_seconds"].mean()), 1),
        "avg_views_per_session": round(float(sessions_df["view_count"].mean()), 2),
        "avg_carts_per_session": round(float(sessions_df["cart_count"].mean()), 2),
        "avg_time_to_first_cart_sec": round(float(sessions_df[sessions_df["has_cart"]]["time_to_first_cart"].mean()), 1) if sessions_df["has_cart"].any() else 0.0
    }

def get_active_sessions() -> Optional[pd.DataFrame]:
    global _ACTIVE_SESSIONS_CACHE
    if _ACTIVE_SESSIONS_CACHE is None:
        from app.services.data_processor import get_active_dataframe
        df = get_active_dataframe()
        if df is not None:
            sess_events = sessionize_events(df)
            extract_session_features(sess_events)
    return _ACTIVE_SESSIONS_CACHE

def set_active_sessions(sessions_df: pd.DataFrame):
    global _ACTIVE_SESSIONS_CACHE
    _ACTIVE_SESSIONS_CACHE = sessions_df
