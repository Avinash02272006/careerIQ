# CareerIQ AI — Unified Career Intelligence & Diagnostic Engine

CareerIQ AI is an end-to-end full-stack platform that combines multi-engine resume OCR extraction, skill radar diagnostics, predictive placement modeling, interactive AI mock interviews, skill-based job matching, and centralized administrative telemetry into a single, cohesive application.

---

## Key Modules & Core Pages

| Module | Route | Highlights |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Three.js particle canvas hero, platform feature matrix, one-click quick actions. |
| **Diagnostics Dashboard** | `/dashboard` | Interactive 6-domain Skill Radar chart, placement readiness score (0-100), market demand benchmark, gap analysis, dynamic study roadmap, and export modal. |
| **ATS Resume Analyzer** | `/resume-analyzer`, `/upload` | Multi-engine document text extraction (PDF, PNG, JPG, Word .docx, plain text), ATS scoring breakdown (Section Completeness, Action Verbs, Quantified Impact, Keyword Density), and raw text inspector. |
| **AI Mock Interview Lab** | `/interview` | Technical & behavioral interview simulator tailored to 10 benchmark roles. Live timer, speech dictation, hint engine, and instant scoring across Technical Precision, Clarity, and Depth with model answers. |
| **Job Matching & Placement** | `/job-matching` | Candidate skill compatibility engine with match percentage gauges, missing skill alerts, 1-click application tracking, and an **External Job Description (JD) ATS Scanner**. |
| **Admin Command Center** | `/admin` | Centralized platform telemetry (uptime, latency, resumes parsed, interviews taken), candidate registry table with dossier inspection, 7-day throughput chart, role benchmark weights manager, and system health status. |
| **Benchmark Role Explorer** | `/roles` | Market demand matrix across 10 industry engineering tracks. |
| **What-If Career Lab** | `/simulator` | Predictive career lift simulation before learning new technologies. |
| **3D Constellation** | `/universe` | Interactive Three.js spatial graph mapping interconnected technologies. |

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Zustand, Recharts, Framer Motion, Three.js (`@react-three/fiber`, `@react-three/drei`).
- **Backend**: Python FastAPI, Uvicorn, SQLAlchemy, Alembic, PostgreSQL with `pgvector`.
- **Parsing & Analysis**: Multi-format document parser (PDF binary stream, DOCX, regex heuristics, RapidOCR).
- **Unified Deployment**: FastAPI serves both the REST API endpoints (`/api/v1/*`) and the SPA static build (`dist`) on a single port (`8000`).

---

## Quick Start (Windows)

### Option 1: 1-Click Launch
Double-click `run_careeriq.bat` in this folder. It will:
1. Activate the Python virtual environment.
2. Launch the unified FastAPI + React server on port `8000`.
3. Automatically open `http://localhost:8000/` in your browser.

### Option 2: Manual Terminal Launch

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py  # Optional: Seed benchmark roles & demo profile
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Development (Optional for Hot-Reloading)
```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation

When the server is running, interactive Swagger API documentation is available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Environment Configuration

Copy `backend/.env.example` to `backend/.env` and update your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/careeriq
JWT_SECRET=your_jwt_secret_key
PORT=8000
```
