import sys
from pathlib import Path
import numpy as np

# Add project root to sys.path to resolve imports
project_root = str(Path(__file__).resolve().parents[3])
if project_root not in sys.path:
    sys.path.append(project_root)

from foresight.backend.app.risk_engine.logic import (
    calculate_risk_metrics,
    analyze_risk,
    GAS_HIGH_THRESHOLD,
    GAS_TOXIC_THRESHOLD,
    TEMP_HIGH_THRESHOLD,
    PRESS_HIGH_THRESHOLD,
    VENT_LOW_THRESHOLD
)

def test_analyze_risk_interface_safe():
    # Test safe record analysis with analyze_risk
    record = {
        "zone": "Zone A",
        "temperature": 45.0,
        "gas_level": 12.0,
        "pressure": 50.0,
        "ventilation": 77.0,
        "maintenance_activity": False,
        "hot_work_permit": False,
        "confined_space_entry": False
    }
    
    res = analyze_risk(record)
    assert res["zone"] == "Zone A"
    assert res["incident_type"] == "Safe"
    assert res["risk_score"] == round(0.25 * 45.0 + 0.25 * 12.0 + 0.25 * 50.0 + 0.25 * (100.0 - 77.0), 2)
    assert res["confidence_score"] == 50
    assert "4+ Hours" in res["time_to_escalation"] or "Hours" in res["time_to_escalation"]
    assert len(res["risk_factors"]) == 0
    assert "No immediate mitigation required. Continue routine monitoring." in res["recommended_actions"]


def test_environmental_risk_score():
    # Test equal weights: 0.25 * (gas + temp + press + (100 - vent))
    # ERS = 0.25 * (40 + 50 + 60 + (100 - 70)) = 0.25 * (40 + 50 + 60 + 30) = 0.25 * 180 = 45.0
    res = calculate_risk_metrics(
        gas_level=40.0,
        temperature=50.0,
        pressure=60.0,
        ventilation=70.0,
        hot_work=False,
        maintenance=False,
        confined_space_entry=False
    )
    assert res["environmental_risk_score"] == 45.0
    assert res["risk_score"] == 45.0  # Since it's Safe and raw_score = 45.0 <= 65.0


def test_operational_activity_modifiers():
    # Test OAM addition: each permit adds +5
    # ERS = 0.25 * (10 + 10 + 10 + (100 - 90)) = 10.0
    # OAM = 5 (hot_work) + 5 (maintenance) + 5 (confined) = 15.0
    # Raw Score = 10.0 + 15.0 = 25.0
    res = calculate_risk_metrics(
        gas_level=10.0,
        temperature=10.0,
        pressure=10.0,
        ventilation=90.0,
        hot_work=True,
        maintenance=True,
        confined_space_entry=True
    )
    assert res["environmental_risk_score"] == 10.0
    assert res["risk_score"] == 25.0


def test_explosion_classification_and_capping():
    # Condition: temp >= 80, pressure >= 80, maintenance == True
    # BSR = 0.25 * (20 + 85 + 85 + (100 - 80)) = 0.25 * (20 + 85 + 85 + 20) = 0.25 * 210 = 52.5
    # OAM = 5 (maintenance) = 5
    # HP = 45
    # Raw Score = 52.5 + 5 + 45 = 102.5
    # Max cap = 100.0, Separation range = [85, 100] -> risk_score should be 100.0
    res = calculate_risk_metrics(
        gas_level=20.0,
        temperature=85.0,
        pressure=85.0,
        ventilation=80.0,
        hot_work=False,
        maintenance=True,
        confined_space_entry=False
    )
    assert res["incident_type"] == "Explosion"
    assert res["risk_score"] == 100.0
    assert "High Temperature" in res["risk_factors"]
    assert "High Pressure" in res["risk_factors"]
    assert "Maintenance Activity" in res["risk_factors"]

    # Test lower bound of Explosion capping
    # BSR = 0.25 * (0 + 80 + 80 + (100 - 100)) = 40.0
    # OAM = 5 (maintenance) = 5
    # HP = 45
    # Raw = 40 + 5 + 45 = 90.0 -> is in [85, 100], so should remain 90.0
    res_low = calculate_risk_metrics(
        gas_level=0.0,
        temperature=80.0,
        pressure=80.0,
        ventilation=100.0,
        hot_work=False,
        maintenance=True,
        confined_space_entry=False
    )
    assert res_low["incident_type"] == "Explosion"
    assert res_low["risk_score"] == 90.0


def test_gas_ignition_classification_and_capping():
    # Condition: Gas >= 70, Hot Work == True
    # BSR = 0.25 * (75 + 30 + 30 + (100 - 80)) = 38.75
    # OAM = 5 (hot_work) = 5
    # HP = 35
    # Raw = 38.75 + 5 + 35 = 78.75 (within [75, 95])
    res = calculate_risk_metrics(
        gas_level=75.0,
        temperature=30.0,
        pressure=30.0,
        ventilation=80.0,
        hot_work=True,
        maintenance=False,
        confined_space_entry=False
    )
    assert res["incident_type"] == "Gas Ignition"
    assert res["risk_score"] == 78.75

    # Check capping to max 95
    # BSR = 0.25 * (90 + 70 + 70 + (100 - 10)) = 80.0
    # OAM = 5
    # HP = 35
    # Raw = 80 + 5 + 35 = 120.0 -> Capped to 95.0
    res_high = calculate_risk_metrics(
        gas_level=90.0,
        temperature=70.0,
        pressure=70.0,
        ventilation=10.0,
        hot_work=True,
        maintenance=False,
        confined_space_entry=False
    )
    assert res_high["incident_type"] == "Gas Ignition"
    assert res_high["risk_score"] == 95.0


def test_toxic_exposure_classification_and_capping():
    # Condition: Gas >= 65, Vent <= 30, Confined Space == True
    # BSR = 0.25 * (66 + 40 + 40 + (100 - 20)) = 56.5
    # OAM = 5 (confined) = 5
    # HP = 30
    # Raw = 56.5 + 5 + 30 = 91.5 -> Capped to 90.0 (separation capping [70, 90])
    res = calculate_risk_metrics(
        gas_level=66.0,
        temperature=40.0,
        pressure=40.0,
        ventilation=20.0,
        hot_work=False,
        maintenance=False,
        confined_space_entry=True
    )
    assert res["incident_type"] == "Toxic Exposure"
    assert res["risk_score"] == 90.0


def test_confidence_score_calculation():
    # Case 1: Safe, zero factors -> 50%
    res1 = calculate_risk_metrics(
        gas_level=20.0, temperature=20.0, pressure=20.0, ventilation=80.0,
        hot_work=False, maintenance=False, confined_space_entry=False
    )
    assert res1["confidence_score"] == 50

    # Case 2: 2 factors, Safe -> 50 + 10 = 60%
    # Factors: Hot Work Permit, Maintenance Activity
    res2 = calculate_risk_metrics(
        gas_level=20.0, temperature=20.0, pressure=20.0, ventilation=80.0,
        hot_work=True, maintenance=True, confined_space_entry=False
    )
    assert res2["confidence_score"] == 60

    # Case 3: Gas Ignition (compound rule triggered (+15)), High Gas, Hot Work, Poor Ventilation (3 factors (+15))
    # Risk score exceeds 85 (+10).
    # Confidence: 50 + 15 (factors >= 3) + 15 (compound rule) + 10 (risk > 85) = 90%
    rng = np.random.default_rng(42)
    res3 = calculate_risk_metrics(
        gas_level=75.0, temperature=40.0, pressure=40.0, ventilation=20.0,
        hot_work=True, maintenance=False, confined_space_entry=False,
        rng=rng
    )
    assert res3["confidence_score"] == 90


def test_recommended_actions():
    # Explosion Actions
    res_exp = calculate_risk_metrics(
        gas_level=10.0, temperature=90.0, pressure=90.0, ventilation=80.0,
        hot_work=False, maintenance=True, confined_space_entry=False
    )
    assert "Reduce pressure safely" in res_exp["recommended_actions"]
    assert "Suspend maintenance activity" in res_exp["recommended_actions"]
    
    # Safe Actions
    res_safe = calculate_risk_metrics(
        gas_level=10.0, temperature=40.0, pressure=40.0, ventilation=80.0,
        hot_work=False, maintenance=False, confined_space_entry=False
    )
    assert "No immediate mitigation required. Continue routine monitoring." in res_safe["recommended_actions"]


def test_time_to_escalation():
    rng = np.random.default_rng(42)
    
    # Risk Score <= 30
    res_low = calculate_risk_metrics(
        gas_level=10.0, temperature=10.0, pressure=10.0, ventilation=90.0,
        hot_work=False, maintenance=False, confined_space_entry=False,
        rng=rng
    )
    assert res_low["time_to_escalation"] == "4+ Hours"

    # Risk Score in 86 - 100
    res_high = calculate_risk_metrics(
        gas_level=90.0, temperature=90.0, pressure=90.0, ventilation=10.0,
        hot_work=True, maintenance=True, confined_space_entry=True,
        rng=rng
    )
    time_str = res_high["time_to_escalation"]
    assert "Minutes" in time_str
    mins = int(time_str.split()[0])
    assert 10 <= mins <= 30


def test_override_incident_type_and_risk_actions():
    res = calculate_risk_metrics(
        gas_level=10.0, temperature=10.0, pressure=10.0, ventilation=90.0,
        hot_work=False, maintenance=False, confined_space_entry=False,
        override_incident_type="Explosion"
    )
    assert res["incident_type"] == "Explosion"
    assert res["risk_score"] == 85.0

    # Test risk factors mapping to actions
    res_actions = calculate_risk_metrics(
        gas_level=10.0, temperature=95.0, pressure=10.0, ventilation=10.0,
        hot_work=False, maintenance=False, confined_space_entry=True
    )
    actions = res_actions["recommended_actions"]
    assert "Engage emergency cooling" in actions
    assert "Increase ventilation" in actions
    assert "Evacuate confined space" in actions
    assert "Retrieve entry crew using harness recovery systems" in actions
    assert "Deploy auxiliary ventilation blowers" in actions


def test_boundary_values():
    # Test boundary gas level just under high gas threshold
    res_under = calculate_risk_metrics(
        gas_level=69.9, temperature=40.0, pressure=40.0, ventilation=80.0,
        hot_work=True, maintenance=False, confined_space_entry=False
    )
    assert "High Gas" not in res_under["risk_factors"]
    assert res_under["incident_type"] == "Safe"

    # Test boundary gas level exactly at high gas threshold
    res_at = calculate_risk_metrics(
        gas_level=70.0, temperature=40.0, pressure=40.0, ventilation=80.0,
        hot_work=True, maintenance=False, confined_space_entry=False
    )
    assert "High Gas" in res_at["risk_factors"]
    assert res_at["incident_type"] == "Gas Ignition"


if __name__ == "__main__":
    print("Running risk engine unit tests directly...")
    tests = [
        test_analyze_risk_interface_safe,
        test_environmental_risk_score,
        test_operational_activity_modifiers,
        test_explosion_classification_and_capping,
        test_gas_ignition_classification_and_capping,
        test_toxic_exposure_classification_and_capping,
        test_confidence_score_calculation,
        test_recommended_actions,
        test_time_to_escalation,
        test_override_incident_type_and_risk_actions,
        test_boundary_values
    ]
    
    passed = 0
    failed = 0
    for test in tests:
        try:
            print(f"Running {test.__name__}...", end=" ")
            test()
            print("PASSED")
            passed += 1
        except Exception as e:
            print("FAILED")
            import traceback
            traceback.print_exc()
            failed += 1
            
    print(f"\nTest Summary: {passed} passed, {failed} failed.")
    if failed > 0:
        sys.exit(1)
