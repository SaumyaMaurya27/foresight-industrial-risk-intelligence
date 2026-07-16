# Dataset Specification: Synthetic Refinery Safety Telemetry
This document details the schema, statistical properties, and distribution parameters used to generate the 10,000 synthetic safety scenarios for the **Foresight** platform.
The dataset is generated to simulate realistic physical sensor states and permit logs in an oil and gas refinery, introducing specific compound anomaly clusters suitable for machine learning training.
---
## Dataset Schema Definition
The generated dataset is exported as `synthetic_refinery_dataset.csv` and contains the following columns:
| Column Name | Data Type | Range / Values | Physical Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`scenario_id`** | Integer | `1` to `10000` | ID | Unique identifier for each safety record. |
| **`zone_name`** | String | `Zone A`, `Zone B`, `Zone C` | N/A | Division name where sensors are located. |
| **`gas_level`** | Float | `0.0` - `100.0` | % LEL | Gas concentration level relative to Lower Explosive Limit. |
| **`temperature`** | Float | `0.0` - `100.0` | °C | Local zone ambient/process temperature in Celsius. |
| **`pressure`** | Float | `0.0` - `100.0` | % Max | Process pressure relative to normal working limits. |
| **`ventilation`** | Float | `0.0` - `100.0` | % Capacity | Active ventilation system air flow throughput. |
| **`hot_work`** | Boolean | `0` or `1` | Flag | Permit flag indicating active welding, cutting, or grinding. |
| **`maintenance`** | Boolean | `0` or `1` | Flag | Permit flag indicating open line operations or repairs. |
| **`confined_space_entry`**| Boolean | `0` or `1` | Flag | Permit flag indicating active crew inside restricted vessels. |
| **`incident_type`** | String | `Safe`, `Gas Ignition`, `Explosion`, `Toxic Exposure` | N/A | Calculated target safety classification classification. |
| **`risk_score`** | Float | `0.0` - `100.0` | Score | Normalized compound risk level. |
---
## Statistical Distributions for Sensors
To make the synthetic telemetry realistic, continuous features are generated using tailored statistics instead of uniform random values.
```
       [Gas Level: Log-Normal]                 [Temperature: Normal]
        |\                                          /\
        | \                                        /  \
        |  \_________                             /____\
        0          100                           0  45  100
        
      [Pressure: Normal (Split)]               [Ventilation: Beta]
              /\                                         /|
             /  \                                       / |
          __/____\__                             ______/  |
          0  50   100                            0       100
```
### 1. Gas Level (`gas_level`)
*   **Distribution:** Log-normal distribution, representing a plant where gas levels are close to zero almost all the time but occasionally experience spikes due to leaks.
*   **Parameters:** Mean of log: 2.2, Standard deviation of log: 0.8. Capped at 100.0.
*   **Target Average:** ~12% with standard operations; spikes > 70% represent ~5% of records.
### 2. Temperature (`temperature`)
*   **Distribution:** Normal distribution representing standard process temperatures.
*   **Parameters:** Mean = 45.0°C, Standard Deviation = 15.0. Capped at [0.0, 100.0].
*   **Target Average:** 45.0°C.
### 3. Pressure (`pressure`)
*   **Distribution:** Normal distribution.
*   **Parameters:** Mean = 50.0%, Standard Deviation = 15.0. Capped at [0.0, 100.0].
*   **Target Average:** 50.0%.
### 4. Ventilation (`ventilation`)
*   **Distribution:** Beta distribution, skewed towards high ventilation values (since ventilation fans run continuously under normal safety regulations).
*   **Parameters:** Alpha = 5.0, Beta = 1.5. Scaled to [0.0, 100.0].
*   **Target Average:** 77.0%. Drops below 30.0% represent rare mechanical failures (~4% of records).
---
## Operational Activity Probabilities
Operational boolean flags are generated independently using coin-flip Bernoulli trials:
*   **`hot_work`:** $P(\text{True}) = 0.15$ (15% chance of welding activities)
*   **`maintenance`:** $P(\text{True}) = 0.12$ (12% chance of system maintenance)
*   **`confined_space_entry`:** $P(\text{True}) = 0.08$ (8% chance of workers entering vessels)
---
## Expected Target Incident Class Distributions
Applying the deterministic compound rules on the statistical distribution generates a dataset with class ratios appropriate for classification model training:
| Incident Type | Expected Count (in 10,000) | Expected Ratio | Ingestion Pattern Source |
| :--- | :--- | :--- | :--- |
| **`Safe`** | ~9,100 | ~91.0% | Normal operations baseline sensor fluctuations. |
| **`Gas Ignition`** | ~350 - 450 | ~4.0% | Occurs when log-normal gas spikes overlap hot work permits. |
| **`Explosion`** | ~150 - 200 | ~1.8% | Occurs when high temp/pressure overlap maintenance work. |
| **`Toxic Exposure`** | ~250 - 300 | ~2.7% | Occurs when gas leaks overlap low ventilation and tank entries. |
---
## Validation & ML Integrity Guidelines
1.  **Seed Standardization:** The generator script will employ a fixed random seed (`numpy.random.seed(42)`) to ensure that successive execution passes generate the identical 10,000 records.
2.  **Multiclass Target Separation:** The `risk_score` column must not be used as a feature during classification training, as it is a derived metric. ML pipelines should only train on the raw telemetry features and predict the target `incident_type`.
3.  **Perfect Rule Adherence:** If a row meets the logical conditions of an incident, the record must receive that classification. The database validator must raise exceptions if any record fails this criteria.
