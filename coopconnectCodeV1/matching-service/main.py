from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import match

app = FastAPI(
    title="CoopConnect AI — Matching Service",
    description="Moteur de matching intelligent basé sur TF-IDF + scoring géographique",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match.router)


@app.get("/")
def root():
    return {"service": "CoopConnect AI Matching", "version": "1.0.0", "status": "running"}
