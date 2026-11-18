"""
Web Usage Mining API Endpoints
"""
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.data_processor import get_active_dataframe
from app.services.sessionizer import (
    get_active_sessions,
    get_mining_analytics,
    sessionize_events,
    extract_session_features
)

def ensure_sessions():
    sessions = get_active_sessions()
    if sessions is None:
        df = get_active_dataframe()
        if df is None:
            raise ValueError("No active dataset loaded. Please upload or load demo dataset first.")
        sess_events = sessionize_events(df)
        sessions = extract_session_features(sess_events)
    return sessions

async def handle_mining_overview(request: Request):
    """Returns Web Usage Mining summary indicators and sequence metrics."""
    try:
        sessions_df = ensure_sessions()
        df = get_active_dataframe()
        if "final_session_id" not in df.columns:
            df = sessionize_events(df)
            
        analytics = get_mining_analytics(sessions_df, df)
        
        return JSONResponse({
            "status": "success",
            "total_sessions": len(sessions_df),
            "overview": {
                "avg_duration_sec": analytics["avg_session_duration_sec"],
                "avg_duration_min": round(analytics["avg_session_duration_sec"] / 60.0, 2),
                "avg_views_per_session": analytics["avg_views_per_session"],
                "avg_carts_per_session": analytics["avg_carts_per_session"],
                "avg_time_to_first_cart_sec": analytics["avg_time_to_first_cart_sec"]
            },
            "top_sequences": analytics["top_sequences"],
            "transition_matrix": analytics["transition_matrix"],
            "duration_distribution": analytics["duration_distribution"],
            "views_vs_carts": analytics["views_vs_carts"]
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)
