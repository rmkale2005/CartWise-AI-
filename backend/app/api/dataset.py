"""
Dataset Management API Routes
"""
import uuid
import shutil
from pathlib import Path
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.config import DATASETS_DIR
from app.database import (
    save_dataset_meta,
    get_active_dataset,
    list_datasets,
    set_active_dataset as db_set_active
)
from app.services.demo_data_generator import generate_demo_dataset
from app.services.data_processor import (
    validate_dataset,
    load_and_preprocess_dataset,
    get_active_dataframe
)
from app.services.sessionizer import (
    sessionize_events,
    extract_session_features
)
from app.services.ml_engine import train_and_evaluate_models

async def handle_load_demo(request: Request):
    """Generates and activates the synthetic REES46 demonstration dataset."""
    try:
        demo_id = "dataset_demo_rees46"
        demo_path = DATASETS_DIR / "rees46_demo_sample.csv"
        
        # Always ensure demo exists
        if not demo_path.exists():
            generate_demo_dataset(num_sessions=1200, output_filename="rees46_demo_sample.csv")
            
        # Validate
        valid, msg, info = validate_dataset(str(demo_path))
        if not valid:
            return JSONResponse({"error": msg}, status_code=400)
            
        # Preprocess
        df, summary = load_and_preprocess_dataset(str(demo_path), dataset_id=demo_id)
        
        # Sessionize
        sess_events = sessionize_events(df)
        sessions_df = extract_session_features(sess_events)
        
        # Save metadata
        save_dataset_meta(
            dataset_id=demo_id,
            name="REES46 E-commerce Demo Dataset (Synthetic)",
            filename="rees46_demo_sample.csv",
            filepath=str(demo_path),
            row_count=summary["clean_rows"],
            user_count=summary["unique_users"],
            session_count=len(sessions_df),
            is_demo=True,
            is_active=True,
            summary=summary
        )
        
        # Train baseline ML models on initial load so predictions work out of the box
        try:
            train_and_evaluate_models(sessions_df)
        except Exception as mle:
            print(f"Initial model training notice: {mle}")
            
        return JSONResponse({
            "status": "success",
            "message": "Demo dataset loaded, sessionized, and baseline models trained successfully.",
            "dataset": {
                "id": demo_id,
                "name": "REES46 E-commerce Demo Dataset (Synthetic)",
                "rows": summary["clean_rows"],
                "users": summary["unique_users"],
                "sessions": len(sessions_df),
                "is_demo": True
            }
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def handle_upload_csv(request: Request):
    """Handles multipart CSV file upload and validation."""
    try:
        form = await request.form()
        uploaded_file = form.get("file")
        if not uploaded_file:
            return JSONResponse({"error": "No file uploaded"}, status_code=400)
            
        filename = uploaded_file.filename
        if not filename.endswith(".csv"):
            return JSONResponse({"error": "Only CSV files are supported."}, status_code=400)
            
        dataset_id = f"ds_{uuid.uuid4().hex[:8]}"
        dest_path = DATASETS_DIR / f"{dataset_id}_{filename}"
        
        # Save file to disk
        contents = await uploaded_file.read()
        with open(dest_path, "wb") as f:
            f.write(contents)
            
        # Validate
        valid, msg, info = validate_dataset(str(dest_path))
        if not valid:
            dest_path.unlink(missing_ok=True)
            return JSONResponse({"error": msg}, status_code=400)
            
        # Preprocess
        df, summary = load_and_preprocess_dataset(str(dest_path), dataset_id=dataset_id)
        
        # Sessionize
        sess_events = sessionize_events(df)
        sessions_df = extract_session_features(sess_events)
        
        # Save metadata
        save_dataset_meta(
            dataset_id=dataset_id,
            name=filename,
            filename=filename,
            filepath=str(dest_path),
            row_count=summary["clean_rows"],
            user_count=summary["unique_users"],
            session_count=len(sessions_df),
            is_demo=False,
            is_active=True,
            summary=summary
        )
        
        # Train ML models
        try:
            train_and_evaluate_models(sessions_df)
        except Exception as mle:
            print(f"Model training notice on upload: {mle}")
            
        return JSONResponse({
            "status": "success",
            "message": f"Dataset '{filename}' successfully uploaded and preprocessed.",
            "dataset": {
                "id": dataset_id,
                "name": filename,
                "rows": summary["clean_rows"],
                "users": summary["unique_users"],
                "sessions": len(sessions_df),
                "is_demo": False,
                "summary": summary
            }
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

async def handle_list_datasets(request: Request):
    """Lists all available datasets."""
    datasets = list_datasets()
    return JSONResponse({"datasets": datasets})

async def handle_get_active_dataset(request: Request):
    """Returns currently active dataset details."""
    active = get_active_dataset()
    if not active:
        return JSONResponse({"active": None, "message": "No active dataset loaded."})
    return JSONResponse({"active": active})

async def handle_set_active_dataset(request: Request):
    """Sets a specified dataset as active and loads into memory."""
    try:
        body = await request.json()
        dataset_id = body.get("dataset_id")
        if not dataset_id:
            return JSONResponse({"error": "dataset_id required"}, status_code=400)
            
        datasets = list_datasets()
        target = next((d for d in datasets if d["id"] == dataset_id), None)
        if not target:
            return JSONResponse({"error": "Dataset not found"}, status_code=404)
            
        db_set_active(dataset_id)
        
        # Load into memory
        df, summary = load_and_preprocess_dataset(target["filepath"], dataset_id=dataset_id)
        sess_events = sessionize_events(df)
        sessions_df = extract_session_features(sess_events)
        
        # Re-train models
        try:
            train_and_evaluate_models(sessions_df)
        except Exception:
            pass
            
        return JSONResponse({"status": "success", "active_dataset": target})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
