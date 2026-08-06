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
uvicorn app.main:app --reload
```

## Notes
This prototype uses simulated AI outputs and SQLite by default for local demos while keeping the architecture production-ready for future integration with real models and PostgreSQL.
