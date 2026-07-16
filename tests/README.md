# Project Quality Assurance & Testing Suite

## Purpose
This directory houses automated test scripts designed to verify code correctness across frontend components, backend routes, and mathematical formulas of the Risk Engine.

## Directory Structure & Files
*   `frontend/` - Contains unit and routing tests verifying React interface rendering.
*   `backend/` - Contains integration tests targeting FastAPI endpoints and DB connectivity.
*   `risk_engine/` - Contains unit tests validating risk-score equations and threshold boundaries.

## Testing Execution Guide

### Running Backend & Risk Engine Tests:
Run pytest from the project backend directory:
```bash
cd backend
pytest ../tests/backend/ ../tests/risk_engine/ -v
```

### Running Frontend UI Tests:
Navigate to the frontend folder and run testing scripts:
```bash
cd frontend
npm run test
```

## Why It Exists
Centralizes testing files in a clean directory, preventing logic folders from becoming crowded and making integration with CI/CD platforms simple.
