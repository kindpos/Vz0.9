# OPUS_NOTES_v3.md — KINDpos v0.9 Backend
## Handoff to Junie — Phase 1 Complete, Phase 2 Ready

*Last updated: 2026-03-25*
*KINDpos — Nice. Dependable. Yours.*

---

## PROJECT CONTEXT

KINDpos is a **local-first, event-sourced point-of-sale system** for premium restaurants. It runs on a Raspberry Pi 5, uses SQLite as its immutable event ledger, and communicates with a React frontend via FastAPI. The guiding philosophy:

- **No cloud dependency** — offline is a first-class citizen, not a fallback
- **Immutable ledger** — every dollar, every action is an event that is never deleted or modified
- **2dp precision enforcement** — money values are normalized at the gate before entering the ledger
- **Every dollar tracked** — even cash payments and failed tip adjustments have a complete audit trail

The project lives at: `C:\Users\bgkd2\PycharmProjects\KINDpos_vz0.9\`

The backend lives at: `backend\app\core\`

---

## PHASE 1 STATUS: ✅ COMPLETE

All 18 tests in `test_payment_manager.py` are now passing.

```
pytest tests/test_payment_manager.py -v
18 passed in 2.06s
```

### What was actually changed (do not re-fix these):

**`backend\app\core\adapters\mock_payment_device.py`** — heavily modified:
- Fixed import: `CardEntryMethod` → `EntryMethod` (was never defined, only `EntryMethod` exists in `base_payment.py`)
- Rewrote `__init__` — removed broken `super().__init__(config)` (base has no `__init__`), replaced with explicit initialization of `_config`, `_status`, `_connected`, `_current_transaction_id`, `name`, `is_busy`
- Fixed `connect()` signature to accept `config: Optional[PaymentDeviceConfig] = None` (required by ABC)
- Fixed `cancel_transaction()` return type from `PaymentResult` → `bool` (required by ABC)
- Added all 7 missing abstract method implementations: `status` property, `config` property, `initiate_sale`, `initiate_refund`, `initiate_void`, `close_batch`, `get_capabilities`, `get_device_info`
- Added `_to_transaction_result()` bridge helper (translates business-layer `PaymentResult` → device-layer `TransactionResult`)
- Guarded `tip_amount` / `total_with_tip` access in `_render_terminal_display` (uses `getattr` so it works with both `PaymentRequest` and `TransactionRequest`)
- Removed `EntryMethod.UNKNOWN` reference (does not exist in the enum)

**`backend\app\core\adapters\payment_manager.py`** — three fixes:
- `_emit_event`: pass `event_type` enum directly (was converting to string prematurely, causing `.value` to fail)
- `_emit_event`: `event_id=str(uuid.uuid4())` instead of `event_id=None` (SQLite NOT NULL constraint)
- `_emit_event`: `datetime.utcnow()` → `datetime.now(datetime.UTC)` (Python 3.12 deprecation — optional but clean)

**`backend\app\core\adapters\base_payment.py`** — one section changed:
- `PaymentEventTypes` enum values remapped to match strings already present in the core `EventType` enum so `event_ledger._row_to_event()` can deserialize them without a `ValueError`. The mapping is:

```python
DEVICE_REGISTERED    = "PAYMENT_DEVICE_REGISTERED"
DEVICE_UNREGISTERED  = "PAYMENT_DEVICE_DISCONNECTED"
PAYMENT_INITIATED    = "payment.initiated"          # already matched
PAYMENT_APPROVED     = "PAYMENT_APPROVED"
PAYMENT_DECLINED     = "payment.failed"
PAYMENT_TIMED_OUT    = "payment.timeout"
PAYMENT_ERROR        = "PAYMENT_ERROR"
PAYMENT_CANCELLED    = "payment.cancelled"
DUPLICATE_BLOCKED    = "DUPLICATE_PAYMENT_BLOCKED"
TIP_ADDED            = "TIP_ADDED"
TIP_ADJUST_CONFIRMED = "TIP_ADJUST_CONFIRMED"
TIP_ADJUST_FAILED    = "TIP_ADJUST_FAILED"
PAYMENT_REFUNDED     = "PAYMENT_REFUNDED"
PAYMENT_VOIDED       = "payment.voided"
SPLIT_STARTED        = "SPLIT_STARTED"
SPLIT_PAYMENT_COMPLETED = "SPLIT_PAYMENT_COMPLETED"
SPLIT_COMPLETED      = "SPLIT_COMPLETED"
```

---

## SYSTEM ARCHITECTURE OVERVIEW

```
backend/
├── app/
│   ├── core/
│   │   ├── event_ledger.py          # Immutable SQLite ledger — source of truth
│   │   ├── events.py                # EventType enum + enforce_money_precision() gate
│   │   ├── adapters/
│   │   │   ├── base_payment.py      # Abstract device contract + all payment models/enums
│   │   │   ├── payment_manager.py   # The Brain — idempotency, routing, failover, ledger events
│   │   │   ├── mock_payment_device.py  # Simulated terminal for testing (all scenarios)
│   │   │   └── dejavoo/             # Real hardware adapter (Dejavoo P8 terminal)
│   │   ├── printer/
│   │   │   ├── printer_manager.py   # PrinterManager — role routing, retry, failover
│   │   │   └── [templates]          # Receipt, kitchen ticket, guest check templates
│   │   └── reporting/
│   │       ├── queries.py           # SQL aggregation layer over event ledger
│   │       ├── reports.py           # Report composers with Show Your Work
│   │       └── bookkeeper.py        # Double-entry journal export (CSV/IIF/Xero)
│   └── api/
│       └── [FastAPI routers]
└── tests/
    ├── test_event_ledger.py         # Ledger integrity tests
    ├── test_payment_manager.py      # ✅ 18/18 passing
    └── test_printer_system.py       # Printer system tests (require pytest-asyncio)
```

### Key architectural rules Junie must respect:
1. **Never modify the event ledger schema** — events are immutable; existing event types cannot be renamed
2. **Money always goes through `enforce_money_precision()`** before entering the ledger
3. **`PaymentEventTypes` values must match `EventType` enum strings** — if you add a new payment event type, it must exist in the core `EventType` enum or the ledger will refuse to deserialize it
4. **`MockPaymentDevice` is the test double** — real device adapters (Dejavoo) are separate. Never modify mock behavior to match broken production code; fix the production code
5. **`get_payment_summary()` is synchronous** — the tests call it without `await`; do not make it async

---

## THE PAYMENT SYSTEM — HOW IT WORKS

The payment layer has two distinct layers that bridge into each other:

**Device Layer** — `TransactionRequest` / `TransactionResult`
Used by hardware adapters. `initiate_sale()`, `initiate_refund()`, `initiate_void()` all take `TransactionRequest` and return `TransactionResult`.

**Business Layer** — `PaymentRequest` / `PaymentResult`
Used by `PaymentManager` and the terminal UI. `process_payment()`, `process_refund()`, `process_void()` take `PaymentRequest` and return `PaymentResult`.

`MockPaymentDevice` bridges them via `_to_transaction_result()`. The bridge methods (`initiate_sale` etc.) translate `TransactionRequest` → `PaymentRequest`, delegate to the business-layer methods (`initiate_payment`, `refund`, `void`), then convert back.

**Idempotency:** `PaymentManager` checks the ledger for a prior `PAYMENT_APPROVED` event with the same `payment_id` before processing. This is why ledger writes must succeed — if `_emit_event` silently fails, idempotency breaks.

**Failover:** Device errors (`device_offline`, `error`, `device_disconnected`) trigger failover to the next registered device. Declines do NOT trigger failover.

---

## THE PRINTER SYSTEM — WHAT EXISTS

The printer system lives at `backend\app\core\printer\`. Key behaviors:

- **Role-based routing** — items route by category (Drinks → bar printer, Food → kitchen, etc.)
- **Fallback printers** — if primary printer is offline, job reroutes to fallback with `PRINT_REROUTED` event; ticket prints a `REROUTED FROM: {original}` notice
- **Retry queue** — failed jobs are queued and retried; the order is never lost
- **Print job events** fire into the ledger: `PRINT_JOB_QUEUED`, `PRINT_JOB_SENT`, `PRINT_JOB_COMPLETED`, `PRINT_JOB_FAILED`, `PRINT_JOB_RETRIED`, `PRINT_REROUTED`
- **ESC/POS protocol** via `python-escpos` library (see command reference below)
- **Red ink fallback** — printer adapter reports `supports_red` capability at config time; formatting engine renders red as bold-inverted on non-red printers. Meaning is preserved regardless of hardware.
- **Shared formatting engine** — kitchen tickets and customer receipts use the same pipeline: Event Ledger → Formatting Engine → Template Selection → Printer Adapter → Physical Printer. Only the template and text field selection differ.

---

### KITCHEN TICKET SPEC — Five-Zone Model (v1.1)

All kitchen tickets follow a fixed five-zone layout, top to bottom, always in this order:

```
Zone 1  Header Block    — Check #, Order Type, Table/Name, Time    (double-height/width, read from 4 feet)
Zone 2  Context Line    — Server, Seats, Order Source               (normal bold, pipe-separated)
Zone 3  Item Block      — Items, quantities, modifiers, alerts      (normal weight)
Zone 4  Alert Block     — Allergy summary strip, RUSH, VIP flags    (inverted / red)
Zone 5  Footer          — Terminal ID, Ticket X of Y, ticket type   (small font)
```

#### Zone 1 — Header Block
- **Line 1 — Check Number**: `CHECK {number}` — double-height, double-width, bold, centered. Always the largest element.
- **Line 2 — Order Type**:
  - Dine-in: `TABLE {number} — DINE IN`
  - Togo: `TOGO — {Customer Name}`
  - Delivery: `DELIVERY — {Customer Name}`
- **Line 3 (Togo/Delivery only)**: `Pickup: {time}`
- **Line 4 — Time Ordered**: Always the event ledger time the order was *placed*, NOT the print time. This is a core architectural guarantee of event sourcing.

#### Zone 2 — Context Line
Single line, pipe-separated. Fields in order:
- `Server: {name}` (bold) — always present
- `Seats: 1,2,3` or `Seat: 1` — present when seats assigned
- Order source — present when not standard walk-up POS entry (values: Walk-up, Phone, Online, Kiosk)

Examples: `Server: Jake | Seats: 1,2 | Walk-up` / `Server: Alex | Phone` / `Server: Maria | Seat: 1`

#### Zone 3 — Item Block
- **Quantity-first**: `{qty}x {Item Name}` — always, even for 1x
- **Item names**: bold, normal size
- **Modifiers**: 6-space indent below parent item
- **Modifier prefix rendering**:

| Modifier Type | Default Prefix | Rendering (red printer) | Rendering (no-red fallback) |
|---|---|---|---|
| Remove | `NO` | RED text | BOLD text |
| Add | `ADD` | RED text | BOLD text |
| Substitute | `SUB` | RED text | BOLD text |
| Extra | `EXTRA` | RED text | BOLD text |
| Light | `LIGHT` | RED text | BOLD text |
| Side | `SIDE` | RED text | BOLD text |
| On the Side | `OTS` | RED text | BOLD text |

Prefixes are **operator-configurable** in the Overseer (some kitchens say `86` instead of `NO`). The rendering formula: `[{prefix} in red/bold] + [{print text} in black/normal]`

- **Special instructions**: Italic or quoted, below modifiers. Example: `"Extra crispy please"`
- **Item separators**: Dashed line (`■■■■■■`) between each item group
- **Inline allergy flag**: Prints immediately below the item's modifier list when that item has an allergy flag. Format: `■■ {ALLERGY TYPE} ALLERGY ■■` — red inverted bar (or bold inverted if no red)

**Consolidation rule**: Identical items with identical modifiers (order-independent match) always collapse into a single `{qty}x` line. Items with different modifiers stay separate. Consolidation happens at render time — the event ledger still records each `item.added` individually.

#### Zone 4 — Alert Block

| Alert Type | Format | Rendering |
|---|---|---|
| ALLERGY (summary strip) | `■■ ALLERGY: {TYPE} ■■` | Full-width inverted bar — red or bold. Reserved EXCLUSIVELY for allergy/safety. |
| RUSH | `** RUSH **` | Bold, red if available. NOT inverted. |
| VIP | `** VIP TABLE **` | Bold, red if available. NOT inverted. |
| 86 WARNING | `** 86 {ITEM} AFTER THIS **` | Bold, red if available. NOT inverted. |

The allergy summary strip only appears when at least one item on the ticket has an allergy flag. It acts as a safety net even if the cook doesn't read inline flags on individual items. Inverted bar is **reserved exclusively for allergy/safety** — never used for RUSH or VIP, to prevent confusion.

#### Zone 5 — Footer
Small font (ESC/POS font B). Fields: `Terminal: {ID} | Ticket {X} of {Y}` and ticket type label on next line. Printed time is deliberately omitted — only Zone 1's order-placed time appears.

---

### TICKET TYPES

| Type | Header Addition | Item Display | Footer Label | Ledger Event |
|---|---|---|---|---|
| **ORIGINAL** | None | All items | `ORIGINAL` | `TICKET_PRINTED` |
| **REPRINT** | `REPRINT` label in bold below check # | All items (identical to original) | `*** REPRINT ***` | `TICKET_REPRINTED` |
| **VOID** | `■■ VOID ■■` in red/bold inverted bar | Only voided items, with `[VOID]` prefix or strikethrough | `*** VOID ***` | `ITEM_VOIDED` + `VOID_TICKET_PRINTED` |
| **REFIRE** | `** REFIRE **` in bold/red (NOT inverted) | Only refired items + optional reason line | `*** REFIRE ***` | `ITEM_REFIRED` |

VOID = stop making it. REFIRE = make it again. These must be visually unmistakable and are never confused.

---

### CUSTOMER RECEIPT SPEC

Same formatting engine and printer adapter as kitchen tickets. Pipeline is identical — only the template differs.

Key difference: items have two text fields — `kitchen_text` (for kitchen tickets, may be abbreviated or in kitchen shorthand) and `customer_text` (for receipts, customer-friendly language). Same event, different audience. If `customer_text` is empty, falls back to the item's default name.

**Receipt layout (top to bottom):**

| Zone | Content | Formatting |
|---|---|---|
| Header | Restaurant name, address, phone, website, optional logo | Centered, normal |
| Check ID | `CHECK {number}` | Bold, prominent — first thing visible |
| Order Info | Order type, table/customer name, date, time, server name | Normal, left-aligned |
| Items | Itemized list: `{qty}x {item name}` left / `${price}` right, modifiers below using `customer_text` | Left-aligned names, right-aligned prices |
| Totals | Subtotal, tax (itemized or bundled per operator config), discounts, **bold TOTAL** | Right-aligned amounts |
| Payment | Payment method, last 4 of card, auth code, tip line, signature line | Normal |
| Footer | Thank-you message, promo text, social handles, return policy — all operator-configurable | Centered, small |

The `CHECK {number}` appears on kitchen tickets, customer receipt, bookkeeper export, and event ledger — one number ties everything together for dispute resolution, refires, chargebacks.

---

### ESC/POS COMMAND REFERENCE

| Command | Hex | Purpose | Used For |
|---|---|---|---|
| `ESC E n` | `1B 45 n` | Bold on (n=1) / off (n=0) | Item names, prefixes (fallback) |
| `ESC ! n` | `1B 21 n` | Print mode: combine bold, double-H/W | Zone 1 header |
| `GS ! n` | `1D 21 n` | Character size (height × width) | Check number scaling |
| `ESC r n` | `1B 72 n` | Color: black (n=0) / red (n=1) | Prefixes, alerts |
| `GS B n` | `1D 42 n` | Reverse print (white on black) | Allergy bars, VOID bar |
| `ESC - n` | `1B 2D n` | Underline on/off | Item separators |
| `ESC d n` | `1B 64 n` | Print and feed n lines | Zone spacing |
| `GS V m` | `1D 56 m` | Paper cut (full/partial) | End of ticket |
| `ESC a n` | `1B 61 n` | Justification (0=L, 1=C, 2=R) | Check # centering |

The formatting engine produces an abstract ticket model (zones, lines, flags). The printer adapter translates this into ESC/POS byte sequences based on the printer's reported capabilities. If a new printer protocol is needed, only the adapter changes — the formatting engine is untouched.

---

### V1 SCOPE vs FUTURE (Limoncello pilot)

**V1 target markets**: Food trucks, dive bars, simple kitchen operations.

**NOT in v1** (designed into architecture, implemented for full-service pilot):
- Hold/Fire coursing (orders assigned to courses, only active course fires)
- Modifier split routing (base item → cold line, modifier → hot line, expo gets full ticket)
- Scheduled reroute rules (e.g., Thursdays 5–10pm, Tavern items route to Attic Bar printer)
- Delivery duplicate tickets (one for kitchen, one for bag)

---

## THE REPORTING SYSTEM — WHAT EXISTS (KINDpos OG → v0.9)

This is fully built and tested in the reporting layer. Junie should not need to touch it for Phase 2, but needs to know it exists:

- **8 template reports:** Daypart Analysis, Product Mix / Menu Engineering (Boston Matrix: Stars/Plowhorses/Puzzles/Dogs), Server Leaderboard, Daily Flash, Week-over-Week, Hourly Heatmap, Waste Tracker, Labor vs Sales
- **Bookkeeper export:** Double-entry journal entries balanced to the penny, in CSV / QuickBooks IIF / Xero format
- **Show Your Work math:** every number is drillable — tap any total to see the equation behind it
- **200+ tests passing** in the OG codebase; migrated to v0.9

---

## PHASE 2 OBJECTIVES (Next tasks for Junie)

Phase 2 focus is getting `pytest -v` to return **all three test suites passing** with zero failures and zero skipped:

```
tests/test_event_ledger.py       ← verify still passing
tests/test_payment_manager.py    ← ✅ 18/18 already passing
tests/test_printer_system.py     ← needs investigation
```

### Step 1: Run the full test suite and assess

```powershell
cd backend
pytest -v
```

Document every failure. Do not fix anything until you understand all failures.

### Step 2: Fix `test_printer_system.py` failures

The printer tests require `pytest-asyncio`. If they are still being skipped or failing:

1. Confirm `pytest-asyncio` is installed: `pip install pytest-asyncio`
2. Confirm `pytest.ini` or `pyproject.toml` has `asyncio_mode = auto` (or tests are marked `@pytest.mark.asyncio`)
3. Read `test_printer_system.py` fully before changing any production code
4. Fix production code (`printer_manager.py`, templates) to satisfy the tests — do NOT change the tests

### Step 3: Deprecation warnings cleanup (optional, low priority)

- `datetime.utcnow()` → `datetime.now(datetime.UTC)` in `payment_manager.py` line 575
- Pydantic class-based `config` → `ConfigDict` in any model still using the old pattern

---

## IMPORTANT CONSTRAINTS — READ BEFORE TOUCHING ANYTHING

- **Do NOT rename or delete any test** — tests define the contract
- **Do NOT change test assertions** — fix production code to match
- **Do NOT modify `test_payment_manager.py`** — it is passing; changes risk breaking it
- **Do NOT change `PaymentEventTypes` values** without ensuring the new value exists in the core `EventType` enum — this will cause silent ledger write failures
- **Do NOT make `get_payment_summary()` async** — it is called without `await` in the tests
- **`mock_payment_device.py` is now the correct reference implementation** of the device adapter interface — use it as a guide when building the real Dejavoo adapter
- **Money values must always pass through `enforce_money_precision()`** before entering the ledger

---

## DEPENDENCY NOTES

```powershell
pip install -r requirements.txt
pip install pytest-asyncio   # required for async tests
```

Python version: 3.12.3
Pydantic version: V2 (use `ConfigDict`, not class-based `config`)
pytest version: 7.4.4
asyncio mode: STRICT (set in pytest config)

---

## FILE MANIFEST — WHAT JUNIE SHOULD AND SHOULD NOT TOUCH

| File | Status | Touch? |
|---|---|---|
| `adapters/base_payment.py` | ✅ Fixed | Only to add new EventType mappings |
| `adapters/payment_manager.py` | ✅ Fixed | Only for Phase 2 features |
| `adapters/mock_payment_device.py` | ✅ Fixed | No — reference only |
| `adapters/dejavoo/` | Untouched | Phase 3+ |
| `printer/printer_manager.py` | Unknown state | Phase 2 investigation |
| `printer/[templates]` | Unknown state | Phase 2 investigation |
| `event_ledger.py` | Working | Do not modify |
| `events.py` | Working | Do not modify |
| `reporting/` | Working | Do not modify |
| `tests/test_payment_manager.py` | ✅ 18/18 passing | Do NOT modify |
| `tests/test_event_ledger.py` | Unknown | Do not modify |
| `tests/test_printer_system.py` | Unknown state | Do not modify |

---

*KINDpos — Nice. Dependable. Yours.*