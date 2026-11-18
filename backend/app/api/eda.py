"""
Exploratory Data Analysis (EDA) API Endpoints
"""
import pandas as pd
import numpy as np
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.data_processor import get_active_dataframe
from app.services.sessionizer import get_active_sessions

def ensure_active_data():
    df = get_active_dataframe()
    if df is None:
        raise ValueError("No active dataset loaded. Please upload or load demo dataset first.")
    return df

async def handle_eda_summary(request: Request):
    """Calculates overall clickstream distribution and price metrics."""
    try:
        df = ensure_active_data()
        
        event_counts = df["event_type"].value_counts().to_dict()
        total_events = len(df)
        
        event_breakdown = [
            {
                "event_type": str(et),
                "count": int(cnt),
                "percentage": round(cnt / total_events * 100, 1)
            }
            for et, cnt in event_counts.items()
        ]
        
        prices = df[df["price"] > 0]["price"]
        price_stats = {
            "min": round(float(prices.min()), 2) if not prices.empty else 0.0,
            "max": round(float(prices.max()), 2) if not prices.empty else 0.0,
            "mean": round(float(prices.mean()), 2) if not prices.empty else 0.0,
            "median": round(float(prices.median()), 2) if not prices.empty else 0.0,
            "q25": round(float(prices.quantile(0.25)), 2) if not prices.empty else 0.0,
            "q75": round(float(prices.quantile(0.75)), 2) if not prices.empty else 0.0,
        }
        
        return JSONResponse({
            "total_events": total_events,
            "unique_users": int(df["user_id"].nunique()),
            "unique_products": int(df["product_id"].nunique()),
            "unique_categories": int(df["category_code"].nunique()),
            "event_breakdown": event_breakdown,
            "price_stats": price_stats,
            "date_range": {
                "start": str(df["parsed_time"].min()),
                "end": str(df["parsed_time"].max())
            }
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_eda_hourly(request: Request):
    """Calculates event activity by hour of day (0-23)."""
    try:
        df = ensure_active_data()
        
        df_copy = df.copy()
        df_copy["hour"] = df_copy["parsed_time"].dt.hour
        
        hourly = df_copy.groupby(["hour", "event_type"]).size().unstack(fill_value=0)
        
        hours_data = []
        for h in range(24):
            views = int(hourly.loc[h, "view"]) if h in hourly.index and "view" in hourly.columns else 0
            carts = int(hourly.loc[h, "cart"]) if h in hourly.index and "cart" in hourly.columns else 0
            purchases = int(hourly.loc[h, "purchase"]) if h in hourly.index and "purchase" in hourly.columns else 0
            hours_data.append({
                "hour": f"{h:02d}:00",
                "views": views,
                "carts": carts,
                "purchases": purchases,
                "total": views + carts + purchases
            })
            
        return JSONResponse({"hourly_activity": hours_data})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_eda_price_distribution(request: Request):
    """Bins prices into readable ranges for histogram visual."""
    try:
        df = ensure_active_data()
        
        price_df = df[df["price"] > 0]
        bins = [0, 50, 150, 300, 600, 1000, 2500, float("inf")]
        labels = ["<$50", "$50-150", "$150-300", "$300-600", "$600-1000", "$1000-2500", ">$2500"]
        
        binned = pd.cut(price_df["price"], bins=bins, labels=labels).value_counts().reindex(labels, fill_value=0)
        distribution = [{"bracket": str(k), "count": int(v)} for k, v in binned.items()]
        
        return JSONResponse({"price_distribution": distribution})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)

async def handle_eda_categories(request: Request):
    """Top product categories with event volumes and revenue."""
    try:
        df = ensure_active_data()
        
        cat_stats = df.groupby("category_code").agg(
            total_events=("event_type", "count"),
            views=("event_type", lambda x: (x == "view").sum()),
            carts=("event_type", lambda x: (x == "cart").sum()),
            purchases=("event_type", lambda x: (x == "purchase").sum()),
            revenue=("price", lambda x: df.loc[x.index][df.loc[x.index, "event_type"] == "purchase"]["price"].sum())
        ).reset_index()
        
        cat_stats = cat_stats.sort_values("total_events", ascending=False).head(10)
        
        categories = [
            {
                "category": row["category_code"],
                "total_events": int(row["total_events"]),
                "views": int(row["views"]),
                "carts": int(row["carts"]),
                "purchases": int(row["purchases"]),
                "revenue": round(float(row["revenue"]), 2)
            }
            for _, row in cat_stats.iterrows()
        ]
        
        return JSONResponse({"top_categories": categories})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
