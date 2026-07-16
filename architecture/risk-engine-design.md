# Compound Risk Engine Design
## Engine Architecture
The Compound Risk Engine computes safety assessments by joining continuous physical metrics (sensors) with discrete operational states (permits and activities). It operates deterministically to assign a `risk_score` (0-100) and evaluate active threats, which can then be validated by downstream ML predictors and contextualized by the AI Safety Analyst.
```
+-------------------------------------------------------------+
|                     Sensor Telemetry Input                  |
|          [Gas Level, Temperature, Pressure, Ventilation]     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Baseline Sensor Risk (BSR)               |
|      0.25 * Gas + 0.25 * Temp + 0.25 * Press + 0.25 * (100-Vent) |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                  Active Work Activity Modifiers             |
|       Hot Work (+5) | Maintenance (+5) | Confined Space (+5) |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Compound Incident Rules                  |
|    - Gas Ignition (High Gas + Hot Work)                     |
|    - Explosion (High Temp + High Press + Maintenance)       |
|    - Toxic Exposure (High Gas + Low Vent + Confined Space)  |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Final Risk Score Synthesis               |
|       Combines BSR, modifiers, and incident hazard premiums |
+-------------------------------------------------------------+
```
---
## Sensor Telemetry & Activity Thresholds
The engine references specific constants to evaluate safety states:
| Metric | Code Variable | Data Type | Range | Critical Threshold |
| :--- | :--- | :--- | :--- | :--- |
| **Gas Level** | `gas_level` | Float | 0 - 100 | `>= 70.0` (High Gas) |
| **Temperature** | `temperature` | Float | 0 - 100 | `>= 80.0` (High Temp) |
| **Pressure** | `pressure` | Float | 0 - 100 | `>= 80.0` (High Press) |
| **Ventilation** | `ventilation` | Float | 0 - 100 | `<= 30.0` (Low Vent) |
| **Hot Work Permit** | `hot_work` | Boolean | True / False | `True` (Ignition Risk) |
| **Maintenance** | `maintenance` | Boolean | True / False | `True` (Pressure Release Risk) |
| **Confined Space** | `confined_space` | Boolean | True / False | `True` (Entrapment Risk) |
---
## Risk Score Calculation Formula
The overall risk score is calculated in four stages to ensure the score reflects physical sensor drift, operational tasks, and direct safety violations.

## Confidence Score Calculation

The Confidence Score represents the engine's certainty in its incident prediction.

Unlike the Risk Score, which measures severity, the Confidence Score measures prediction reliability.

### Base Confidence

Every scenario starts with:

50%

### Confidence Modifiers

+10 if two risk factors are present

+15 if three or more risk factors are present

+15 if a compound incident rule is directly triggered

+10 if risk score exceeds 85

### Formula

confidence_score = min(
50
+ factor_bonus
+ compound_rule_bonus
+ high_risk_bonus,
100
)

### Example

Risk Factors:

- High Gas
- Hot Work Active
- Low Ventilation

Risk Score:

92

Confidence Score:

100%

### Output

{
  "risk_score": 92,
  "confidence_score": 100
}

## Time-To-Escalation Estimation

The Time-To-Escalation estimate predicts how quickly a hazardous condition may develop into a critical incident if no corrective action is taken.

This provides operators with actionable foresight rather than simple alerting.

### Escalation Mapping

| Risk Score | Estimated Escalation Time |
|------------|--------------------------|
| 0 - 30 | 4+ Hours |
| 31 - 50 | 2 - 4 Hours |
| 51 - 70 | 1 - 2 Hours |
| 71 - 85 | 30 - 60 Minutes |
| 86 - 100 | 10 - 30 Minutes |

### Example Output

{
  "incident_type": "Gas Ignition",
  "risk_score": 94,
  "confidence_score": 98,
  "time_to_escalation": "22 Minutes"
}

### Purpose

- Improves operator decision-making.
- Supports proactive intervention.
- Reinforces the predictive nature of Foresight.

## Step 1: Environmental Risk Score (ERS)

The Environmental Risk Score (ERS) represents the overall environmental hazard level of a refinery zone based on real-time sensor telemetry.

ERS combines gas concentration, temperature, pressure, and ventilation conditions into a single normalized score.

Formula:

ERS = (0.25 × gas_level)
    + (0.25 × temperature)
    + (0.25 × pressure)
    + (0.25 × (100 - ventilation))

Output Range:

0 - 100

Purpose:

- Establish baseline environmental danger.
- Detect worsening operating conditions.
- Provide a foundation for compound-risk analysis.
### Step 2: Operational Activity Modifiers ($OAM$)
Reflects the general hazard level added by active industrial work permits:
$$OAM = (5 \text{ if } \text{hot\_work} \text{ else } 0) + (5 \text{ if } \text{maintenance} \text{ else } 0) + (5 \text{ if } \text{confined\_space\_entry} \text{ else } 0)$$
### Step 3: Hazard Premium ($HP$)
If the telemetry matches the criteria for an active incident type, a hazard premium is added:
*   **Explosion:** $+45$
*   **Gas Ignition:** $+35$
*   **Toxic Exposure:** $+30$
*   **Safe:** $+0$
### Step 4: Normalization and Capping
$$\text{Raw Score} = BSR + OAM + HP$$
*   **Capped Final Score:** $\text{Min}(\text{Raw Score}, 100)$
*   **Separation Capping:** To ensure the dashboard can distinguish between states, we force target ranges for outputs:
    *   If labeled **Explosion**, final score must lie within $[85, 100]$.
    *   If labeled **Gas Ignition**, final score must lie within $[75, 95]$.
    *   If labeled **Toxic Exposure**, final score must lie within $[70, 90]$.
    *   If labeled **Safe**, final score is capped at $65$.
---
## Logical Flow Chart
The following control flow is executed sequentially to determine the label and risk status:
```
                  +--------------------------+
                  | Telemetry Record Received|
                  +-------------+------------+
                                |
                                v
                /------------------------------\
               /  Is Pressure >= 80            \
              <   AND Temperature >= 80         >
               \  AND Maintenance == True?     /
                \------------------------------/
                             /      \
                     YES    /        \   NO
                           /          \
                          v            v
            +-------------------+    /---------------------------\
            | Label: Explosion  |   /  Is Gas >= 70               \
            | Premium: +45      |  <   AND Hot Work == True?       >
            | Score Range:85-100|   \                             /
            +-------------------+    \---------------------------/
                                                /      \
                                        YES    /        \   NO
                                              /          \
                                             v            v
                               +--------------------+   /---------------------------\
                               | Label: Gas Ignition|  /  Is Gas >= 65               \
                               | Premium: +35       | <   AND Ventilation <= 30       >
                               | Score Range: 75-95 |  \  AND Confined Space == True? /
                               +--------------------+   \---------------------------/
                                                                    /      \
                                                            YES    /        \   NO
                                                                  /          \
                                                                 v            v
                                                    +--------------------+  +---------------+
                                                    |Label:Toxic Exposure|  | Label: Safe   |
                                                    |Premium: +30        |  | Premium: +0   |
                                                    |Score Range: 70-90  |  | Score Capped  |
                                                    +--------------------+  | at 65         |
                                                                            +---------------+
```
---
## Actionable Mitigation Rules
When the engine classifies an event, it maps specific actions to return to the operator:
*   **Explosion Risk:**
    *   *Action 1:* Emergency relief valve activation.
    *   *Action 2:* Immediate suspension of active maintenance permits in Zone.
    *   *Action 3:* Emergency cooling line engagement.
*   **Gas Ignition Risk:**
    *   *Action 1:* Automated trip of active hot work power lines.
    *   *Action 2:* Evacuation of non-essential personnel from Zone.
    *   *Action 3:* Increase ventilation systems to maximum output (100%).
*   **Toxic Exposure Risk:**
    *   *Action 1:* Trigger alarm lights outside confined space entryway.
    *   *Action 2:* Deploy auxiliary ventilation blowers.
    *   *Action 3:* Retrieve entry crew using harness recovery systems.

## Engine Output Schema

The Compound Risk Engine returns the following structure:

{
  "zone": "Zone A",
  "incident_type": "Gas Ignition",
  "risk_score": 94,
  "confidence_score": 98,
  "time_to_escalation": "22 Minutes",
  "risk_factors": [
    "High Gas Levels",
    "Active Hot Work Permit",
    "Reduced Ventilation"
  ],
  "recommended_actions": [
    "Suspend Hot Work",
    "Increase Ventilation",
    "Evacuate Non-Essential Personnel"
  ]
}