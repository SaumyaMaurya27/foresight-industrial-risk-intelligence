import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add the backend folder path to sys.path to enable loading app
backend_dir = str(Path(__file__).resolve().parents[2] / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

def test_read_root():
    """Verify that GET / returns the correct project name and status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "Foresight"
    assert data["status"] == "running"

def test_health_check():
    """Verify that GET /health returns the system status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_list_zones():
    """Verify that GET /zones lists the monitored zones."""
    response = client.get("/zones")
    assert response.status_code == 200
    zones = response.json()
    assert isinstance(zones, list)
    assert "Zone A" in zones
    assert "Zone B" in zones
    assert "Zone C" in zones

def test_analyze_telemetry_valid():
    """Verify that POST /analyze calculates and returns a valid risk report for valid input."""
    payload = {
        "zone": "Zone A",
        "temperature": 85.0,
        "gas_level": 74.0,
        "pressure": 80.0,
        "ventilation": 28.0,
        "maintenance_activity": True,
        "hot_work_permit": True,
        "confined_space_entry": False
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["zone"] == "Zone A"
    assert "incident_type" in data
    assert "risk_score" in data
    assert "confidence_score" in data
    assert "time_to_escalation" in data
    assert "risk_factors" in data
    assert "recommended_actions" in data

def test_analyze_telemetry_invalid_boundary():
    """Verify that validation fails (422) if a sensor value exceeds 100."""
    payload = {
        "zone": "Zone A",
        "temperature": 45.0,
        "gas_level": 150.0,  # Invalid: must be <= 100
        "pressure": 50.0,
        "ventilation": 80.0,
        "maintenance_activity": False,
        "hot_work_permit": False,
        "confined_space_entry": False
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422

def test_analyze_telemetry_negative_value():
    """Verify that validation fails (422) if a sensor value is negative."""
    payload = {
        "zone": "Zone A",
        "temperature": -12.0,  # Invalid: must be >= 0
        "gas_level": 10.0,
        "pressure": 50.0,
        "ventilation": 80.0,
        "maintenance_activity": False,
        "hot_work_permit": False,
        "confined_space_entry": False
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 422

def test_get_dashboard():
    """Verify that GET /dashboard generates the aggregated safety dashboard correctly."""
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk" in data
    assert "overall_score" in data
    assert "average_risk" in data
    assert "critical_zone" in data
    assert "high_risk_zones" in data
    assert "zone_count" in data
    assert "last_updated" in data
    assert "summary" in data
    assert "zones" in data
    assert len(data["zones"]) == 3
    # Check that metrics are correct types and ranges
    assert data["overall_risk"] in ["Low", "Medium", "High", "Critical"]
    assert 0.0 <= data["overall_score"] <= 100.0
    assert 0.0 <= data["average_risk"] <= 100.0
    assert 0 <= data["high_risk_zones"] <= 3
    assert data["zone_count"] == 3
    assert "Z" in data["last_updated"]
    assert data["summary"] == f"{data['critical_zone']} currently has the highest operational risk."

if __name__ == "__main__":
    print("Running API endpoint tests directly...")
    tests = [
        test_read_root,
        test_health_check,
        test_list_zones,
        test_analyze_telemetry_valid,
        test_analyze_telemetry_invalid_boundary,
        test_analyze_telemetry_negative_value,
        test_get_dashboard
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
        import sys
        sys.exit(1)
