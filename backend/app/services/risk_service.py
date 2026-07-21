from typing import List, Dict, Any, Optional
from datetime import datetime
from app.risk_engine.logic import analyze_risk

class RiskService:
    """Service layer coordinating telemetry analysis and dashboard safety metrics aggregation."""

    def analyze_telemetry(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates safety assessments for a single telemetry record.
        Delegates computation to the Compound Risk Intelligence Engine.
        """
        return analyze_risk(record)

    def get_zones(self) -> List[str]:
        """Returns list of supported refinery monitoring zones."""
        return ["Zone A", "Zone B", "Zone C"]

    def get_dashboard(self) -> Dict[str, Any]:
        """
        Generates aggregate dashboard metrics by executing risk analysis over
        realistic mock sensor records representing various zone threat situations.
        """
        # Mock records for each refinery zone representing distinct states:
        mock_records = [
            # Zone A: Fuel Storage Area with elevated gas and active hot work permit -> Gas Ignition hazard (High Risk)
            {
                "zone": "Zone A",
                "temperature": 45.0,
                "gas_level": 75.0,
                "pressure": 40.0,
                "ventilation": 80.0,
                "maintenance_activity": False,
                "hot_work_permit": True,
                "confined_space_entry": False
            },
            # Zone B: Fractionation Columns with temperature and pressure spikes plus active maintenance -> Explosion hazard (Critical)
            {
                "zone": "Zone B",
                "temperature": 85.0,
                "gas_level": 12.0,
                "pressure": 90.0,
                "ventilation": 85.0,
                "maintenance_activity": True,
                "hot_work_permit": False,
                "confined_space_entry": False
            },
            # Zone C: Hydrocracking Area operating normally -> Safe
            {
                "zone": "Zone C",
                "temperature": 40.0,
                "gas_level": 8.0,
                "pressure": 50.0,
                "ventilation": 90.0,
                "maintenance_activity": False,
                "hot_work_permit": False,
                "confined_space_entry": False
            }
        ]

        zones_analyses = []
        highest_risk_score = 0.0
        critical_zone: Optional[str] = None

        for rec in mock_records:
            analysis = self.analyze_telemetry(rec)

            # Add raw telemetry into the analysis object
            analysis.update({
                "temperature": rec["temperature"],
                "pressure": rec["pressure"],
                "gas_level": rec["gas_level"],
                "ventilation": rec["ventilation"],
                "maintenance_activity": rec["maintenance_activity"],
                "hot_work_permit": rec["hot_work_permit"],
                "confined_space_entry": rec["confined_space_entry"]
            })

            zones_analyses.append(analysis)

            score = analysis.get("risk_score", 0.0)
            if score > highest_risk_score:
                highest_risk_score = score
                critical_zone = rec["zone"]

        # Classify the global refinery safety level based on the highest zone risk
        if highest_risk_score >= 85.0:
            overall_risk = "Critical"
        elif highest_risk_score >= 70.0:
            overall_risk = "High"
        elif highest_risk_score >= 40.0:
            overall_risk = "Medium"
        else:
            overall_risk = "Low"

        scores = [z["risk_score"] for z in zones_analyses]
        average_risk = round(sum(scores) / len(scores), 2) if scores else 0.0
        overall_score = max(scores) if scores else 0.0
        high_risk_zones = len([s for s in scores if s >= 70.0])

        return {
            "overall_risk": overall_risk,
            "overall_score": overall_score,
            "average_risk": average_risk,
            "critical_zone": critical_zone,
            "high_risk_zones": high_risk_zones,
            "zone_count": len(zones_analyses),
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "summary": f"{critical_zone} currently has the highest operational risk." if critical_zone else "All zones operating normally.",
            "zones": zones_analyses
        }
