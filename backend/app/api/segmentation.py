"""
Customer & Session Segmentation API Endpoints
"""
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.services.sessionizer import get_active_sessions
from app.services.cluster_engine import segment_customers

async def handle_get_clusters(request: Request):
    """Executes K-Means clustering and returns 2D PCA points and segment profiles."""
    try:
        sessions = get_active_sessions()
        if sessions is None or sessions.empty:
            return JSONResponse({"error": "No active sessions to perform segmentation."}, status_code=400)
            
        n_clusters = int(request.query_params.get("k", 4))
        results = segment_customers(sessions, n_clusters=n_clusters)
        
        return JSONResponse(results)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
