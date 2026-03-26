# models/events.py

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional
import uuid
import json


@dataclass
class Event:
    """Represents a single immutable event in the system"""

    # Required fields
    event_type: str
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + 'Z')

    # Optional fields
    event_uuid: str = field(default_factory=lambda: str(uuid.uuid4()))
    aggregate_type: Optional[str] = None
    aggregate_id: Optional[str] = None
    terminal_id: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    # Will be set by EventStore
    event_id: Optional[int] = None
    sequence_number: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for storage"""
        return {
            'event_uuid': self.event_uuid,
            'event_type': self.event_type,
            'aggregate_type': self.aggregate_type,
            'aggregate_id': self.aggregate_id,
            'timestamp': self.timestamp,
            'terminal_id': self.terminal_id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'payload': json.dumps(self.payload),
            'metadata': json.dumps(self.metadata) if self.metadata else None
        }

    def __str__(self):
        """Pretty print for debugging"""
        return f"Event({self.event_type} @ {self.timestamp})"


# Event type constants
class EventTypes:
    """All possible event types in the system"""

    # Menu import lifecycle
    MENU_IMPORT_STARTED = "menu.import_started"
    MENU_IMPORT_COMPLETED = "menu.import_completed"

    # Restaurant configuration
    RESTAURANT_CONFIGURED = "restaurant.configured"

    # Tax rules
    TAX_RULES_BATCH_CREATED = "tax_rules.batch_created"

    # Categories
    CATEGORIES_BATCH_CREATED = "categories.batch_created"

    # Items
    ITEMS_BATCH_CREATED = "items.batch_created"

    # Discounts
    DISCOUNTS_BATCH_CREATED = "discounts.batch_created"