"""
Order API Routes

Endpoints for order management.
All mutations go through the Event Ledger.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging
import uuid

from app.config import settings
from app.api.dependencies import get_ledger
from app.core.event_ledger import EventLedger
from app.core.events import (
    order_created,
    item_added,
    item_removed,
    item_modified,
    item_sent,
    modifier_applied,
    payment_initiated,
    payment_confirmed,
    payment_failed,
    order_closed,
    order_voided,
    ticket_printed,
    create_event,
    EventType,
)
from app.core.projections import project_order, project_orders, Order
from app.core.event_ledger import get_open_orders
from app.api.dependencies import get_printer_manager
from app.core.adapters.printer_manager import PrinterManager
from app.core.adapters.base_printer import (
    PrintJob,
    PrintJobType,
    PrintJobContent,
    OrderContext,
)

logger = logging.getLogger("kindpos.orders")
router = APIRouter(prefix="/orders", tags=["orders"])


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class CreateOrderRequest(BaseModel):
    """Request to create a new order."""
    table: Optional[str] = None
    server_id: Optional[str] = None
    server_name: Optional[str] = None
    order_type: str = "dine_in"
    guest_count: int = 1


class AddItemRequest(BaseModel):
    """Request to add an item to an order."""
    menu_item_id: str
    name: str
    price: float
    quantity: int = 1
    category: Optional[str] = None
    notes: Optional[str] = None
    seat_number: Optional[int] = None


class ModifyItemRequest(BaseModel):
    """Request to modify an item."""
    quantity: Optional[int] = None
    price: Optional[float] = None
    notes: Optional[str] = None


class ApplyModifierRequest(BaseModel):
    """Request to apply a modifier to an item."""
    modifier_id: str
    modifier_name: str
    modifier_price: float = 0.0
    action: str = "add"  # add, remove


class InitiatePaymentRequest(BaseModel):
    """Request to initiate a payment."""
    amount: float
    method: str  # card, cash, gift_card


class ConfirmPaymentRequest(BaseModel):
    """Request to confirm a payment."""
    transaction_id: str
    amount: float


class FailPaymentRequest(BaseModel):
    """Request to record a failed payment."""
    error: str
    error_code: Optional[str] = None


class VoidOrderRequest(BaseModel):
    """Request to void an order."""
    reason: str
    approved_by: Optional[str] = None


class OrderItemResponse(BaseModel):
    """Response model for an order item."""
    item_id: str
    menu_item_id: str
    name: str
    price: float
    quantity: int
    category: Optional[str]
    notes: Optional[str]
    modifiers: list[dict]
    subtotal: float
    sent: bool = False
    sent_at: Optional[datetime] = None


class OrderResponse(BaseModel):
    """Response model for an order."""
    order_id: str
    table: Optional[str]
    server_id: Optional[str]
    server_name: Optional[str]
    order_type: str
    guest_count: int
    status: str
    items: list[OrderItemResponse]
    subtotal: float
    discount_total: float
    tax: float
    total: float
    amount_paid: float
    balance_due: float
    created_at: Optional[datetime]

    @classmethod
    def from_order(cls, order: Order) -> "OrderResponse":
        """Convert an Order projection to a response."""
        return cls(
            order_id=order.order_id,
            table=order.table,
            server_id=order.server_id,
            server_name=order.server_name,
            order_type=order.order_type,
            guest_count=order.guest_count,
            status=order.status,
            items=[
                OrderItemResponse(
                    item_id=item.item_id,
                    menu_item_id=item.menu_item_id,
                    name=item.name,
                    price=item.price,
                    quantity=item.quantity,
                    category=item.category,
                    notes=item.notes,
                    modifiers=item.modifiers,
                    subtotal=item.subtotal,
                    sent=item.sent,
                    sent_at=item.sent_at,
                )
                for item in order.items
            ],
            subtotal=order.subtotal,
            discount_total=order.discount_total,
            tax=order.tax,
            total=order.total,
            amount_paid=order.amount_paid,
            balance_due=order.balance_due,
            created_at=order.created_at,
        )


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def get_order_or_404(ledger: EventLedger, order_id: str) -> Order:
    """Get an order by ID or raise 404."""
    events = await ledger.get_events_by_correlation(order_id)
    if not events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found"
        )
    order = project_order(events)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found"
        )
    return order


# =============================================================================
# ROUTES
# =============================================================================

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
        request: CreateOrderRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Create a new order."""
    order_id = f"order_{uuid.uuid4().hex[:12]}"

    event = order_created(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        table=request.table,
        server_id=request.server_id,
        server_name=request.server_name,
        order_type=request.order_type,
        guest_count=request.guest_count,
    )
    # Set correlation_id for ORDER_CREATED
    event = event.model_copy(update={"correlation_id": order_id})

    await ledger.append(event)

    # Return the projected order
    events = await ledger.get_events_by_correlation(order_id)
    order = project_order(events)
    return OrderResponse.from_order(order)


@router.get("", response_model=list[OrderResponse])
async def list_orders(
        status_filter: Optional[str] = None,
        table: Optional[str] = None,
        server_id: Optional[str] = None,
        ledger: EventLedger = Depends(get_ledger),
):
    """List orders with optional filters."""
    # Get recent events (last 1000)
    events = await ledger.get_events_since(0, limit=10000)
    orders = project_orders(events)

    # Apply filters
    result = list(orders.values())

    if status_filter:
        result = [o for o in result if o.status == status_filter]

    if table:
        result = [o for o in result if o.table == table]

    if server_id:
        result = [o for o in result if o.server_id == server_id]

    # Sort by created_at descending
    result.sort(key=lambda o: o.created_at or datetime.min, reverse=True)

    return [OrderResponse.from_order(o) for o in result]


@router.get("/active", response_model=list[OrderResponse])
async def list_active_orders(
        ledger: EventLedger = Depends(get_ledger),
):
    """Get all active (open or printed) orders."""
    events = await ledger.get_events_since(0, limit=10000)
    orders = project_orders(events)
    active_orders = [o for o in orders.values() if o.status in ["open", "printed"]]
    active_orders.sort(key=lambda o: o.created_at or datetime.min, reverse=True)
    return [OrderResponse.from_order(o) for o in active_orders]


@router.get("/open", response_model=list[OrderResponse])
async def list_open_orders(
        ledger: EventLedger = Depends(get_ledger),
):
    """Get all open orders."""
    events = await ledger.get_events_since(0, limit=10000)
    orders = project_orders(events)
    open_orders = [o for o in orders.values() if o.status == "open"]
    open_orders.sort(key=lambda o: o.created_at or datetime.min, reverse=True)
    return [OrderResponse.from_order(o) for o in open_orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
        order_id: str,
        ledger: EventLedger = Depends(get_ledger),
):
    """Get a specific order by ID."""
    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/items", response_model=OrderResponse)
async def add_item(
        order_id: str,
        request: AddItemRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Add an item to an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add items to {order.status} order"
        )

    item_id = f"item_{uuid.uuid4().hex[:8]}"

    event = item_added(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        item_id=item_id,
        menu_item_id=request.menu_item_id,
        name=request.name,
        price=request.price,
        quantity=request.quantity,
        category=request.category,
        notes=request.notes,
        seat_number=request.seat_number,
    )
    await ledger.append(event)

    # Return updated order
    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.delete("/{order_id}/items/{item_id}", response_model=OrderResponse)
async def remove_item(
        order_id: str,
        item_id: str,
        reason: Optional[str] = None,
        ledger: EventLedger = Depends(get_ledger),
):
    """Remove an item from an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot remove items from {order.status} order"
        )

    # Verify item exists
    if not any(item.item_id == item_id for item in order.items):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found in order"
        )

    event = item_removed(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        item_id=item_id,
        reason=reason,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.patch("/{order_id}/items/{item_id}", response_model=OrderResponse)
async def modify_item(
        order_id: str,
        item_id: str,
        request: ModifyItemRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Modify an item on an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify items on {order.status} order"
        )

    # Verify item exists
    if not any(item.item_id == item_id for item in order.items):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found in order"
        )

    event = item_modified(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        item_id=item_id,
        quantity=request.quantity,
        price=request.price,
        notes=request.notes,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/items/{item_id}/modifiers", response_model=OrderResponse)
async def apply_modifier(
        order_id: str,
        item_id: str,
        request: ApplyModifierRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Apply a modifier to an item."""
    order = await get_order_or_404(ledger, order_id)

    if order.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot modify items on {order.status} order"
        )

    if not any(item.item_id == item_id for item in order.items):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item {item_id} not found in order"
        )

    event = modifier_applied(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        item_id=item_id,
        modifier_id=request.modifier_id,
        modifier_name=request.modifier_name,
        modifier_price=request.modifier_price,
        action=request.action,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/payments", response_model=OrderResponse)
async def initiate_payment(
        order_id: str,
        request: InitiatePaymentRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Initiate a payment on an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status not in ("open", "paid"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot process payment on {order.status} order"
        )

    payment_id = f"pay_{uuid.uuid4().hex[:8]}"

    event = payment_initiated(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        payment_id=payment_id,
        amount=request.amount,
        method=request.method,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/payments/{payment_id}/confirm", response_model=OrderResponse)
async def confirm_payment(
        order_id: str,
        payment_id: str,
        request: ConfirmPaymentRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Confirm a payment."""
    order = await get_order_or_404(ledger, order_id)

    # Verify payment exists
    if not any(p.payment_id == payment_id for p in order.payments):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment {payment_id} not found"
        )

    event = payment_confirmed(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        payment_id=payment_id,
        transaction_id=request.transaction_id,
        amount=request.amount,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/close", response_model=OrderResponse)
async def close_order(
        order_id: str,
        ledger: EventLedger = Depends(get_ledger),
):
    """Close an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already closed"
        )

    if order.status == "voided":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot close a voided order"
        )

    if order.balance_due > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order has balance due: ${order.balance_due:.2f}"
        )

    event = order_closed(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        total=order.total,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


@router.post("/{order_id}/void", response_model=OrderResponse)
async def void_order(
        order_id: str,
        request: VoidOrderRequest,
        ledger: EventLedger = Depends(get_ledger),
):
    """Void an order."""
    order = await get_order_or_404(ledger, order_id)

    if order.status == "voided":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already voided"
        )

    if order.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot void a closed order"
        )

    event = order_voided(
        terminal_id=settings.terminal_id,
        order_id=order_id,
        reason=request.reason,
        approved_by=request.approved_by,
    )
    await ledger.append(event)

    order = await get_order_or_404(ledger, order_id)
    return OrderResponse.from_order(order)


# =============================================================================
# CATEGORY → PRINTER ROLE MAPPING
# =============================================================================

CATEGORY_ROLE_MAP = {
    "food": "kitchen",
    "appetizer": "kitchen",
    "entree": "kitchen",
    "dessert": "kitchen",
    "side": "kitchen",
    "beverage": "bar",
    "beer": "bar",
    "wine": "bar",
    "cocktail": "bar",
    "spirit": "bar",
}


def _category_to_role(category: Optional[str]) -> str:
    """Map item category to printer role. Defaults to kitchen."""
    if not category:
        return "kitchen"
    return CATEGORY_ROLE_MAP.get(category.lower(), "kitchen")


# =============================================================================
# SEND TO KITCHEN
# =============================================================================

class SentItemResponse(BaseModel):
    item_id: str
    name: str
    category: Optional[str]
    seat_number: Optional[int]


class SendResponse(BaseModel):
    sent_count: int
    items: list[SentItemResponse]


@router.post("/{order_id}/send", response_model=SendResponse)
async def send_order(
        order_id: str,
        ledger: EventLedger = Depends(get_ledger),
        printer_manager: Optional[PrinterManager] = Depends(get_printer_manager),
):
    """Send unsent items to kitchen/bar printers."""
    order = await get_order_or_404(ledger, order_id)

    if order.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot send items on {order.status} order"
        )

    unsent = [item for item in order.items if not item.sent]

    if not unsent:
        return SendResponse(sent_count=0, items=[])

    sent_at = datetime.now(timezone.utc).isoformat()
    sent_items = []

    for item in unsent:
        event = item_sent(
            terminal_id=settings.terminal_id,
            order_id=order_id,
            item_id=item.item_id,
            name=item.name,
            seat_number=item.seat_number,
            category=item.category,
            sent_at=sent_at,
        )
        await ledger.append(event)
        sent_items.append(SentItemResponse(
            item_id=item.item_id,
            name=item.name,
            category=item.category,
            seat_number=item.seat_number,
        ))

    # --- Bridge to printer system ---
    if printer_manager:
        try:
            items_by_role: dict[str, list] = {}
            for item in unsent:
                role = _category_to_role(item.category)
                items_by_role.setdefault(role, []).append(item)

            for role, role_items in items_by_role.items():
                body_lines = []
                for item in role_items:
                    seat_prefix = f"S{item.seat_number} " if item.seat_number else ""
                    qty = f"{item.quantity}x " if item.quantity > 1 else ""
                    body_lines.append(f"{seat_prefix}{qty}{item.name}")
                    if item.notes:
                        body_lines.append(f"  ** {item.notes}")

                job = PrintJob(
                    order_id=order_id,
                    job_type=PrintJobType.KITCHEN_TICKET,
                    target_role=role,
                    terminal_id=settings.terminal_id,
                    content=PrintJobContent(
                        header_lines=[f"Order: {order_id}", f"Table: {order.table or 'N/A'}"],
                        body_lines=body_lines,
                    ),
                )
                await printer_manager.submit_job(job)
        except Exception:
            logger.exception(f"Printer failed for order {order_id} — send events already recorded")

    return SendResponse(sent_count=len(sent_items), items=sent_items)


# =============================================================================
# CLOSE BATCH
# =============================================================================

@router.post("/close-batch")
async def close_batch(ledger: EventLedger = Depends(get_ledger)):
    """Close all open orders and record a batch.closed event."""
    open_ids = await get_open_orders(ledger)
    closed_count = 0

    for oid in open_ids:
        events = await ledger.get_events_by_correlation(oid)
        order = project_order(events)
        if order and order.status == "open":
            evt = order_closed(
                terminal_id=settings.terminal_id,
                order_id=oid,
                total=order.total,
            )
            await ledger.append(evt)
            closed_count += 1

    batch_evt = create_event(
        event_type=EventType.BATCH_CLOSED,
        terminal_id=settings.terminal_id,
        payload={"order_count": closed_count},
    )
    await ledger.append(batch_evt)

    return {"order_count": closed_count}
