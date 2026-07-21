import json
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

# --- Threshold Constants ---
GAS_HIGH_THRESHOLD: float = 70.0        # % LEL
GAS_TOXIC_THRESHOLD: float = 65.0       # % LEL (for toxic exposure in confined space)
TEMP_HIGH_THRESHOLD: float = 80.0       # °C
PRESS_HIGH_THRESHOLD: float = 80.0      # % Max
VENT_LOW_THRESHOLD: float = 30.0        # % Capacity

# --- Hazard Premiums (HP) ---
HP_EXPLOSION: float = 45.0
HP_GAS_IGNITION: float = 35.0
HP_TOXIC_EXPOSURE: float = 30.0
HP_SAFE: float = 0.0

# --- Separation Capping Ranges ---
RANGE_EXPLOSION_MIN: float = 85.0
RANGE_EXPLOSION_MAX: float = 100.0
RANGE_GAS_IGNITION_MIN: float = 75.0
RANGE_GAS_IGNITION_MAX: float = 95.0
RANGE_TOXIC_EXPOSURE_MIN: float = 70.0
RANGE_TOXIC_EXPOSURE_MAX: float = 90.0
RANGE_SAFE_MAX: float = 65.0

# --- Operational Activity Modifiers (OAM) ---
OAM_HOT_WORK: float = 5.0
OAM_MAINTENANCE: float = 5.0
OAM_CONFINED_SPACE: float = 5.0


@dataclass(frozen=True)
class TelemetryRecord:
    """Dataclass holding the physical sensor readings and operational activity flags."""
    zone: str
    temperature: float
    gas_level: float
    pressure: float
    ventilation: float
    maintenance_activity: bool
    hot_work_permit: bool
    confined_space_entry: bool


@dataclass(frozen=True)
class SafetyAssessment:
    """Dataclass representing the final computed risk assessment profile."""
    zone: str
    incident_type: str
    risk_score: float
    confidence_score: int
    time_to_escalation: str
    risk_factors: List[str]
    recommended_actions: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def calculate_environmental_risk(gas_level: float, temperature: float, pressure: float, ventilation: float) -> float:
    """
    Computes the Environmental Risk Score (ERS) based on physical sensor values.
    Normalizes into a 0-100 score where:
    ERS = (0.25 * gas_level) + (0.25 * temperature) + (0.25 * pressure) + (0.25 * (100 - ventilation))
    """
    # Ventilation is safer when high, so we invert it: (100 - ventilation)
    inverted_vent = max(0.0, min(100.0 - ventilation, 100.0))
    
    # Clamp values to their bounds [0, 100] to ensure logic protection
    gas = max(0.0, min(gas_level, 100.0))
    temp = max(0.0, min(temperature, 100.0))
    press = max(0.0, min(pressure, 100.0))
    
    ers = (0.25 * gas) + (0.25 * temp) + (0.25 * press) + (0.25 * inverted_vent)
    return round(float(ers), 2)


def classify_incident(
    gas_level: float,
    temperature: float,
    pressure: float,
    ventilation: float,
    hot_work_permit: bool,
    maintenance_activity: bool,
    confined_space_entry: bool
) -> str:
    """
    Predicts the incident type using deterministic safety rules in a priority cascade:
    1. Explosion: pressure >= 80 AND temperature >= 80 AND maintenance_activity == True
    2. Gas Ignition: gas_level >= 70 AND hot_work_permit == True (if not Explosion)
    3. Toxic Exposure: gas_level >= 65 AND ventilation <= 30 AND confined_space_entry == True (if not Explosion or Gas Ignition)
    4. Safe: Otherwise
    """
    # 1. Explosion Rule
    if (pressure >= PRESS_HIGH_THRESHOLD and 
        temperature >= TEMP_HIGH_THRESHOLD and 
        maintenance_activity):
        return "Explosion"
        
    # 2. Gas Ignition Rule
    if gas_level >= GAS_HIGH_THRESHOLD and hot_work_permit:
        return "Gas Ignition"
        
    # 3. Toxic Exposure Rule
    if (gas_level >= GAS_TOXIC_THRESHOLD and 
        ventilation <= VENT_LOW_THRESHOLD and 
        confined_space_entry):
        return "Toxic Exposure"
        
    return "Safe"


def calculate_compound_risk(
    ers: float,
    incident_type: str,
    hot_work_permit: bool,
    maintenance_activity: bool,
    confined_space_entry: bool
) -> float:
    """
    Computes and normalizes the final Compound Risk Score (0-100) by combining:
    Environmental Risk (ERS) + Operational Activity Modifiers (OAM) + Hazard Premium (HP).
    Applies separation capping based on the incident type.
    """
    # Calculate Operational Activity Modifiers (OAM)
    oam = 0.0
    if hot_work_permit:
        oam += OAM_HOT_WORK
    if maintenance_activity:
        oam += OAM_MAINTENANCE
    if confined_space_entry:
        oam += OAM_CONFINED_SPACE

    # Determine Hazard Premium (HP) based on incident type
    if incident_type == "Explosion":
        hp = HP_EXPLOSION
    elif incident_type == "Gas Ignition":
        hp = HP_GAS_IGNITION
    elif incident_type == "Toxic Exposure":
        hp = HP_TOXIC_EXPOSURE
    else:
        hp = HP_SAFE

    raw_score = ers + oam + hp

    # Apply Separation Capping
    if incident_type == "Explosion":
        risk_score = max(RANGE_EXPLOSION_MIN, min(raw_score, RANGE_EXPLOSION_MAX))
    elif incident_type == "Gas Ignition":
        risk_score = max(RANGE_GAS_IGNITION_MIN, min(raw_score, RANGE_GAS_IGNITION_MAX))
    elif incident_type == "Toxic Exposure":
        risk_score = max(RANGE_TOXIC_EXPOSURE_MIN, min(raw_score, RANGE_TOXIC_EXPOSURE_MAX))
    else:
        risk_score = min(raw_score, RANGE_SAFE_MAX)

    return round(float(risk_score), 2)


def identify_risk_factors(
    gas_level: float,
    temperature: float,
    pressure: float,
    ventilation: float,
    hot_work_permit: bool,
    maintenance_activity: bool,
    confined_space_entry: bool,
    incident_type: str
) -> List[str]:
    """
    Identifies active risk factors. Returns standard user-facing tags:
    - High Gas (if gas >= 70 or gas >= 65 during toxic exposure)
    - High Temperature (if temp >= 80)
    - High Pressure (if pressure >= 80)
    - Poor Ventilation (if vent <= 30)
    - Hot Work Permit (if active)
    - Maintenance Activity (if active)
    - Confined Space Entry (if active)
    """
    factors: List[str] = []

    is_high_gas = gas_level >= GAS_HIGH_THRESHOLD or (
        gas_level >= GAS_TOXIC_THRESHOLD and incident_type == "Toxic Exposure"
    )
    if is_high_gas:
        factors.append("High Gas")
        
    if temperature >= TEMP_HIGH_THRESHOLD:
        factors.append("High Temperature")
        
    if pressure >= PRESS_HIGH_THRESHOLD:
        factors.append("High Pressure")
        
    if ventilation <= VENT_LOW_THRESHOLD:
        factors.append("Poor Ventilation")
        
    if hot_work_permit:
        factors.append("Hot Work Permit")
        
    if maintenance_activity:
        factors.append("Maintenance Activity")
        
    if confined_space_entry:
        factors.append("Confined Space Entry")

    return factors


def calculate_confidence(risk_factors: List[str], incident_type: str, risk_score: float) -> int:
    """
    Computes the confidence score (reliability of the prediction):
    - Starts at 50%
    - +10 if exactly two major risk factors are present
    - +15 if three or more risk factors are present
    - +15 if a compound incident rule is directly triggered (i.e. incident is not Safe)
    - +10 if risk score > 85
    - Maximum cap: 100%
    """
    confidence = 50
    num_factors = len(risk_factors)

    if num_factors == 2:
        confidence += 10
    elif num_factors >= 3:
        confidence += 15

    if incident_type != "Safe":
        confidence += 15

    if risk_score > 85.0:
        confidence += 10

    return min(confidence, 100)


def estimate_escalation_time(risk_score: float, rng: Optional[Any] = None) -> str:
    """
    Predicts time-to-escalation based on risk score:
    - Risk <= 30: 4+ hours
    - Risk 31-50: 2-4 hours
    - Risk 51-70: 1-2 hours
    - Risk 71-85: 30-60 mins
    - Risk 86-100: 10-30 mins
    
    If rng is provided, generates a pseudo-random value within that window to match
    historical datasets and simulation properties.
    If rng is None, generates a deterministic value based on the risk score location
    within its range to avoid global random state mutations in production.
    """
    if risk_score <= 30.0:
        return "4+ Hours"

    def get_val(low: int, high_exclusive: int) -> int:
        if rng is None:
            span = high_exclusive - low
            if 31.0 <= risk_score <= 50.0:
                fraction = (risk_score - 31.0) / 19.0
            elif 51.0 <= risk_score <= 70.0:
                fraction = (risk_score - 51.0) / 19.0
            elif 71.0 <= risk_score <= 85.0:
                fraction = (risk_score - 71.0) / 14.0
            else:
                fraction = (risk_score - 86.0) / 14.0
            offset = int((1.0 - fraction) * (span - 1))
            return low + offset
        
        if hasattr(rng, 'integers'):
            return int(rng.integers(low, high_exclusive))
        elif hasattr(rng, 'randint'):
            return int(rng.randint(low, high_exclusive))
        else:
            import numpy as np
            return int(np.random.randint(low, high_exclusive))

    if 31.0 <= risk_score <= 50.0:
        mins = get_val(120, 241)
        hours = mins // 60
        rem_mins = mins % 60
        return f"{hours} Hours" if rem_mins == 0 else f"{hours} Hours {rem_mins} Minutes"
        
    elif 51.0 <= risk_score <= 70.0:
        mins = get_val(60, 121)
        hours = mins // 60
        rem_mins = mins % 60
        if hours == 2:
            return "2 Hours"
        return "1 Hour" if rem_mins == 0 else f"1 Hour {rem_mins} Minutes"
        
    elif 71.0 <= risk_score <= 85.0:
        mins = get_val(30, 61)
        return f"{mins} Minutes"
        
    else:  # 86.0 - 100.0
        mins = get_val(10, 31)
        return f"{mins} Minutes"


def generate_recommendations(risk_factors: List[str]) -> List[str]:
    """
    Dynamically creates recommended mitigation actions based on active risk factors.
    Do NOT hardcode recommendations by incident type alone.
    """
    actions: List[str] = []

    if "High Pressure" in risk_factors:
        actions.append("Reduce pressure safely")
    if "Maintenance Activity" in risk_factors:
        actions.append("Suspend maintenance activity")
    if "High Temperature" in risk_factors:
        actions.append("Engage emergency cooling")
    if "Hot Work Permit" in risk_factors:
        actions.append("Suspend hot work")
    if "High Gas" in risk_factors:
        actions.append("Isolate gas source")
    if "Poor Ventilation" in risk_factors:
        actions.append("Increase ventilation")
    if "Confined Space Entry" in risk_factors:
        actions.append("Evacuate confined space")
        if "High Gas" in risk_factors or "Poor Ventilation" in risk_factors:
            actions.append("Retrieve entry crew using harness recovery systems")
            actions.append("Deploy auxiliary ventilation blowers")

    if not actions:
        actions.append("No immediate mitigation required. Continue routine monitoring.")

    return actions


def analyze_risk(record: dict) -> dict:
    """
    Exposes a clean API for checking telemetry records.
    
    Input:
    {
        "zone": "...",
        "temperature": ...,
        "gas_level": ...,
        "pressure": ...,
        "ventilation": ...,
        "maintenance_activity": true/false,
        "hot_work_permit": true/false,
        "confined_space_entry": true/false
    }
    
    Returns:
    {
        "zone": "...",
        "incident_type": "...",
        "risk_score": ...,
        "confidence_score": ...,
        "time_to_escalation": "...",
        "risk_factors": [...],
        "recommended_actions": [...]
    }
    """
    zone = record.get("zone", "Zone A")
    temperature = float(record.get("temperature", 0.0))
    gas_level = float(record.get("gas_level", 0.0))
    pressure = float(record.get("pressure", 0.0))
    ventilation = float(record.get("ventilation", 100.0))
    
    maintenance_activity = bool(
        record.get("maintenance_activity") 
        if "maintenance_activity" in record 
        else record.get("maintenance", False)
    )
    
    hot_work_permit = bool(
        record.get("hot_work_permit")
        if "hot_work_permit" in record
        else record.get("hot_work", False)
    )
    
    confined_space_entry = bool(
        record.get("confined_space_entry")
        if "confined_space_entry" in record
        else record.get("confined_space", False)
    )

    telemetry = TelemetryRecord(
        zone=zone,
        temperature=temperature,
        gas_level=gas_level,
        pressure=pressure,
        ventilation=ventilation,
        maintenance_activity=maintenance_activity,
        hot_work_permit=hot_work_permit,
        confined_space_entry=confined_space_entry
    )

    ers = calculate_environmental_risk(
        gas_level=telemetry.gas_level,
        temperature=telemetry.temperature,
        pressure=telemetry.pressure,
        ventilation=telemetry.ventilation
    )

    incident_type = classify_incident(
        gas_level=telemetry.gas_level,
        temperature=telemetry.temperature,
        pressure=telemetry.pressure,
        ventilation=telemetry.ventilation,
        hot_work_permit=telemetry.hot_work_permit,
        maintenance_activity=telemetry.maintenance_activity,
        confined_space_entry=telemetry.confined_space_entry
    )

    risk_score = calculate_compound_risk(
        ers=ers,
        incident_type=incident_type,
        hot_work_permit=telemetry.hot_work_permit,
        maintenance_activity=telemetry.maintenance_activity,
        confined_space_entry=telemetry.confined_space_entry
    )

    risk_factors = identify_risk_factors(
        gas_level=telemetry.gas_level,
        temperature=telemetry.temperature,
        pressure=telemetry.pressure,
        ventilation=telemetry.ventilation,
        hot_work_permit=telemetry.hot_work_permit,
        maintenance_activity=telemetry.maintenance_activity,
        confined_space_entry=telemetry.confined_space_entry,
        incident_type=incident_type
    )

    confidence_score = calculate_confidence(
        risk_factors=risk_factors,
        incident_type=incident_type,
        risk_score=risk_score
    )

    time_to_escalation = estimate_escalation_time(
        risk_score=risk_score,
        rng=None
    )

    recommended_actions = generate_recommendations(
        risk_factors=risk_factors
    )

    assessment = SafetyAssessment(
        zone=telemetry.zone,
        incident_type=incident_type,
        risk_score=risk_score,
        confidence_score=confidence_score,
        time_to_escalation=time_to_escalation,
        risk_factors=risk_factors,
        recommended_actions=recommended_actions
    )

    return assessment.to_dict()


def calculate_risk_metrics(
    gas_level: float,
    temperature: float,
    pressure: float,
    ventilation: float,
    hot_work: bool,
    maintenance: bool,
    confined_space_entry: bool,
    zone_name: str = "Zone A",
    rng: Optional[Any] = None,
    override_incident_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes safety assessments by joining continuous physical metrics (sensors)
    with discrete operational states (permits and activities) based on risk-engine-design.md.
    Supports override_incident_type for probabilistic triggering.
    Exposed for backward compatibility with dataset/generator.py.
    """
    ers = calculate_environmental_risk(
        gas_level=gas_level,
        temperature=temperature,
        pressure=pressure,
        ventilation=ventilation
    )

    if override_incident_type is not None:
        incident_type = override_incident_type
    else:
        incident_type = classify_incident(
            gas_level=gas_level,
            temperature=temperature,
            pressure=pressure,
            ventilation=ventilation,
            hot_work_permit=hot_work,
            maintenance_activity=maintenance,
            confined_space_entry=confined_space_entry
        )

    risk_score = calculate_compound_risk(
        ers=ers,
        incident_type=incident_type,
        hot_work_permit=hot_work,
        maintenance_activity=maintenance,
        confined_space_entry=confined_space_entry
    )

    risk_factors = identify_risk_factors(
        gas_level=gas_level,
        temperature=temperature,
        pressure=pressure,
        ventilation=ventilation,
        hot_work_permit=hot_work,
        maintenance_activity=maintenance,
        confined_space_entry=confined_space_entry,
        incident_type=incident_type
    )

    confidence_score = calculate_confidence(
        risk_factors=risk_factors,
        incident_type=incident_type,
        risk_score=risk_score
    )

    time_to_escalation = estimate_escalation_time(
        risk_score=risk_score,
        rng=rng
    )

    recommended_actions = generate_recommendations(risk_factors)

    return {
        "zone": zone_name,
        "gas_level": round(float(gas_level), 2),
        "temperature": round(float(temperature), 2),
        "pressure": round(float(pressure), 2),
        "ventilation": round(float(ventilation), 2),
        "hot_work": 1 if hot_work else 0,
        "maintenance": 1 if maintenance else 0,
        "confined_space_entry": 1 if confined_space_entry else 0,
        "environmental_risk_score": ers,
        "incident_type": incident_type,
        "risk_score": risk_score,
        "confidence_score": int(confidence_score),
        "time_to_escalation": time_to_escalation,
        "risk_factors": risk_factors,
        "recommended_actions": recommended_actions
    }
