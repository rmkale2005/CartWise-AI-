"""
Customer & Session Segmentation Engine using K-Means Clustering for CartWise AI
Performs standardization, K-Means clustering, PCA 2D projection, and cluster profiling.
"""
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

def segment_customers(sessions_df: pd.DataFrame, n_clusters: int = 4) -> Dict[str, Any]:
    """
    Groups customer behavior into meaningful segments based on transactional and browsing metrics.
    If multiple sessions per user exist, aggregates to customer level; otherwise segments session behavior.
    """
    # Customer-level aggregation
    user_agg = sessions_df.groupby("user_id").agg(
        total_sessions=("session_id", "count"),
        total_views=("view_count", "sum"),
        total_carts=("cart_count", "sum"),
        total_purchases=("purchase_count", "sum"),
        avg_duration=("duration_seconds", "mean"),
        avg_cart_value=("total_cart_value", "mean"),
        total_spend=("total_cart_value", lambda x: sessions_df.loc[x.index, "purchase_count"].sum() * sessions_df.loc[x.index, "avg_price"].mean())
    ).reset_index()
    
    user_agg["total_spend"] = user_agg["total_spend"].fillna(0.0).round(2)
    user_agg["conversion_rate"] = (user_agg["total_purchases"] / user_agg["total_sessions"]).clip(0, 1).round(3)
    user_agg["cart_abandon_rate"] = np.where(
        user_agg["total_carts"] > 0,
        (user_agg["total_carts"] - user_agg["total_purchases"]).clip(lower=0) / user_agg["total_carts"],
        0.0
    ).round(3)

    cluster_features = [
        "total_sessions",
        "total_views",
        "total_carts",
        "total_purchases",
        "avg_duration",
        "conversion_rate",
        "cart_abandon_rate"
    ]
    
    X = user_agg[cluster_features].fillna(0.0)
    
    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    user_agg["cluster"] = kmeans.fit_predict(X_scaled)
    
    # 2D PCA for visualization
    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(X_scaled)
    user_agg["pca_x"] = coords[:, 0].round(2)
    user_agg["pca_y"] = coords[:, 1].round(2)
    
    # Dynamic Cluster Profiling based on mean values
    cluster_profiles = []
    cluster_group = user_agg.groupby("cluster")
    
    # Profile heuristic rules
    for c_id, group in cluster_group:
        mean_purchases = group["total_purchases"].mean()
        mean_carts = group["total_carts"].mean()
        mean_views = group["total_views"].mean()
        mean_duration = group["avg_duration"].mean()
        mean_abandon = group["cart_abandon_rate"].mean()
        
        # Heuristic archetype naming based on statistical centers
        if mean_purchases >= 1.0:
            name = "High-Value Loyal Buyers"
            description = "High purchasing frequency, high conversion rate, low cart drop-off. Prime candidates for loyalty rewards."
            color = "#10B981" # Green
            priority = "Retain & Upsell"
        elif mean_carts >= 1.5 and mean_abandon > 0.6:
            name = "Hesitant Cart Abandoners"
            description = "Active cart builders with high abandonment rate. Potential price or checkout friction barriers."
            color = "#F59E0B" # Amber
            priority = "Exit Intent & Recovery"
        elif mean_views > 6:
            name = "Browsing-Oriented Window Shoppers"
            description = "Heavy catalog exploration but rare cart actions. High information-gathering behavior."
            color = "#6366F1" # Indigo
            priority = "Social Proof & Urgency"
        else:
            name = "Casual / Low-Engagement Visitors"
            description = "Short visit duration, few interactions, minimal cart engagement. High bounce tendency."
            color = "#9CA3AF" # Gray
            priority = "Activation & Discovery"
            
        cluster_profiles.append({
            "cluster_id": int(c_id),
            "name": name,
            "description": description,
            "color": color,
            "priority": priority,
            "user_count": len(group),
            "percentage": round(len(group) / len(user_agg) * 100, 1),
            "metrics": {
                "avg_purchases": round(float(mean_purchases), 2),
                "avg_carts": round(float(mean_carts), 2),
                "avg_views": round(float(mean_views), 1),
                "avg_duration_sec": round(float(mean_duration), 1),
                "avg_abandonment_rate": round(float(mean_abandon * 100), 1),
                "avg_spend": round(float(group["total_spend"].mean()), 2)
            }
        })
        
    # Sample points for scatter plot (max 300 points for crisp frontend rendering)
    sample_users = user_agg.sample(min(len(user_agg), 250), random_state=42)
    scatter_points = [
        {
            "user_id": str(row["user_id"]),
            "cluster": int(row["cluster"]),
            "x": float(row["pca_x"]),
            "y": float(row["pca_y"]),
            "views": int(row["total_views"]),
            "carts": int(row["total_carts"]),
            "purchases": int(row["total_purchases"]),
            "duration": round(float(row["avg_duration"]), 1)
        }
        for _, row in sample_users.iterrows()
    ]
    
    return {
        "clusters": cluster_profiles,
        "scatter_points": scatter_points,
        "total_segmented_users": len(user_agg),
        "explained_variance_ratio": [round(float(v), 3) for v in pca.explained_variance_ratio_]
    }
