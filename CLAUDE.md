# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KINDpos is a local-first, event-sourced point-of-sale system for premium restaurants. It runs on a Raspberry Pi 5 with SQLite as an immutable, append-only event ledger. FastAPI serves the backend; the terminal UI is React + Vite; the manager dashboard (Overseer) is a vanilla JS PWA.

**Current status**: Phase 1 complete (payment system, 18/18 tests passing). Phase 2 in progress (Terminal UI integration, printer system).

Read `OPUS_NOTES_v3.md` for Phase 1 handoff context. Read `kindpos-junie-integration-spec.md` for Terminal UI integration roadmap.

---

## Commands

### Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Run tests (standard dev CI command)
pytest --ignore=tests/test_payment_manager.py -k "not health_check"

# Run specific test files
pytest tests/test_event_ledger.py -v
pytest tests/test_printer_system.py -v       # requires pytest-asyncio
```

### Terminal UI (React + Vite)

```bash
cd KINDpos-site/terminal
npm install
npm run dev      # http://localhost:5173 — proxies /api to localhost:8000
npm run build
npm run lint
```

### Hardware test scripts (no KINDpos deps required)

```bash
# Dejavoo P8 terminal — standalone, only requires httpx
python dejavoo_test.py                 # status check
python dejavoo_test.py --sale          # $0.01 test sale
python dejavoo_test.py --sale --void   # sale then void

# Receipt printer — pure Python socket
python receipt_test.py                 # print all receipts
python receipt_test.py --customer      # customer receipt only
python receipt_test.py --ip 10.0.0.186
```

---

## Architecture

### Event Sourcing (core invariant)

The SQLite event ledger (`backend/app/core/event_ledger.py`) is the single source of truth. All state is derived by replaying events — never written directly. Events are hash-chained for tamper detection. The DB runs in WAL mode for concurrent reads + single writer.

- ~150 event types defined in `backend/app/core/events.py` (`EventType` enum)
- Projections (`projections.py`, `menu_projection.py`) derive runtime state from ledger
- All route mutations append events; nothing else touches the DB

### Payment system (two-layer bridge)

`PaymentManager` (`adapters/payment_manager.py`) is the business layer. It handles idempotency (checks ledger for prior `PAYMENT_APPROVED` with same `payment_id`), device routing, and failover. It speaks `PaymentRequest`/`PaymentResult`.

Hardware adapters (`mock_payment_device.py`, `dejavoo_spin.py`) are the device layer. They speak `TransactionRequest`/`TransactionResult`. The bridge is the adapter's `initiate_sale()` → `process_payment()` translation.

Failover rule: device errors trigger failover to the next registered device; declines do **not** failover.

### Printer system (role-based routing)

`PrinterManager` (`adapters/printer_manager.py`) routes jobs by item category (food → kitchen printer, drinks → bar printer, etc.) with a fallback hierarchy: primary → designated fallback → same-type fallback → emergency. Failed jobs are retried up to 3 times; all attempts are logged as ledger events.

Kitchen tickets follow a five-zone spec:
1. **Header** — Check #, order type, table/name, time (double-height)
2. **Context** — Server, seats, order source (bold, pipe-separated)
3. **Items** — Quantity, item, modifiers, inline allergy flags
4. **Alerts** — Allergy summary, RUSH/VIP/86 warnings (inverted bars)
5. **Footer** — Terminal ID, ticket X of Y, ticket type (small)

Items carry two text fields: `kitchen_text` (shorthand) and `customer_text` (receipt-friendly).

### API

FastAPI routes under `/api/v1/`. CORS open to localhost:8080 and localhost:8000. All I/O is async.

Route groups: `orders`, `payment_routes`, `printing`, `menu`, `hardware`, `system`, `config`.

### Terminal UI state model

`App.jsx` owns all state: `screen`, `staff`, `order`, `payment`, `orders`, `offline`. Child screens receive handlers (`goLogin`, `goOrder`, `goPayment`, `goComplete`, `goSave`). When the API is unreachable, the UI falls back to `FALLBACK_ROSTER` and `FALLBACK_MENU` from `config.js` and shows an offline indicator in `SBar`.

---

## Data Conventions

- Employee `role_id` must be a slug: `"manager"` or `"server"` (not a UUID). `SnapshotScreen` checks `staff.role === "manager"` directly.

---

## Critical rules (do not violate)

- **Never modify the event ledger schema** — existing event types are immutable and cannot be renamed.
- **All money through `enforce_money_precision()`** before entering the ledger.
- **`PaymentEventTypes` string values must match `EventType` enum entries** — mismatches cause deserialization failures.
- **`get_payment_summary()` is synchronous** — do not make it async.
- **Do not modify tests** — they define the contract. Fix production code to match.
- **`MockPaymentDevice` is the test double** — fix broken production adapters; never bend the mock to match broken production code.
