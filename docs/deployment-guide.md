# Foresight Deployment Guide
This document details the configuration and hosting setup required to run the Foresight platform in both local development and production staging environments. 
---
## 1. Environment Configurations (`.env.example`)
The backend and frontend services consume configuration parameters via environment variables. Copy the config template from the repository:
```bash
cp config/.env.example backend/.env
```
### Required Configuration Keys:
| Variable Name | Environment | Recommended Value | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | `sqlite:///./foresight.db` | Path to the local SQLite database file. |
| `PORT` | Backend | `8000` | Port on which the FastAPI application runs. |
| `GEMINI_API_KEY` | Backend | *(Your Gemini Key)* | Developer API Key requested from Google AI Studio. |
| `VITE_API_URL` | Frontend | `http://localhost:8000/api/v1` | Backend endpoint base url for dashboard API calls. |
---
## 2. Local Database Initialization (SQLite)
Since SQLite is a file-based relational database, no heavy system installations are required.
1.  **Virtual Environment Activation:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r backend/requirements.txt
    ```
2.  **Schema Creation:**
    Run the setup command script to compile tables:
    ```bash
    python backend/app/db/init_db.py
    ```
3.  **Data Loading:**
    Inject synthetic sensor logs from the dataset directory into SQLite:
    ```bash
    python backend/app/db/seed_db.py
    ```
---
## 3. Frontend Deployment (Vercel)
The React dashboard runs as a Vite project and compiles to static files, which can be deployed to Vercel.
### Vercel Web Console Setup Steps:
1.  **Import Repository:** Connect Vercel to your GitHub repository and import the `foresight` project folder.
2.  **Directory Selection:** Set the **Root Directory** settings to `frontend`.
3.  **Build Settings:**
    *   *Build Command:* `npm run build`
    *   *Output Directory:* `dist`
    *   *Install Command:* `npm install`
4.  **Environment Variables:** Add `VITE_API_URL` and point it to the production URL of your backend (e.g. `https://foresight-api.onrender.com/api/v1`).
5.  **Deploy:** Click Deploy. Vercel will build the React SPA and provide a public URL (e.g., `https://foresight-dashboard.vercel.app`).
---
## 4. Backend Deployment (Render)
The FastAPI python server is hosted on Render, reading/writing to the local SQLite storage.
> [!NOTE]
> Since Render's free tier containers have ephemeral filesystems, the SQLite database file (`foresight.db`) will reset on redeployment. For production hackathon stability, we mount a Render Persistent Disk or use a lightweight hosted PostgreSQL instance. If using SQLite on Render, configure a Disk path.
### Render Web Console Setup Steps:
1.  **Create Service:** Create a new **Web Service** and link your GitHub repository.
2.  **Directory Selection:** Set the **Root Directory** to `backend`.
3.  **Service Environment Configuration:**
    *   *Runtime:* `Python`
    *   *Build Command:* `pip install -r requirements.txt`
    *   *Start Command:* `uvicorn main:app --host 0.0.0.0 --port $PORT`
4.  **Environment Variables:** Add the following parameters:
    *   `DATABASE_URL` = `sqlite:////var/data/foresight.db` (Points database to the mounted disk directory)
    *   `GEMINI_API_KEY` = *(Your actual key)*
5.  **Disk Mounting (Persistent Storage):**
    *   Go to **Disks** section in Render.
    *   Add a Disk named `foresight-data`.
    *   *Mount Path:* `/var/data`
    *   *Size:* `1 GB` (minimum)
6.  **Deploy:** Click Deploy. Render will construct the virtual container environment and expose a public endpoint. Update your Vercel `VITE_API_URL` with this endpoint.