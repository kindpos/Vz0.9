"""
Hardware Discovery API Endpoints
Network scanning and printer discovery via Server-Sent Events.
"""

import json
import asyncio
import threading
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import socket
from datetime import datetime

from app.config import settings
from shared.scanner.printer_detector import PrinterDiscovery

router = APIRouter(prefix="/hardware", tags=["hardware"])

class ScanRequest(BaseModel):
    """Request body for printer discovery."""
    network: Optional[str] = None  # Defaults to config.default_subnet
    timeout: Optional[float] = None  # Defaults to config.scan_timeout

def _run_scan_in_thread(queue: asyncio.Queue, loop, network: str):
    """
    Run printer discovery in a background thread.
    """
    scanner = PrinterDiscovery()

    def on_progress(event_type: str, data: dict):
        """Bridge scanner callbacks to the async SSE queue."""
        event = {"type": event_type, **data}
        asyncio.run_coroutine_threadsafe(queue.put(event), loop)

    scanner.on_progress = on_progress

    try:
        printers = scanner.scan_network(network, methods=["port_scan"])

        # Send final printer configs for frontend to render
        for printer in printers:
            config = printer.to_printer_config_dict()
            asyncio.run_coroutine_threadsafe(
                queue.put({"type": "printer_config", **config}),
                loop,
            )

    except Exception as e:
        asyncio.run_coroutine_threadsafe(
            queue.put({"type": "error", "message": f"Scan failed: {str(e)}"}),
            loop,
        )

    # Signal completion to the SSE generator
    asyncio.run_coroutine_threadsafe(queue.put({"type": "__DONE__"}), loop)

@router.post("/discover-printers")
async def discover_printers(request: ScanRequest = ScanRequest()):
    """
    Execute printer discovery and stream results via Server-Sent Events.
    """
    network = request.network or settings.default_subnet

    async def discovery_stream():
        queue = asyncio.Queue()
        loop = asyncio.get_event_loop()

        thread = threading.Thread(
            target=_run_scan_in_thread,
            args=(queue, loop, network),
            daemon=True,
        )
        thread.start()

        while True:
            event = await queue.get()

            if event.get("type") == "__DONE__":
                break

            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        discovery_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@router.get("/status")
async def hardware_status():
    """Basic hardware API status check."""
    return {
        "status": "online",
        "message": "Hardware discovery API ready",
        "default_subnet": settings.default_subnet,
        "endpoints": {
            "discover_printers": "POST /api/hardware/discover-printers",
            "status": "GET /api/hardware/status",
        },
    }

class TestPrintRequest(BaseModel):
    """Request body for test print."""
    ip: str
    port: int = 9100

@router.post("/test-print")
async def test_print(request: TestPrintRequest):
    """
    Send a KINDpos test receipt to a printer via raw ESC/POS over TCP.
    """
    try:
        # ESC/POS command bytes
        ESC = b'\x1b'
        GS = b'\x1d'

        INIT = ESC + b'\x40'                # Initialize printer
        CENTER = ESC + b'\x61\x01'           # Center alignment
        LEFT = ESC + b'\x61\x00'             # Left alignment
        BOLD_ON = ESC + b'\x45\x01'          # Bold on
        BOLD_OFF = ESC + b'\x45\x00'         # Bold off
        DOUBLE_WIDTH = ESC + b'\x21\x20'     # Double width
        NORMAL_SIZE = ESC + b'\x21\x00'      # Normal size
        FEED = ESC + b'\x64\x03'             # Feed 3 lines
        CUT = GS + b'\x56\x00'              # Full cut

        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Build the receipt
        receipt = bytearray()
        receipt += INIT
        receipt += CENTER

        # Header
        receipt += b'================================\n'
        receipt += DOUBLE_WIDTH + BOLD_ON
        receipt += b'K I N D p o s\n'
        receipt += NORMAL_SIZE + BOLD_OFF
        receipt += CENTER
        receipt += b'Nice. Dependable. Yours.\n'
        receipt += b'================================\n'
        receipt += b'\n'

        # Test banner
        receipt += BOLD_ON + DOUBLE_WIDTH
        receipt += b'*** TEST PRINT ***\n'
        receipt += NORMAL_SIZE + BOLD_OFF
        receipt += b'\n'

        # Device info
        receipt += LEFT
        receipt += f'  IP:    {request.ip}\n'.encode()
        receipt += f'  Port:  {request.port}\n'.encode()
        receipt += f'  Date:  {now}\n'.encode()
        receipt += b'\n'

        # Confirmation message
        receipt += CENTER
        receipt += b'If you can read this,\n'
        receipt += b'your printer is ready.\n'
        receipt += b'\n'

        # Footer
        receipt += b'================================\n'
        receipt += BOLD_ON
        receipt += b'KIND Technologies\n'
        receipt += BOLD_OFF
        receipt += b'================================\n'

        receipt += FEED
        receipt += CUT

        # Send to printer via raw TCP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5.0)
        sock.connect((request.ip, request.port))
        sock.sendall(bytes(receipt))
        sock.close()

        return {
            "success": True,
            "message": f"Test print sent to {request.ip}:{request.port}",
            "timestamp": now,
        }

    except socket.timeout:
        return {
            "success": False,
            "message": f"Connection timed out - printer at {request.ip}:{request.port} not responding",
        }
    except ConnectionRefusedError:
        return {
            "success": False,
            "message": f"Connection refused - no printer listening on {request.ip}:{request.port}",
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Print failed: {str(e)}",
        }
