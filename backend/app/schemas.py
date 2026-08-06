from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: str = "patient"
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    role: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class PatientCreate(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_status: bool = True


class PatientOut(BaseModel):
    id: int
    owner_id: int
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_status: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BehaviourFeaturePayload(BaseModel):
    walking_speed: float
    activity_level: float
    sitting_duration: float
    standing_duration: float
    posture_stability: float
    balance_score: float
    tremor_index: float
    gait_rhythm: float
    movement_variability: float
    step_consistency: float


class CameraAnalysisRequest(BaseModel):
    frame_source: str = "webcam"
    activity_hint: Optional[str] = None


class CameraAnalysisResponse(BaseModel):
    human_detected: bool
    activity: str
    confidence: float
    skeleton_landmarks: List[Dict[str, Any]]
    track_id: Optional[str] = None
    features: BehaviourFeaturePayload
    context_summary: str
    risk_signal: Dict[str, Any]


class DashboardSummary(BaseModel):
    patient_count: int
    alert_count: int
    latest_risk: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]
