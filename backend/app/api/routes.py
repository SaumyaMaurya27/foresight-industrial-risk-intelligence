from fastapi import APIRouter, Depends, status, HTTPException
from app.api.schemas import (
    TelemetryRequest,
    AnalysisResponse,
    DashboardResponse,
    ExplainRequest,
    ExplainResponse
)
from app.services.risk_service import RiskService
from app.services.gemini_service import GeminiService, gemini_service
from typing import List, Dict, Any

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def get_risk_service() -> RiskService:
    """Dependency injection helper supplying the RiskService instance."""
    return RiskService()

def get_gemini_service() -> GeminiService:
    """Dependency injection helper supplying the GeminiService instance."""
    return gemini_service

@router.get("/", response_model=Dict[str, str])
def read_root():
    """Returns project identification and current server operational status."""
    return {
        "project": "Foresight",
        "status": "running"
    }

@router.get("/health", response_model=Dict[str, str])
def health_check():
    """System health check endpoint for monitoring uptime and availability."""
    return {
        "status": "healthy"
    }

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_telemetry(
    request: TelemetryRequest,
    service: RiskService = Depends(get_risk_service)
):
    """
    Accepts refinery telemetry readings, validates them against constraints,
    runs the Compound Risk Engine, and returns safety assessment outputs.
    """
    # Use Pydantic model_dump to extract dictionary for the risk engine
    record_dict = request.model_dump()
    try:
        analysis = service.analyze_telemetry(record_dict)
        return analysis
    except Exception as e:
        logger.exception("Gemini explanation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI safety report: {str(e)}"
        )

@router.get("/zones", response_model=List[str])
def list_zones(service: RiskService = Depends(get_risk_service)):
    """Returns a list of processing zones under active telemetry surveillance."""
    return service.get_zones()

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(service: RiskService = Depends(get_risk_service)):
    """
    Aggregates safety states, identifying the overall threat classification and
    highest risk critical zone to render the live operations dashboard.
    """
    return service.get_dashboard()

@router.post("/explain", response_model=ExplainResponse, status_code=status.HTTP_200_OK)
def explain_risk_analysis(
    request: ExplainRequest,
    ai_service: GeminiService = Depends(get_gemini_service)
):
    """
    Accepts a complete risk analysis record and invokes Gemini AI to generate
    a structured industrial safety report (executive summary, root causes,
    possible consequences, immediate actions, long term prevention, priority).
    """
    try:
        data_dict = request.model_dump()
        data_dict["confidence"] = request.get_confidence()
        report = ai_service.explain_risk(data_dict)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini AI explanation generation failed: {str(e)}"
        )

