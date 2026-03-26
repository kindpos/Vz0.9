# services/event_store.py

import sqlite3
from typing import List, Optional
from pathlib import Path
from models.events import Event


class EventStore:
    """Stores and retrieves events from SQLite database"""

    def __init__(self, db_path: str = "output/kindpos_events.db"):
        self.db_path = db_path
        self._ensure_output_directory()
        self._init_database()

    def _ensure_output_directory(self):
        """Create output directory if it doesn't exist"""
        output_dir = Path(self.db_path).parent
        output_dir.mkdir(exist_ok=True)

    def _init_database(self):
        """Create events table if it doesn't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_uuid TEXT NOT NULL UNIQUE,
                event_type TEXT NOT NULL,
                aggregate_type TEXT,
                aggregate_id TEXT,
                timestamp TEXT NOT NULL,
                sequence_number INTEGER,
                terminal_id TEXT,
                user_id TEXT,
                session_id TEXT,
                payload TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)

        # Create indexes for fast querying
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_event_type 
            ON events(event_type)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp 
            ON events(timestamp)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_aggregate 
            ON events(aggregate_type, aggregate_id)
        """)

        conn.commit()
        conn.close()

        print(f"✓ Event store initialized: {self.db_path}")

    def save_events(self, events: List[Event]) -> bool:
        """
        Save a list of events to the database

        Args:
            events: List of Event objects

        Returns:
            True if successful, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            # Get the current max sequence number
            cursor.execute("SELECT COALESCE(MAX(sequence_number), 0) FROM events")
            next_sequence = cursor.fetchone()[0] + 1

            # Insert each event
            for event in events:
                event_dict = event.to_dict()
                event_dict['sequence_number'] = next_sequence
                next_sequence += 1

                cursor.execute("""
                    INSERT INTO events (
                        event_uuid, event_type, aggregate_type, aggregate_id,
                        timestamp, sequence_number, terminal_id, user_id, 
                        session_id, payload, metadata
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    event_dict['event_uuid'],
                    event_dict['event_type'],
                    event_dict['aggregate_type'],
                    event_dict['aggregate_id'],
                    event_dict['timestamp'],
                    event_dict['sequence_number'],
                    event_dict['terminal_id'],
                    event_dict['user_id'],
                    event_dict['session_id'],
                    event_dict['payload'],
                    event_dict['metadata']
                ))

            conn.commit()
            conn.close()

            print(f"✓ Saved {len(events)} events to database")
            return True

        except Exception as e:
            print(f"✗ Error saving events: {e}")
            import traceback
            traceback.print_exc()
            return False

    def get_all_events(self) -> List[Event]:
        """Retrieve all events in sequence order"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM events 
            ORDER BY sequence_number ASC
        """)

        rows = cursor.fetchall()
        conn.close()

        # TODO: Convert rows back to Event objects
        # For now, just return the raw data
        return rows

    def get_events_by_type(self, event_type: str) -> List[Event]:
        """Get all events of a specific type"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM events 
            WHERE event_type = ?
            ORDER BY sequence_number ASC
        """, (event_type,))

        rows = cursor.fetchall()
        conn.close()

        return rows

    def get_event_count(self) -> int:
        """Get total number of events in the store"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM events")
        count = cursor.fetchone()[0]

        conn.close()
        return count