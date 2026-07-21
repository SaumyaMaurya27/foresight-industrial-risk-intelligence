import os
import json
import logging
import warnings
from typing import Dict, Any
from dotenv import load_dotenv

# Suppress SDK deprecation warning for clean logs
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

import google.generativeai as genai


# Ensure environment variables are loaded from .env
load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
FALLBACK_MODEL_NAMES = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

# Single instance initialization of the Gemini model
_model_instance = None
_configured_model_name = None

def _get_model():
    """
    Initializes and caches the Gemini GenerativeModel instance once.
    """
    global _model_instance, _configured_model_name
    api_key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY

    if not api_key or api_key == "your_api_key_here":
        logger.warning("GEMINI_API_KEY is not set or using placeholder value.")
        return None

    if _model_instance is None:
        try:
            genai.configure(api_key=api_key)
            _configured_model_name = PRIMARY_MODEL_NAME
            _model_instance = genai.GenerativeModel(PRIMARY_MODEL_NAME)
            logger.info(f"Gemini API model {_configured_model_name} initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model {_configured_model_name}: {str(e)}")
            _model_instance = None

    return _model_instance


class GeminiService:
    """
    Production-ready service interfacing with Google Gemini API to produce
    structured industrial safety reports for oil & gas refinery operations.
    """

    def __init__(self):
        self.model = _get_model()

    def generate_fallback_report(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a structured safety report fallback when Gemini API key is unconfigured
        or API calls fail, ensuring system reliability.
        """
        zone = data.get("zone", "Refinery Zone")
        incident_type = data.get("incident_type", "Operational Anomaly")
        risk_score = float(data.get("risk_score", 0.0))
        risk_factors = data.get("risk_factors", [])
        recommended_actions = data.get("recommended_actions", [])

        if risk_score >= 85.0:
            priority = "CRITICAL"
        elif risk_score >= 70.0:
            priority = "HIGH"
        elif risk_score >= 40.0:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        factors_str = ", ".join(risk_factors) if risk_factors else "Standard operating conditions"
        actions = recommended_actions if recommended_actions else ["Continue routine surveillance"]

        return {
            "executive_summary": (
                f"Automated Safety Evaluation for {zone}: Elevated compound risk score of {risk_score}/100 "
                f"detected associated with potential {incident_type} hazard. Active indicators: {factors_str}."
            ),
            "risk_level": "Critical",
            "estimated_response_time": "Within 15 minutes",
            "root_causes": [
                f"Simultaneous detection of physical sensor anomalies and active permits ({factors_str}).",
                f"Environmental parameters operating near or exceeding safe threshold limits in {zone}.",
                "Cumulative operational stress compounding process safety margins."
            ],
            "possible_consequences": [
                f"Thermal or pressure escalation leading to severe {incident_type.lower()} event.",
                "Unplanned process unit shutdown and localized equipment damage.",
                "Potential worker safety compromise within immediate processing sector."
            ],
            "immediate_actions": actions,
            "long_term_prevention": [
                "Recalibrate zone sensor telemetry matrix and inspect relief valve triggers.",
                "Review permit-to-work cross-authorization protocols for concurrent high-risk activities.",
                "Enhance automated ventilation override responsiveness during multi-variable parameter spikes."
            ],
            "priority": priority
        }

    def explain_risk(self, risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts a complete risk analysis object and generates a structured
        industrial safety report in valid JSON using Gemini API.

        Expected input parameters:
          - zone: str
          - incident_type: str
          - risk_score: float
          - confidence / confidence_score: int
          - time_to_escalation: str
          - risk_factors: List[str]
          - recommended_actions: List[str]
        """
        # Raw telemetry
        temperature = risk_analysis.get("temperature")
        pressure = risk_analysis.get("pressure")
        gas_level = risk_analysis.get("gas_level")
        ventilation = risk_analysis.get("ventilation")
        maintenance_activity = risk_analysis.get("maintenance_activity")
        hot_work_permit = risk_analysis.get("hot_work_permit")
        confined_space_entry = risk_analysis.get("confined_space_entry")
        
        zone = risk_analysis.get("zone", "Unknown Zone")
        incident_type = risk_analysis.get("incident_type", "Unknown Incident")
        risk_score = risk_analysis.get("risk_score", 0.0)
        confidence = risk_analysis.get("confidence_score") or risk_analysis.get("confidence") or 75
        time_to_escalation = risk_analysis.get("time_to_escalation", "Immediate")
        risk_factors = risk_analysis.get("risk_factors", [])
        recommended_actions = risk_analysis.get("recommended_actions", [])

        # Ensure model is initialized if key became available
        model = _get_model()

        if model is None:
            logger.info("Using fallback structured safety report due to unconfigured Gemini API key.")
            return self.generate_fallback_report(risk_analysis)

        prompt = f"""
You are a Senior Industrial Safety Engineer with over 20 years of experience
working in Oil & Gas refineries.

Your responsibility is to evaluate refinery telemetry and produce concise,
professional operational safety reports for refinery operators.

Rules:
- Never exaggerate.
- Base conclusions only on the provided telemetry.
- Write in a professional engineering tone.
- Do not invent sensor values.
- Output only valid JSON.


INPUT TELEMETRY:
- Monitored Refinery Zone: {zone}
- Temperature: {temperature} °C
- Pressure: {pressure} %
- Gas Level: {gas_level} % LEL
- Ventilation: {ventilation} %
- Maintenance Activity: {maintenance_activity}
- Hot Work Permit: {hot_work_permit}
- Confined Space Entry: {confined_space_entry}

RISK ANALYSIS:
- Predicted Incident Hazard Type: {incident_type}
- Compound Risk Score: {risk_score} / 100
- Confidence Assessment Level: {confidence}%
- Estimated Time to Escalation: {time_to_escalation}
- Active Risk Factors: {json.dumps(risk_factors)}
- Recommended Actions: {json.dumps(recommended_actions)}

CRITICAL REQUIREMENT:
Generate valid JSON matching EXACTLY the following JSON schema. Do not include markdown code block syntax or extra text outside the JSON object.

JSON Schema:
{{
  "executive_summary": "Detailed professional executive summary explaining why the risk score and hazard level were reached...",
  "root_causes": ["Specific root cause 1", "Specific root cause 2", "Specific root cause 3"],
  "possible_consequences": ["Severe consequence 1", "Operational consequence 2", "Safety impact 3"],
  "immediate_actions": ["Immediate emergency/corrective action 1", "Action 2", "Action 3"],
  "long_term_prevention": ["Systemic prevention strategy 1", "Policy/engineering change 2", "Monitoring improvement 3"],
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}}
"""

        # Attempt call with primary model and fallbacks if necessary
        models_to_try = [model]
        api_key = os.getenv("GEMINI_API_KEY") or GEMINI_API_KEY
        for fallback_name in FALLBACK_MODEL_NAMES:
            if fallback_name != PRIMARY_MODEL_NAME:
                try:
                    models_to_try.append(genai.GenerativeModel(fallback_name))
                except Exception:
                    pass

        last_exception = None
        for m in models_to_try:
            try:
                # Configure structured JSON output mode
                generation_config = genai.types.GenerationConfig(
                    temperature=0.2,
                    response_mime_type="application/json"
                )
                response = m.generate_content(prompt, generation_config=generation_config)
                
                raw_text = response.text.strip()
                
                # Strip backtick code guards if present
                if raw_text.startswith("```"):
                    lines = raw_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].strip() == "```":
                        lines = lines[:-1]
                    raw_text = "\n".join(lines).strip()

                parsed_json = json.loads(raw_text)

                # Validate required keys
                required_keys = ["executive_summary", "root_causes", "possible_consequences", "immediate_actions", "long_term_prevention", "priority"]
                if all(k in parsed_json for k in required_keys):
                    return parsed_json
                else:
                    logger.warning("Gemini JSON response missing required fields, attempting fallback normalization.")
                    fallback = self.generate_fallback_report(risk_analysis)
                    fallback.update({k: parsed_json[k] for k in required_keys if k in parsed_json})
                    return fallback

            except Exception as e:
                logger.warning(f"Error generating safety report with model {getattr(m, 'model_name', m)}: {str(e)}")
                last_exception = e

        logger.error(f"All Gemini model invocation attempts failed: {str(last_exception)}. Returning structured fallback report.")
        return self.generate_fallback_report(risk_analysis)

# Global service instance for dependency injection
gemini_service = GeminiService()

def explain_risk(risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Helper entry point function for generating safety reports."""
    return gemini_service.explain_risk(risk_analysis)
