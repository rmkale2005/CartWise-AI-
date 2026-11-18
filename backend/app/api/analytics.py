"""
Business Analytics Dashboard Overview API Endpoints
"""
import pandas as pd
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.sessionizer import get_active_sessions
from app.services.data_processor import get_active_dataframe
from app.database import get_active_dataset

async def handle_dashboard_overview(request: Request):
    """Computes headline KPIs and time-series trends for the main executive dashboard."""
    try:
        sessions = get_active_sessions()
        df = get_active_dataframe()
        active_meta = get_active_dataset()
        
        if sessions is None or sessions.empty:
            return JSONResponse({
                "status": "empty",
                "message": "No active dataset loaded. Please load the demo or upload a dataset."
            })
            
        total_sessions = len(sessions)
        unique_users = sessions["user_id"].nunique()
        
        cart_sessions = sessions[sessions["has_cart"] == True]
        total_cart_sessions = len(cart_sessions)
        abandoned_sessions = sessions[sessions["session_category"] == "abandoned"]
        converted_sessions = sessions[sessions["session_category"] == "converted"]
        
        num_abandoned = len(abandoned_sessions)
        num_converted = len(converted_sessions)
        
        cart_abandonment_rate = round((num_abandoned / max(1, total_cart_sessions)) * 100, 1)
        session_conversion_rate = round((num_converted / max(1, total_sessions)) * 100, 1)
        cart_to_purchase_rate = round((num_converted / max(1, total_cart_sessions)) * 100, 1)
        
        total_purchases = int(sessions["purchase_count"].sum())
        
        # Realized revenue from purchase events
        if df is not None and "event_type" in df.columns:
            realized_revenue = round(float(df[df["event_type"] == "purchase"]["price"].sum()), 2)
        else:
            realized_revenue = round(float(converted_sessions["total_cart_value"].sum()), 2)
            
        potential_lost_revenue = round(float(abandoned_sessions["total_cart_value"].sum()), 2)
        
        # Daily timeline trend (up to last 14 days or full range)
        sessions_copy = sessions.copy()
        sessions_copy["date"] = sessions_copy["start_time"].dt.strftime("%Y-%m-%d")
        daily = sessions_copy.groupby("date").agg(
            sessions=("session_id", "count"),
            cart_sessions=("has_cart", "sum"),
            purchases=("has_purchase", "sum"),
            revenue=("total_cart_value", lambda x: sessions_copy.loc[x.index][sessions_copy.loc[x.index, "has_purchase"] == True]["total_cart_value"].sum())
        ).reset_index().sort_values("date")
        
        timeline = [
            {
                "date": row["date"],
                "sessions": int(row["sessions"]),
                "cart_sessions": int(row["cart_sessions"]),
                "purchases": int(row["purchases"]),
                "revenue": round(float(row["revenue"]), 2)
            }
            for _, row in daily.iterrows()
        ]
        
        # Category breakdown preview
        cat_counts = sessions["primary_category"].value_counts().head(5).to_dict()
        category_preview = [{"category": c, "sessions": cnt} for c, cnt in cat_counts.items()]
        
        return JSONResponse({
            "status": "ready",
            "dataset_info": {
                "name": active_meta.get("name", "Active Dataset") if active_meta else "In-Memory Dataset",
                "is_demo": bool(active_meta.get("is_demo", 0)) if active_meta else False,
                "rows": len(df) if df is not None else 0,
                "start_date": str(sessions["start_time"].min())[:10],
                "end_date": str(sessions["start_time"].max())[:10]
            },
            "kpis": {
                "total_sessions": total_sessions,
                "total_customers": unique_users,
                "total_purchases": total_purchases,
                "realized_revenue": realized_revenue,
                "potential_lost_revenue": potential_lost_revenue,
                "cart_abandonment_rate": cart_abandonment_rate,
                "session_conversion_rate": session_conversion_rate,
                "cart_to_purchase_rate": cart_to_purchase_rate,
                "avg_session_duration_min": round(float(sessions["duration_seconds"].mean() / 60.0), 1),
                "avg_views_per_session": round(float(sessions["view_count"].mean()), 1)
            },
            "timeline": timeline,
            "category_preview": category_preview
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
