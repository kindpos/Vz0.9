from fastapi import APIRouter, Depends
from app.api.dependencies import get_ledger
from app.core.event_ledger import EventLedger
from app.services.overseer_config_service import OverseerConfigService

router = APIRouter(prefix="/servers", tags=["staff"])

@router.get("")
async def get_servers(ledger: EventLedger = Depends(get_ledger)):
    """
    Returns active employees shaped for the terminal login roster.
    Called by the terminal UI on mount to populate the PIN login screen.
    """
    service = OverseerConfigService(ledger)
    employees = await service.get_employees()
    return {
        "servers": [
            {
                "id": e.employee_id,
                "name": e.display_name,
                "pin": e.pin,
                "role": e.role_id,
            }
            for e in employees
            if e.active
        ]
    }
