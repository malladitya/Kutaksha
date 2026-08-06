from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api.auth_routes import router as auth_router
from app.api.patient_routes import router as patient_router
from app.api.camera_routes import router as camera_router
from app.api.dashboard_routes import router as dashboard_router
from app.middleware.rate_limit import RateLimitMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kutaksha Backend", version="0.1.0", description="AI-powered preventive elder wellness platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patient_router, prefix="/patients", tags=["patients"])
app.include_router(camera_router, prefix="/camera", tags=["camera"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "kutaksha-backend"}
