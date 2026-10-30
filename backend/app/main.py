import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.v1.routers import auth, resume, dashboard, roles, profile, simulation, interview, jobs, admin

app = FastAPI(title="CareerIQ AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(resume.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(roles.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(simulation.router, prefix="/api/v1")
app.include_router(interview.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/api/health")
def health():
    return {"status": "CareerIQ AI API online"}


# Unified Frontend SPA Serving
FRONTEND_DIST = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not catch API routes or Swagger docs
        if (
            full_path.startswith("api")
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Endpoint not found")

        # If a specific static file was requested (e.g. favicon.svg)
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)

        # Fallback to index.html for React client-side routing
        index_html = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_html):
            return FileResponse(index_html)

        raise HTTPException(status_code=404, detail="Frontend build not found")
