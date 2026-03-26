"""
FastAPI Dependencies

Shared dependencies for API routes.
The Event Ledger is managed here as a singleton.
"""

from typing import AsyncGenerator
from app.core.event_ledger import EventLedger
from app.config import settings

# Global ledger instance (initialized on startup)
_ledger: EventLedger | None = None


async def get_ledger() -> EventLedger:
    """Dependency that provides the Event Ledger."""
    if _ledger is None:
        raise RuntimeError("Event Ledger not initialized")
    return _ledger


async def init_ledger() -> EventLedger:
    """Initialize the Event Ledger on startup."""
    global _ledger
    _ledger = EventLedger(settings.database_path)
    await _ledger.connect()
    return _ledger


async def close_ledger() -> None:
    """Close the Event Ledger on shutdown."""
    global _ledger
    if _ledger:
        await _ledger.close()
        _ledger = None
