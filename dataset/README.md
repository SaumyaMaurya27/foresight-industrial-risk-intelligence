# Foresight Safety Dataset Folder

## Purpose
This directory manages data assets and data engineering utilities for the platform. It houses specifications detailing feature characteristics and handles the storage of synthetic sensor scenarios used to train predictive ML models.

## Directory Structure & Files
*   `dataset-spec.md` - Technical specification detailing continuous feature distributions, permit probabilities, and rule thresholds.
*   `generator.py` - (Future implementation) Python command-line utility used to compile the 10,000 synthetic safety scenario records.
*   `synthetic_refinery_dataset.csv` - (Future implementation) The generated dataset containing sensor metrics, operational activity logs, risk evaluations, and target classifications.

## Why It Exists
Maintaining data assets separate from application files prevents runtime directories from becoming cluttered, organizes data engineering efforts, and enables clean version tracking of synthetic datasets.
