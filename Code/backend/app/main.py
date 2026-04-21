from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, users, listings, matches

# Create tables (dev only)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(HTTPSRedirectMiddleware)  # Prod only

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(listings.router, prefix="/listings", tags=["listings"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])

@app.get("/")
def root():
    return {"message": "CoopConnect AI API 🚀", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "db": "connected"}
