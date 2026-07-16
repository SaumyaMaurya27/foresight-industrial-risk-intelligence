# Foresight REST API Specification

This document details the REST API specifications for the Foresight backend platform. The backend is built using FastAPI and exposes endpoints for streaming telemetry ingestion, retrieving real-time zone status lists, fetching event history, and interacting with the Gemini-powered AI Safety Analyst.

---

## Endpoint Summary Table

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/telemetry/submit` | Ingest sensor data, evaluate risk, save to DB, and return alerts. | No (MVP) |
| **GET** | `/api/v1/zones/status` | Retrieve the current status, risk scores, and active permits of all zones. | No (MVP) |
| **GET** | `/api/v1/events/timeline` | Fetch a list of recent safety warnings, hazards, and incident predictions. | No (MVP) |
| **POST** | `/api/v1/analyst/chat` | Send a safety query to the Gemini AI Safety Analyst with zone context. | No (MVP) |

---

## API Endpoints Detail

### 1. Ingest Telemetry Stream
Submits new sensor telemetry and operational permit statuses for evaluation. The backend runs the Compound Risk Engine and the ML predictor before writing to the database.

*   **Endpoint:** `/api/v1/telemetry/submit`
*   **Method:** `POST`
*   **Request Headers:** `Content-Type: application/json`
*   **Request Schema:**
    ```json
    {
      "zone_name": "Zone A",
      "gas_level": 72.4,
      "temperature": 45.1,
      "pressure": 32.8,
      "ventilation": 85.0,
      "hot_work": true,
      "maintenance": false,
      "confined_space_entry": false
    }
    ```
*   **Response Schema (201 Created):**
    ```json
    {
      "status": "success",
      "record_id": 10423,
      "evaluated_risk_score": 82.5,
      "incident_prediction": "Gas Ignition",
      "confidence": 0.91,
      "alert_triggered": true,
      "mitigation_steps": [
        "Automated trip of active hot work power lines.",
        "Evacuation of non-essential personnel from Zone.",
        "Increase ventilation systems to maximum output (100%)."
      ]
    }
    ```

---

### 2. Get Zones Status
Returns the latest telemetry metrics, calculated risk scores, and status flags for all refinery zones (Zone A, B, C).

*   **Endpoint:** `/api/v1/zones/status`
*   **Method:** `GET`
*   **Response Schema (200 OK):**
    ```json
    [
      {
        "zone_name": "Zone A",
        "current_status": "Warning",
        "risk_score": 72.4,
        "latest_sensor_reading": {
          "gas_level": 71.0,
          "temperature": 41.5,
          "pressure": 30.2,
          "ventilation": 78.0
        },
        "active_activities": {
          "hot_work": true,
          "maintenance": false,
          "confined_space_entry": false
        }
      },
      {
        "zone_name": "Zone B",
        "current_status": "Safe",
        "risk_score": 38.5,
        "latest_sensor_reading": {
          "gas_level": 12.1,
          "temperature": 55.4,
          "pressure": 62.1,
          "ventilation": 90.0
        },
        "active_activities": {
          "hot_work": false,
          "maintenance": true,
          "confined_space_entry": false
        }
      },
      {
        "zone_name": "Zone C",
        "current_status": "Critical",
        "risk_score": 88.9,
        "latest_sensor_reading": {
          "gas_level": 25.4,
          "temperature": 82.1,
          "pressure": 84.5,
          "ventilation": 65.0
        },
        "active_activities": {
          "hot_work": false,
          "maintenance": true,
          "confined_space_entry": false
        }
      }
    ]
    ```

---

### 3. Get Event Timeline
Fetches a list of safety alarms and incidents logged by the system, sorted chronologically.

*   **Endpoint:** `/api/v1/events/timeline`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `limit` (integer, default: 20): Number of logs to retrieve.
    *   `zone` (string, optional): Filter events by specific zone.
*   **Response Schema (200 OK):**
    ```json
    [
      {
        "event_id": 923,
        "timestamp": "2026-07-16T10:15:30Z",
        "zone_name": "Zone C",
        "event_type": "Explosion Predicted",
        "severity": "Critical",
        "risk_score": 88.9,
        "description": "Explosion compound risk condition detected: Pressure (84.5) and Temp (82.1) exceed critical limits while maintenance is active.",
        "acknowledged": false
      },
      {
        "event_id": 921,
        "timestamp": "2026-07-16T10:10:12Z",
        "zone_name": "Zone A",
        "event_type": "Gas Ignition Predicted",
        "severity": "Warning",
        "risk_score": 72.4,
        "description": "Gas levels spiked to 71.0% with active hot work permit in progress.",
        "acknowledged": true
      }
    ]
    ```

---

### 4. AI Safety Analyst Chat
Queries the Gemini safety model. The API automatically gathers relevant SQLite telemetry variables, inserts them into an engineering instruction template, and returns a markdown response.

*   **Endpoint:** `/api/v1/analyst/chat`
*   **Method:** `POST`
*   **Request Schema:**
    ```json
    {
      "zone_name": "Zone C",
      "user_query": "Why is this zone marked as Critical, and what should we do immediately?"
    }
    ```
*   **Response Schema (200 OK):**
    ```json
    {
      "response": "### Zone C Safety Advisory\n\n**Risk Analysis:** Zone C is marked as **Critical** (Risk Score: 89) due to a dangerous pressure-thermal combination. Current sensor readings show pressure at **84.5%** and temperature at **82.1°C** while an active maintenance permit is in progress.\n\n**Immediate Directives:**\n1. Vent lines immediately to reduce internal pressure.\n2. Revoke and suspend all active maintenance tasks within Zone C.\n3. Verify automated cooling pump systems are active and operating at maximum load."
    }
    ```

---

## Error Handling Specifications

The API returns standard RFC 7807 problem details for bad inputs or operational exceptions.

### 400 Bad Request
*   **Cause:** Input parameters exceed limits (e.g. `gas_level = 150` or non-existent zones).
*   **Payload:**
    ```json
    {
      "detail": "Validation error: gas_level must be between 0.0 and 100.0."
    }
    ```

### 503 Service Unavailable
*   **Cause:** Gemini API call timeout or failure to connect to the SQLite DB.
*   **Payload:**
    ```json
    {
      "detail": "AI Analyst Service is temporarily offline. Please verify API key configuration."
    }
    ```
