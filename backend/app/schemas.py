from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: str
    role: str
    full_name: Optional[str] = None

class PatientCreate(BaseModel):
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_status: bool = True


class PatientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    consent_status: bool
    created_at: datetime

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
    image: Optional[str] = None
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


class ExplainRequest(BaseModel):
    baseline: Dict[str, Any]
    current: Dict[str, Any]
    health_stability: float
    risk_score: float


class ExplainResponse(BaseModel):
    behaviour_summary: str
    reasons: List[str]
    recommendations: List[str]
    caregiver_explanation: str
    doctor_summary: str
    risk: Dict[str, Any]


class DigitalTwinResponse(BaseModel):
    baseline: Dict[str, Any]
    current: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    health_stability: float
    risk_score: float


class SimulateRequest(BaseModel):
    days: int = 7
    mode: str = "decline"


class DashboardSummary(BaseModel):
    patient_count: int
    alert_count: int
    latest_risk: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]
