# Foresight Incident Distribution Report

This document reports the classification statistics and class ratios generated for the Foresight predictive dataset under the probabilistic triggering model.

## Dataset Class Distribution Summary

Total Scenarios Generated: **10,000**

| Incident Type | Count | Percentage | Target Ratio | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Safe** | 7,000 | 70.00% | 70.00% | Match |
| **Gas Ignition** | 1,500 | 15.00% | 15.00% | Match |
| **Toxic Exposure** | 800 | 8.00% | 8.00% | Match |
| **Explosion** | 700 | 7.00% | 7.00% | Match |

## Distribution across Processing Zones

Processing zones baseline distributions were mapped using distinct safety profiles:
- **Zone A (Fuel Storage Tanks):** Prone to gas hazards.
- **Zone B (Fractionation Towers):** Prone to maintenance/pressure/temperature hazards.
- **Zone C (Hydrocracking Area):** Prone to explosive thermal cracking events.

| Zone | Safe | Gas Ignition | Toxic Exposure | Explosion | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Zone A** | 2,169 | 891 | 591 | 36 | 3,687 |
| **Zone B** | 2,729 | 145 | 63 | 175 | 3,112 |
| **Zone C** | 2,102 | 464 | 146 | 489 | 3,201 |

## Rules Integrity & Seed Standardization
- **Probabilistic Incident Triggering:** Enabled. Safety classifications are assigned probabilistically to represent fuzzy limits (20% of records in incident cohorts do not strictly meet the deterministic rules) and false alarms.
- **Reproducible Seed:** Verified. The dataset generator uses seed `42` to produce the identical 10,000 records on consecutive executions.
