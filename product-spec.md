# Foresight Product Specification
## Product Goal
Foresight aims to build a predictive safety prototype capable of demonstrating real-time risk intelligence in a modern refinery dashboard environment.
The objective is not to build a full-scale physical plant control system, but to prove that combined, fragmented telemetry streams (e.g., sensor levels combined with operational permits) can reveal dangerous compound risks before they cause incidents.
---
## Target User Persona: Industrial Safety Officer
*   **Role:** Lead Safety and Environmental compliance operator at an oil and gas refinery.
*   **Core Responsibilities:**
    *   Monitor environmental conditions in critical processing zones.
    *   Verify and approve permit-to-work requests (hot work, maintenance).
    *   Mitigate plant safety warnings and prevent hazardous escalation.
    *   Conduct post-incident reviews to identify root causes.
*   **Key Pain Points:**
    *   Current alarms are isolated; they do not correlate sensors with activity permits (e.g., high gas alarm is separate from hot work logs).
    *   Faced with alert fatigue from noisy, un-prioritized sensor threshold alerts.
    *   Struggles to analyze root causes when multiple warning events happen at once.
---
## MVP Scope Matrix
### In Scope
*   **3 Processing Zones:** Zone A (Storage Tanks), Zone B (Fractionation Towers), Zone C (Hydrocracking Area).
*   **Synthetic Safety Scenarios:** A generator producing 10,000 realistic records for model training and real-time dashboard simulation.
*   **Compound Risk Engine:** Logic execution applying multi-factor safety conditions to sensor telemetry.
*   **Predictive ML Model:** A pre-trained classification model outputting hazard likelihoods.
*   **Industrial Monitoring Dashboard:** Web dashboard containing:
    *   *Plant Overview:* Color-coded status map showing risk levels for Zone A, Zone B, and Zone C.
    *   *Event Timeline:* Real-time streaming log of active alerts and incident triggers.
    *   *Incident Detail panel:* Context card explaining selected risk conditions.
*   **AI Safety Analyst:** Gemini-powered interactive assistant answering natural language questions about risk statuses.
### Out of Scope (Future Releases)
*   User Authentication and Role-Based Access Control (RBAC).
*   Integration with physical SCADA networks or real hardware IoT devices.
*   Computer vision safety camera feeds.
*   Worker tracking (GPS/BLE beacons).
*   Multi-agent emergency dispatch integrations.
*   SMS/Email notification systems.
*   Native Mobile application ports.
---
## Zone Classifications
The MVP monitors three refinery divisions with distinct baselines:
1.  **Zone A (Fuel Storage Tanks):** High baseline concentration of volatile gases. Focuses heavily on gas levels and ventilation quality.
2.  **Zone B (Fractionation Towers):** High baseline process temperatures and pressures. Focuses heavily on maintenance schedules and thermal indicators.
3.  **Zone C (Hydrocracking Unit):** High-pressure, high-temperature gas processing. The most hazardous zone, prone to explosive compound events.
---
## Supported Incident Types & Risk Logic
The platform evaluates safety scenarios across three specific incidents:
### 1. Gas Ignition
*   **Refinery Hazard:** Hydrocarbon vapors coming into contact with an active ignition source.
*   **Key Indicators:** High Gas Levels (`gas_level >= 70`) AND Active Hot Work Permit (`hot_work == True`).
*   **Risk Level:** Elevated Risk / Critical warning if ventilation drops.
### 2. Explosion
*   **Refinery Hazard:** Pressurized containment failure resulting in a thermal blast.
*   **Key Indicators:** High Pressure (`pressure >= 80`) AND High Temperature (`temperature >= 80`) AND Active Maintenance (`maintenance == True`).
*   **Risk Level:** Critical Danger (immediate shut-down indicator).
### 3. Toxic Exposure
*   **Refinery Hazard:** Exposure of workers to hazardous concentrations of hydrogen sulfide ($H_2S$) or other toxic gases in restricted areas.
*   **Key Indicators:** High Gas Levels (`gas_level >= 65`) AND Low Ventilation (`ventilation <= 30`) AND Confined Space Entry (`confined_space_entry == True`).
*   **Risk Level:** High Risk (evacuation order).
---
## UI Dashboard Requirements
### 1. Plant Overview Panel
*   Displays Zone A, Zone B, and Zone C as individual cards.
*   Color-code cards based on current status:
    *   `Safe` (Green, Risk Score: 0 - 65)
    *   `Warning` (Yellow, Risk Score: 66 - 75)
    *   `High Risk` (Orange, Risk Score: 76 - 85)
    *   `Critical` (Red, Risk Score: 86 - 100)
*   Displays active values for gas, pressure, temperature, ventilation, and active permits.
### 2. Event Timeline Component
*   Chronological stream showing changes in plant state.
*   Example timeline events:
    *   `09:00` - Zone A: Gas levels increasing (+15% in 5m)
    *   `09:05` - Zone A: Hot Work Permit Approved for Operator Smith
    *   `09:07` - **Warning:** Zone A: Elevated Gas Ignition Risk detected (Risk Score: 72)
    *   `09:12` - **Alarm:** Zone A: Gas Ignition Predicted (Confidence: 89%, Risk Score: 88)
### 3. Incident Investigation Detail
*   Provides granular detail upon clicking a timeline alert or zone.
*   Shows the exact contributing factors (e.g. "Gas level is at 74% and Hot Work is active").
*   Presents recommended actions, such as "Revoke Hot Work Permit", "Increase Ventilation to 80%", or "Initiate Evacuation".
---
## AI Safety Analyst Requirements
The safety operator can chat with an embedded assistant to ask questions like:
*   *Why is Zone C currently showing a High Risk level?*
*   *What caused the risk score in Zone A to spike at 10:15?*
*   *What mitigation actions are recommended for Zone B?*
### AI Response Guidelines:
*   **Conciseness:** Keep responses under three sentences for fast reading during high-stress operations.
*   **Accuracy:** Rely strictly on current database sensor values and active permits. Do not hallucinate historical values.
*   **Actionability:** Always conclude warnings with a direct engineering mitigation recommendation.
