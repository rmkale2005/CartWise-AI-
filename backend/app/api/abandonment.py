"""
Cart Abandonment Analysis API Endpoints
"""
import pandas as pd
import numpy as np
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.sessionizer import get_active_sessions
from app.services.data_processor import get_active_dataframe

def ensure_sessions_df():
    sessions = get_active_sessions()
    if sessions is None or sessions.empty:
        raise ValueError("No active sessions found. Please load or upload a dataset first.")
    return sessions

async def handle_abandonment_metrics(request: Request):
    """
    Computes rigorous cart abandonment KPIs strictly following academic definitions.
    """
    try:
        sessions = ensure_sessions_df()
        
        total_sessions = len(sessions)
        cart_sessions = sessions[sessions["has_cart"] == True]
        total_cart_sessions = len(cart_sessions)
        
        abandoned_sessions = sessions[sessions["session_category"] == "abandoned"]
        converted_sessions = sessions[sessions["session_category"] == "converted"]
        browse_only_sessions = sessions[sessions["session_category"] == "browse_only"]
        
        num_abandoned = len(abandoned_sessions)
        num_converted = len(converted_sessions)
        num_browse = len(browse_only_sessions)
        
        # Rigorous rates
        cart_abandonment_rate = round((num_abandoned / max(1, total_cart_sessions)) * 100, 1)
        session_conversion_rate = round((num_converted / max(1, total_sessions)) * 100, 1)
        cart_to_purchase_rate = round((num_converted / max(1, total_cart_sessions)) * 100, 1)
        
        # Financial impacts
        potential_lost_revenue = round(float(abandoned_sessions["total_cart_value"].sum()), 2)
        realized_revenue = round(float(converted_sessions["total_cart_value"].sum()), 2)
        
        # Comparison metrics
        comparison = {
            "avg_views": {
                "abandoned": round(float(abandoned_sessions["view_count"].mean()), 1) if num_abandoned else 0.0,
                "converted": round(float(converted_sessions["view_count"].mean()), 1) if num_converted else 0.0,
                "browse_only": round(float(browse_only_sessions["view_count"].mean()), 1) if num_browse else 0.0
            },
            "avg_duration_min": {
                "abandoned": round(float(abandoned_sessions["duration_seconds"].mean() / 60.0), 1) if num_abandoned else 0.0,
                "converted": round(float(converted_sessions["duration_seconds"].mean() / 60.0), 1) if num_converted else 0.0,
                "browse_only": round(float(browse_only_sessions["duration_seconds"].mean() / 60.0), 1) if num_browse else 0.0
            },
            "avg_cart_value": {
                "abandoned": round(float(abandoned_sessions["total_cart_value"].mean()), 2) if num_abandoned else 0.0,
                "converted": round(float(converted_sessions["total_cart_value"].mean()), 2) if num_converted else 0.0
            },
            "avg_time_to_first_cart_sec": {
                "abandoned": round(float(abandoned_sessions["time_to_first_cart"].mean()), 1) if num_abandoned else 0.0,
                "converted": round(float(converted_sessions["time_to_first_cart"].mean()), 1) if num_converted else 0.0
            }
        }
        
        # Funnel representation
        funnel = [
            {"stage": "Total Shopping Sessions", "count": total_sessions, "percentage": 100.0},
            {"stage": "Sessions with Add-to-Cart", "count": total_cart_sessions, "percentage": round(total_cart_sessions / max(1, total_sessions) * 100, 1)},
            {"stage": "Completed Purchases (Converted)", "count": num_converted, "percentage": round(num_converted / max(1, total_sessions) * 100, 1)}
        ]
        
        return JSONResponse({
            "kpis": {
                "total_sessions": total_sessions,
                "total_cart_sessions": total_cart_sessions,
                "abandoned_sessions": num_abandoned,
                "converted_sessions": num_converted,
                "browse_only_sessions": num_browse,
                "cart_abandonment_rate": cart_abandonment_rate,
                "session_conversion_rate": session_conversion_rate,
                "cart_to_purchase_rate": cart_to_purchase_rate,
                "potential_lost_revenue": potential_lost_revenue,
                "realized_revenue": realized_revenue,
                "avg_session_duration_min": round(float(sessions["duration_seconds"].mean() / 60.0), 1),
                "avg_product_views": round(float(sessions["view_count"].mean()), 1)
            },
            "comparison": comparison,
            "funnel": funnel
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_abandonment_by_category(request: Request):
    """Calculates cart abandonment rate partitioned by primary category."""
    try:
        sessions = ensure_sessions_df()
        cart_sessions = sessions[sessions["has_cart"] == True]
        
        cat_group = cart_sessions.groupby("primary_category").agg(
            total_cart_sessions=("session_id", "count"),
            abandoned_count=("is_abandoned", lambda x: (x == 1).sum()),
            converted_count=("is_abandoned", lambda x: (x == 0).sum()),
            lost_revenue=("total_cart_value", lambda x: cart_sessions.loc[x.index][cart_sessions.loc[x.index, "is_abandoned"] == 1]["total_cart_value"].sum())
        ).reset_index()
        
        cat_group["abandonment_rate"] = (cat_group["abandoned_count"] / cat_group["total_cart_sessions"] * 100).round(1)
        cat_group = cat_group.sort_values("total_cart_sessions", ascending=False).head(10)
        
        categories = [
            {
                "category": row["primary_category"],
                "total_cart_sessions": int(row["total_cart_sessions"]),
                "abandoned": int(row["abandoned_count"]),
                "converted": int(row["converted_count"]),
                "abandonment_rate": float(row["abandonment_rate"]),
                "lost_revenue": round(float(row["lost_revenue"]), 2)
            }
            for _, row in cat_group.iterrows()
        ]
        
        return JSONResponse({"categories": categories})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_abandonment_by_price(request: Request):
    """Calculates abandonment rate across cart total value brackets."""
    try:
        sessions = ensure_sessions_df()
        cart_sessions = sessions[sessions["has_cart"] == True].copy()
        
        bins = [0, 100, 300, 600, 1200, float("inf")]
        labels = ["<$100", "$100-300", "$300-600", "$600-1200", ">$1200"]
        
        cart_sessions["price_tier"] = pd.cut(cart_sessions["total_cart_value"], bins=bins, labels=labels)
        tier_group = cart_sessions.groupby("price_tier", observed=False).agg(
            total=("session_id", "count"),
            abandoned=("is_abandoned", lambda x: (x == 1).sum()),
            converted=("is_abandoned", lambda x: (x == 0).sum())
        ).reset_index()
        
        tier_group["abandonment_rate"] = np.where(
            tier_group["total"] > 0,
            (tier_group["abandoned"] / tier_group["total"] * 100).round(1),
            0.0
        )
        
        tiers = [
            {
                "tier": str(row["price_tier"]),
                "total": int(row["total"]),
                "abandoned": int(row["abandoned"]),
                "converted": int(row["converted"]),
                "abandonment_rate": float(row["abandonment_rate"])
            }
            for _, row in tier_group.iterrows()
        ]
        
        return JSONResponse({"price_tiers": tiers})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
