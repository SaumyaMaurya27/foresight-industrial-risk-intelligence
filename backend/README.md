# Foresight Backend Codebase

## Purpose
This directory houses the core server application, business logic, safety computation routines, and API endpoints for Foresight. It handles telemetry ingestion, executes the Compound Risk Engine, hosts predictive machine learning models, and orchestrates calls to Google's Gemini LLM.

## Directory Structure & Files
*   `requirements.txt` - Python project package dependencies (FastAPI, uvicorn, SQLAlchemy, scikit-learn, google-generativeai, pandas, numpy).
*   `main.py` - FastAPI application entrance file containing routers and CORS middleware setup.
*   `app/` - Core Python modules:
    *   `app/api/` - HTTP request controllers and routes (telemetry, zones, events, chat).
    *   `app/core/` - Application configurations and environmental parameters.
    *   `app/db/` - Database connectivity modules, migrations, and seeding scripts.
    *   `app/models/` - Relational table models (SQLite schemas).
    *   `app/schemas/` - Pydantic request/response validation schemas.
    *   `app/services/` - External integrations (Gemini SDK wrapper, ML classifier predictor).
    *   `app/risk_engine/` - Shared risk engine module containing the calculation logic (`logic.py`).

## Why It Exists
Decoupling the API backend secures data transactions, isolates resource-heavy machine learning inference, and coordinates secure communication with external APIs like Google Gemini.

## Local Development Setup

Follow these steps to set up the backend service locally:

### 1. Prerequisites
- Python 3.10 or higher
- `pip` package manager

### 2. Set Up Virtual Environment
Initialize a virtual environment to manage dependencies:
```bash
# Navigate to the backend directory
cd foresight/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (Command Prompt):
venv\Scripts\activate.bat
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Install all package dependencies:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Settings
Create a `.env` file from the template and set your credentials:
```bash
# Copy env example
cp .env.example .env
```
Open the `.env` file and set the Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Running the Application
Once the entry routers are implemented, run the FastAPI developer server:
```bash
uvicorn app.api.main:app --reload
```
The API documentation will be available locally at `http://127.0.0.1:8000/docs`.

### 6. Run Unit Tests
To run backend risk engine tests directly:
```bash
python ../tests/risk_engine/test_risk_math.py
```