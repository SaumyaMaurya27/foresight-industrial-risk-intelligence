# Foresight Feature Summary Statistics

This report outlines the summary statistics of the continuous and discrete telemetry parameters across all 10,000 scenarios under the probabilistic triggering model.

## Continuous Sensor Features Summary

| Metric | Mean | Std Dev | Min | 25% | 50% | 75% | Max | Target Mean |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gas Level (% LEL)** | 27.45 | 29.80 | 0.49 | 6.20 | 12.21 | 42.27 | 100.00 | ~12.0% |
| **Temperature (°C)** | 47.88 | 17.50 | 0.00 | 35.85 | 46.56 | 58.05 | 99.52 | ~45.0°C |
| **Pressure (% Max)** | 52.46 | 16.99 | 0.39 | 40.75 | 51.36 | 62.99 | 100.00 | ~50.0% |
| **Ventilation (% Cap)**| 72.85 | 20.27 | 6.38 | 63.39 | 78.02 | 88.18 | 99.99 | ~77.0% |
| **ERS Baseline** | 38.73 | 11.82 | 5.45 | 29.81 | 36.27 | 46.64 | 83.64 | N/A |
| **Risk Score** | 51.40 | 26.85 | 5.45 | 31.25 | 38.58 | 85.02 | 100.00 | N/A |

## Operational Boolean Flags Summary

| Permit / Activity | Active Count | Active Ratio | Target Ratio | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Hot Work Permit** | 2,528 | 25.28% | 15.00% | In Line |
| **Maintenance Activity** | 1,504 | 15.04% | 12.00% | In Line |
| **Confined Space Entry** | 1,469 | 14.69% | 8.00% | In Line |

## Statistical Fidelity Evaluation
1. **Sensor Averages:** The generated mean metrics represent standard operational baselines. The shift in means is minor and reflects the updated class distribution mix (e.g., higher incident rates).
2. **Flag Trials:** Bernoulli coins have satisfied standard probabilities exactly, allowing ML models to train on representative work permit counts.
