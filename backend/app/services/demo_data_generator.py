"""
Synthetic Demonstration Dataset Generator for CartWise AI
Generates realistic REES46 e-commerce clickstream data.
Clearly labelled as a synthetic demonstration dataset.
"""
import uuid
import random
from datetime import datetime, timedelta
import pandas as pd
from app.config import DATASETS_DIR

CATALOG = [
    {"cat": "electronics.smartphone", "brand": "Apple", "price_range": (699.0, 1299.0)},
    {"cat": "electronics.smartphone", "brand": "Samsung", "price_range": (399.0, 1199.0)},
    {"cat": "electronics.smartphone", "brand": "Xiaomi", "price_range": (199.0, 499.0)},
    {"cat": "computers.notebook", "brand": "Apple", "price_range": (999.0, 2499.0)},
    {"cat": "computers.notebook", "brand": "Dell", "price_range": (550.0, 1450.0)},
    {"cat": "computers.notebook", "brand": "Lenovo", "price_range": (450.0, 1200.0)},
    {"cat": "electronics.audio", "brand": "Sony", "price_range": (99.0, 399.0)},
    {"cat": "appliances.kitchen", "brand": "Philips", "price_range": (49.0, 299.0)},
    {"cat": "appliances.kitchen", "brand": "Dyson", "price_range": (399.0, 799.0)},
    {"cat": "apparel.shoes", "brand": "Nike", "price_range": (65.0, 180.0)},
    {"cat": "apparel.shoes", "brand": "Adidas", "price_range": (60.0, 160.0)},
    {"cat": "apparel.clothing", "brand": "Zara", "price_range": (29.0, 120.0)},
    {"cat": "beauty.cosmetics", "brand": "L'Oreal", "price_range": (15.0, 65.0)},
    {"cat": "sports.fitness", "brand": "Fitbit", "price_range": (89.0, 249.0)},
]

def generate_demo_dataset(num_sessions: int = 1200, output_filename: str = "rees46_demo_sample.csv") -> str:
    random.seed(42)
    output_path = DATASETS_DIR / output_filename
    
    # Pre-generate 150 unique products
    products = []
    for i in range(1, 151):
        item = random.choice(CATALOG)
        price = round(random.uniform(*item["price_range"]), 2)
        products.append({
            "product_id": 1000000 + i,
            "category_id": 2053013550000 + (hash(item["cat"]) % 10000),
            "category_code": item["cat"],
            "brand": item["brand"],
            "price": price
        })

    # Users
    users = [500000000 + u for u in range(1, 350)]
    
    start_date = datetime(2026, 10, 1, 8, 0, 0)
    events = []

    for s_idx in range(num_sessions):
        user_id = random.choice(users)
        session_id = str(uuid.uuid4())
        
        # Session start timestamp spread over 30 days
        session_start = start_date + timedelta(
            days=random.randint(0, 29),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        current_time = session_start

        # Session Intent Archetype:
        # 1. Pure Browser (40%): Only views, no cart
        # 2. Cart Abandoner (40%): Views, adds to cart, but abandons (does not purchase)
        # 3. Successful Converter (20%): Views, adds to cart, purchases
        archetype_roll = random.random()
        
        if archetype_roll < 0.40:
            # Browser only
            num_views = random.randint(1, 7)
            for _ in range(num_views):
                prod = random.choice(products)
                events.append({
                    "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event_type": "view",
                    "product_id": prod["product_id"],
                    "category_id": prod["category_id"],
                    "category_code": prod["category_code"],
                    "brand": prod["brand"],
                    "price": prod["price"],
                    "user_id": user_id,
                    "user_session": session_id
                })
                current_time += timedelta(seconds=random.randint(15, 180))

        elif archetype_roll < 0.80:
            # Cart Abandoner
            num_previews = random.randint(1, 6)
            for _ in range(num_previews):
                prod = random.choice(products)
                events.append({
                    "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event_type": "view",
                    "product_id": prod["product_id"],
                    "category_id": prod["category_id"],
                    "category_code": prod["category_code"],
                    "brand": prod["brand"],
                    "price": prod["price"],
                    "user_id": user_id,
                    "user_session": session_id
                })
                current_time += timedelta(seconds=random.randint(20, 220))
            
            # Cart additions (1 to 3 items)
            cart_items = random.sample(products, k=random.randint(1, min(3, len(products))))
            for prod in cart_items:
                # View item before cart
                events.append({
                    "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event_type": "view",
                    "product_id": prod["product_id"],
                    "category_id": prod["category_id"],
                    "category_code": prod["category_code"],
                    "brand": prod["brand"],
                    "price": prod["price"],
                    "user_id": user_id,
                    "user_session": session_id
                })
                current_time += timedelta(seconds=random.randint(10, 45))
                # Add to cart
                events.append({
                    "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event_type": "cart",
                    "product_id": prod["product_id"],
                    "category_id": prod["category_id"],
                    "category_code": prod["category_code"],
                    "brand": prod["brand"],
                    "price": prod["price"],
                    "user_id": user_id,
                    "user_session": session_id
                })
                current_time += timedelta(seconds=random.randint(15, 90))
            
            # Additional hesitant browsing after cart
            if random.random() < 0.6:
                for _ in range(random.randint(1, 4)):
                    prod = random.choice(products)
                    events.append({
                        "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                        "event_type": "view",
                        "product_id": prod["product_id"],
                        "category_id": prod["category_id"],
                        "category_code": prod["category_code"],
                        "brand": prod["brand"],
                        "price": prod["price"],
                        "user_id": user_id,
                        "user_session": session_id
                    })
                    current_time += timedelta(seconds=random.randint(30, 240))
            # No purchase event -> ABANDONED

        else:
            # Successful Buyer (Purchaser)
            num_previews = random.randint(1, 4)
            for _ in range(num_previews):
                prod = random.choice(products)
                events.append({
                    "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "event_type": "view",
                    "product_id": prod["product_id"],
                    "category_id": prod["category_id"],
                    "category_code": prod["category_code"],
                    "brand": prod["brand"],
                    "price": prod["price"],
                    "user_id": user_id,
                    "user_session": session_id
                })
                current_time += timedelta(seconds=random.randint(15, 90))

            target_prod = random.choice(products)
            # View
            events.append({
                "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "event_type": "view",
                "product_id": target_prod["product_id"],
                "category_id": target_prod["category_id"],
                "category_code": target_prod["category_code"],
                "brand": target_prod["brand"],
                "price": target_prod["price"],
                "user_id": user_id,
                "user_session": session_id
            })
            current_time += timedelta(seconds=random.randint(15, 60))
            # Cart
            events.append({
                "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "event_type": "cart",
                "product_id": target_prod["product_id"],
                "category_id": target_prod["category_id"],
                "category_code": target_prod["category_code"],
                "brand": target_prod["brand"],
                "price": target_prod["price"],
                "user_id": user_id,
                "user_session": session_id
            })
            current_time += timedelta(seconds=random.randint(20, 120))
            # Purchase
            events.append({
                "event_time": current_time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "event_type": "purchase",
                "product_id": target_prod["product_id"],
                "category_id": target_prod["category_id"],
                "category_code": target_prod["category_code"],
                "brand": target_prod["brand"],
                "price": target_prod["price"],
                "user_id": user_id,
                "user_session": session_id
            })

    df = pd.DataFrame(events)
    # Sort chronologically
    df["dt"] = pd.to_datetime(df["event_time"].str.replace(" UTC", ""))
    df = df.sort_values("dt").drop(columns=["dt"]).reset_index(drop=True)
    df.to_csv(output_path, index=False)
    return str(output_path)
