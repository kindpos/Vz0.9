"""
KINDpos FastAPI Application

The main entry point for the backend API.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

from app.config import settings
from app.api.dependencies import init_ledger, close_ledger
from app.api.routes import orders
from app.api.routes import system
from app.api.routes import menu
from app.api.routes import hardware
from app.api.routes import printing
from app.api.routes import payment_routes
from app.api.routes import config
from app.api.routes import staff


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # Startup
    print("Starting " + settings.app_name + " v" + settings.app_version)
    print("Terminal ID: " + settings.terminal_id)
    print("Database: " + settings.database_path)

    await init_ledger()
    print("Event Ledger initialized")

    yield

    # Shutdown
    print("Shutting down...")
    await close_ledger()
    print("Event Ledger closed")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Nice. Dependable. Yours.",
    lifespan=lifespan,
)

# CORS middleware (allows frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:8000", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router, prefix="/api/v1")
app.include_router(system.router, prefix="/api/v1")
app.include_router(menu.router, prefix="/api/v1")
app.include_router(hardware.router, prefix="/api/v1")
app.include_router(printing.router, prefix="/api/v1")
app.include_router(payment_routes.router, prefix="/api/v1")
app.include_router(config.router, prefix="/api/v1")
app.include_router(staff.router, prefix="/api/v1")


# Global Static Assets (Fonts)
if getattr(sys, 'frozen', False):
    base_path = sys._MEIPASS
else:
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

assets_path = os.path.join(base_path, 'core', 'frontend', 'assets')
# Fallback to shared assets if frontend assets don't exist
if not os.path.exists(assets_path):
    assets_path = os.path.join(base_path, 'shared', 'assets')

if os.path.exists(assets_path):
    print(f"Mounting assets from: {assets_path}")
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
else:
    print(f"WARNING: Assets path not found: {assets_path}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "terminal_id": settings.terminal_id,
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "KINDpos API",
        "tagline": "Nice. Dependable. Yours.",
        "docs": "/docs",
    }
