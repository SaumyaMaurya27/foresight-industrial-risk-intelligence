import json
from typing import List, Dict, Any, Optional
import numpy as np

# Threshold constants from risk-engine-design.md
GAS_HIGH_THRESHOLD = 70.0
GAS_TOXIC_THRESHOLD = 65.0
TEMP_HIGH_THRESHOLD = 80.0
PRESS_HIGH_THRESHOLD = 80.0
VENT_LOW_THRESHOLD = 30.0

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
    """
    # 1. Environmental Risk Score (ERS) / Baseline Sensor Risk (BSR)
    ers = (0.25 * gas_level) + (0.25 * temperature) + (0.25 * pressure) + (0.25 * (100.0 - ventilation))
    ers = round(float(ers), 2)

    # 2. Operational Activity Modifiers (OAM)
    oam = 0.0
    if hot_work:
        oam += 5.0
    if maintenance:
        oam += 5.0
    if confined_space_entry:
        oam += 5.0

    # 3. Incident Type Classification & Hazard Premium (HP)
    if override_incident_type is not None:
        incident_type = override_incident_type
        if incident_type == "Explosion":
            hp = 45.0
        elif incident_type == "Gas Ignition":
            hp = 35.0
        elif incident_type == "Toxic Exposure":
            hp = 30.0
        else:
            incident_type = "Safe"
            hp = 0.0
    else:
        # Flowchart rules:
        # 3a. Explosion: Pressure >= 80 AND Temperature >= 80 AND Maintenance == True
        is_explosion = (pressure >= PRESS_HIGH_THRESHOLD and 
                        temperature >= TEMP_HIGH_THRESHOLD and 
                        bool(maintenance))
        
        # 3b. Gas Ignition: Gas >= 70 AND Hot Work == True (if not Explosion)
        is_gas_ignition = False
        if not is_explosion:
            is_gas_ignition = (gas_level >= GAS_HIGH_THRESHOLD and bool(hot_work))

        # 3c. Toxic Exposure: Gas >= 65 AND Ventilation <= 30 AND Confined Space Entry == True
        is_toxic_exposure = False
        if not is_explosion and not is_gas_ignition:
            is_toxic_exposure = (gas_level >= GAS_TOXIC_THRESHOLD and 
                                  ventilation <= VENT_LOW_THRESHOLD and 
                                  bool(confined_space_entry))

        if is_explosion:
            incident_type = "Explosion"
            hp = 45.0
        elif is_gas_ignition:
            incident_type = "Gas Ignition"
            hp = 35.0
        elif is_toxic_exposure:
            incident_type = "Toxic Exposure"
            hp = 30.0
        else:
            incident_type = "Safe"
            hp = 0.0

    # 4. Normalization and Capping
    raw_score = ers + oam + hp
    
    # Separation Capping:
    # - Explosion: final score in [85, 100]
    # - Gas Ignition: final score in [75, 95]
    # - Toxic Exposure: final score in [70, 90]
    # - Safe: capped at 65
    if incident_type == "Explosion":
        risk_score = max(85.0, min(raw_score, 100.0))
    elif incident_type == "Gas Ignition":
        risk_score = max(75.0, min(raw_score, 95.0))
    elif incident_type == "Toxic Exposure":
        risk_score = max(70.0, min(raw_score, 90.0))
    else:  # Safe
        risk_score = min(raw_score, 65.0)
    
    risk_score = round(float(risk_score), 2)

    # 5. Risk Factors Identification
    risk_factors: List[str] = []
    
    # Gas condition: check if either >= 70, or >= 65 during toxic exposure
    if gas_level >= GAS_HIGH_THRESHOLD or (gas_level >= GAS_TOXIC_THRESHOLD and incident_type == "Toxic Exposure"):
        risk_factors.append("High Gas Levels")
    if temperature >= TEMP_HIGH_THRESHOLD:
        risk_factors.append("High Temperature")
    if pressure >= PRESS_HIGH_THRESHOLD:
        risk_factors.append("High Pressure")
    if ventilation <= VENT_LOW_THRESHOLD:
        risk_factors.append("Reduced Ventilation")
    if hot_work:
        risk_factors.append("Active Hot Work Permit")
    if maintenance:
        risk_factors.append("Active Maintenance Activity")
    if confined_space_entry:
        risk_factors.append("Confined Space Entry Active")

    # 6. Confidence Score Calculation
    # Every scenario starts with 50%
    base_confidence = 50
    factor_bonus = 0
    num_factors = len(risk_factors)
    if num_factors == 2:
        factor_bonus = 10
    elif num_factors >= 3:
        factor_bonus = 15
        
    compound_rule_bonus = 15 if incident_type != "Safe" else 0
    high_risk_bonus = 10 if risk_score > 85.0 else 0
    
    confidence_score = min(base_confidence + factor_bonus + compound_rule_bonus + high_risk_bonus, 100)

    # 7. Time-To-Escalation Estimation
    time_to_escalation = _estimate_escalation_time(risk_score, rng)

    # 8. Actionable Mitigation Rules (Recommended Actions)
    # Generate recommended actions based on active risk factors rather than incident type alone.
    recommended_actions: List[str] = []
    
    def add_action(action: str):
        if action not in recommended_actions:
            recommended_actions.append(action)

    if "High Pressure" in risk_factors:
        add_action("Emergency relief valve activation")
    if "Active Maintenance Activity" in risk_factors:
        add_action("Immediate suspension of active maintenance permits in Zone")
    if "High Temperature" in risk_factors:
        add_action("Emergency cooling line engagement")
    if "Active Hot Work Permit" in risk_factors:
        add_action("Automated trip of active hot work power lines")
    if "High Gas Levels" in risk_factors:
        add_action("Evacuation of non-essential personnel from Zone")
    if "Reduced Ventilation" in risk_factors:
        add_action("Increase ventilation systems to maximum output (100%)")
    if "Confined Space Entry Active" in risk_factors:
        add_action("Trigger alarm lights outside confined space entryway")
        if "High Gas Levels" in risk_factors or "Reduced Ventilation" in risk_factors:
            add_action("Retrieve entry crew using harness recovery systems")
            add_action("Deploy auxiliary ventilation blowers")

    if not recommended_actions:
        add_action("No immediate mitigation required. Continue routine monitoring.")

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

def _estimate_escalation_time(risk_score: float, rng: Optional[Any]) -> str:
    """Helper to generate escalation time based on risk score."""
    if risk_score <= 30.0:
        return "4+ Hours"

    # Handle random duration generator deterministically or fallback
    def get_random_int(low: int, high_exclusive: int) -> int:
        if rng is None:
            return int(np.random.randint(low, high_exclusive))
        elif hasattr(rng, 'integers'):
            return int(rng.integers(low, high_exclusive))
        else:
            return int(rng.randint(low, high_exclusive))

    if 31.0 <= risk_score <= 50.0:
        mins = get_random_int(120, 241)
        hours = mins // 60
        rem_mins = mins % 60
        return f"{hours} Hours" if rem_mins == 0 else f"{hours} Hours {rem_mins} Minutes"
    elif 51.0 <= risk_score <= 70.0:
        mins = get_random_int(60, 121)
        hours = mins // 60
        rem_mins = mins % 60
        if hours == 2:
            return "2 Hours"
        return "1 Hour" if rem_mins == 0 else f"1 Hour {rem_mins} Minutes"
    elif 71.0 <= risk_score <= 85.0:
        mins = get_random_int(30, 61)
        return f"{mins} Minutes"
    else:  # 86.0 - 100.0
        mins = get_random_int(10, 31)
        return f"{mins} Minutes"
