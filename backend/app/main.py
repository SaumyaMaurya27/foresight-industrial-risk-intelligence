from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

# Instantiate the production-quality FastAPI application
app = FastAPI(
    title="Foresight Risk Intelligence API",
    description="""
    Predictive Industrial Risk Intelligence Platform.

    Detects compound industrial risks by combining:

    • Environmental Sensor Data
    • Operational Activities
    • Deterministic Risk Engine

    Designed for Oil & Gas Refineries.
    """,
    version="1.0.0",

    docs_url="/docs",
    redoc_url="/redoc"
    
   
)

# Mount CORS middleware to enable external requests (e.g. React/Vite dashboard connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open to all origins for prototype & demo compatibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount separate router containing all the REST endpoints
app.include_router(router)
