# Kutaksha Backend

A modular FastAPI backend for an AI-powered preventive elder wellness platform.

## Features
- JWT authentication with role-based access
- Patient and caregiver workflows
- Camera analysis and behaviour intelligence simulation
- Risk scoring with explainable summaries
- PDF report generation and notifications

## Run locally
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test the backend
```bash
cd backend
python -m pytest -q
```

## Notes
This prototype uses simulated AI outputs and SQLite by default for local demos while keeping the architecture production-ready for future integration with real models and PostgreSQL.

## Judge presentation notes
- The backend exposes a health endpoint at `/health`
- API docs are available at `/docs` and `/redoc`
- The backend can be started with `python -m uvicorn app.main:app --reload`
- The Dockerfile builds a self-contained service on port `8000`
