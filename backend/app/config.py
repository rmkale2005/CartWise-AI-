"""
Configuration module for CartWise AI
"""
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATASETS_DIR = DATA_DIR / "datasets"
MODELS_DIR = DATA_DIR / "models"
DB_PATH = DATA_DIR / "cartwise.db"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATASETS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Web Mining & Sessionization Defaults
DEFAULT_INACTIVITY_TIMEOUT_SECONDS = 1800  # 30 minutes in seconds

# Dataset Specifications (REES46 Format standard columns)
EXPECTED_COLUMNS = [
    "event_time",
    "event_type",
    "product_id",
    "category_id",
    "category_code",
    "brand",
    "price",
    "user_id",
    "user_session"
]

# Supported Event Types
EVENT_TYPES = ["view", "cart", "purchase"]
