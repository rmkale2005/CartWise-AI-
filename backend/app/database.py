"""
SQLite Database interface for CartWise AI metadata and logs
"""
import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.config import DB_PATH

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Datasets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS datasets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                row_count INTEGER DEFAULT 0,
                user_count INTEGER DEFAULT 0,
                session_count INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 0,
                is_demo INTEGER DEFAULT 0,
                uploaded_at TEXT NOT NULL,
                summary_json TEXT
            )
        """)
        
        # Models table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS models (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                dataset_id TEXT,
                model_type TEXT NOT NULL,
                accuracy REAL,
                precision REAL,
                recall REAL,
                f1_score REAL,
                roc_auc REAL,
                is_active INTEGER DEFAULT 0,
                trained_at TEXT NOT NULL,
                metrics_json TEXT,
                features_json TEXT,
                filepath TEXT
            )
        """)
        
        # Prediction history log
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model_name TEXT,
                features_json TEXT,
                prediction_label TEXT,
                prediction_prob REAL,
                key_factors_json TEXT,
                timestamp TEXT NOT NULL
            )
        """)
        
        conn.commit()

# Dataset helpers
def save_dataset_meta(dataset_id: str, name: str, filename: str, filepath: str,
                      row_count: int, user_count: int, session_count: int,
                      is_demo: bool = False, is_active: bool = True, summary: dict = None):
    with get_connection() as conn:
        cursor = conn.cursor()
        if is_active:
            cursor.execute("UPDATE datasets SET is_active = 0")
            
        cursor.execute("""
            INSERT OR REPLACE INTO datasets 
            (id, name, filename, filepath, row_count, user_count, session_count, is_active, is_demo, uploaded_at, summary_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dataset_id, name, filename, filepath, row_count, user_count, session_count,
            1 if is_active else 0, 1 if is_demo else 0,
            datetime.utcnow().isoformat(),
            json.dumps(summary or {})
        ))
        conn.commit()

def get_active_dataset():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM datasets WHERE is_active = 1 LIMIT 1")
        row = cursor.fetchone()
        if not row:
            cursor.execute("SELECT * FROM datasets ORDER BY uploaded_at DESC LIMIT 1")
            row = cursor.fetchone()
        if row:
            data = dict(row)
            if data.get("summary_json"):
                data["summary"] = json.loads(data["summary_json"])
            return data
        return None

def list_datasets() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM datasets ORDER BY uploaded_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if d.get("summary_json"):
                d["summary"] = json.loads(d["summary_json"])
            result.append(d)
        return result

def set_active_dataset(dataset_id: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE datasets SET is_active = 0")
        cursor.execute("UPDATE datasets SET is_active = 1 WHERE id = ?", (dataset_id,))
        conn.commit()

# Model helpers
def save_model_meta(model_id: str, name: str, dataset_id: str, model_type: str,
                    accuracy: float, precision: float, recall: float, f1: float, roc_auc: float,
                    metrics: dict, features: list, filepath: str, is_active: bool = True):
    with get_connection() as conn:
        cursor = conn.cursor()
        if is_active:
            cursor.execute("UPDATE models SET is_active = 0 WHERE model_type = ?", (model_type,))
            
        cursor.execute("""
            INSERT OR REPLACE INTO models
            (id, name, dataset_id, model_type, accuracy, precision, recall, f1_score, roc_auc, is_active, trained_at, metrics_json, features_json, filepath)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            model_id, name, dataset_id, model_type, accuracy, precision, recall, f1, roc_auc,
            1 if is_active else 0, datetime.utcnow().isoformat(),
            json.dumps(metrics or {}), json.dumps(features or []), filepath
        ))
        conn.commit()

def get_latest_models() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM models ORDER BY trained_at DESC")
        rows = cursor.fetchall()
        models = []
        for r in rows:
            d = dict(r)
            if d.get("metrics_json"):
                d["metrics"] = json.loads(d["metrics_json"])
            if d.get("features_json"):
                d["features"] = json.loads(d["features_json"])
            models.append(d)
        return models

def log_prediction(model_name: str, features: dict, label: str, prob: float, factors: list):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions_log (model_name, features_json, prediction_label, prediction_prob, key_factors_json, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            model_name, json.dumps(features), label, prob, json.dumps(factors), datetime.utcnow().isoformat()
        ))
        conn.commit()
