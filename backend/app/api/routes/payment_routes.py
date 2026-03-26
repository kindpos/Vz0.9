from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional

# Correcting relative imports for app.api.routes
from ..dependencies import get_ledger
from ...core.event_ledger import EventLedger
from ...core.adapters.payment_manager import PaymentManager
from ...core.adapters.payment_validator import PaymentValidator
from ...core.adapters.base_payment import TransactionRequest, TransactionResult, ValidationStatus, ValidationResult
from ...config import settings

router = APIRouter(prefix="/payments", tags=["payments"])

_manager: Optional[PaymentManager] = None
_validator: Optional[PaymentValidator] = None

def get_payment_manager(ledger: EventLedger = Depends(get_ledger)) -> PaymentManager:
    global _manager
    if _manager is None:
        _manager = PaymentManager(ledger, settings.terminal_id)
    return _manager

def get_payment_validator(ledger: EventLedger = Depends(get_ledger)) -> PaymentValidator:
    global _validator
    if _validator is None:
        _validator = PaymentValidator(ledger)
    return _validator

@router.post("/sale")
async def process_sale(
    request: TransactionRequest,
    manager: PaymentManager = Depends(get_payment_manager),
    validator: PaymentValidator = Depends(get_payment_validator)
):
    """Initiate sale. Returns ValidationResult or TransactionResult."""
    # 1. Resolve Device
    device_id = manager._terminal_device_map.get(request.terminal_id)
    device = manager._devices.get(device_id) if device_id else None

    # 2. Validate
    v_result = await validator.validate(request, device)
    if v_result.status == ValidationStatus.REJECTED:
        raise HTTPException(status_code=400, detail=v_result.reason)
    
    if v_result.status == ValidationStatus.NEEDS_APPROVAL:
        return v_result # Return to frontend for PIN entry

    # 3. Process
    result = await manager.initiate_sale(request)
    return result

@router.get("/device-status")
async def get_device_status(manager: PaymentManager = Depends(get_payment_manager)):
    """All devices: id, name, status, last_checked."""
    return [
        {
            "id": d.config.device_id if d.config else "unknown",
            "name": d.config.name if d.config else "Unknown",
            "status": d.status,
            "ip": d.config.ip_address if d.config else None
        }
        for d in manager._devices.values()
    ]
