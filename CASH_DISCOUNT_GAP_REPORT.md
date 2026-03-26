# Cash Discount Gap Report

**Date:** 2026-03-26
**Scope:** Gap analysis for implementing configurable cash discount (e.g. 3.5%)

---

## Q1: Where is CFG.CASH_DISC (3.5%) defined and how does it flow through the payment API?

**Answer: It does not exist.**

- No reference to `CASH_DISC`, `cash_discount`, or `0.035` anywhere in the codebase.
- `backend/app/config.py` has `tax_rate: 0.07`, `terminal_id`, `database_path` — no cash discount config.
- `CCProcessingRate` model (`backend/app/models/config_events.py`) only carries `rate_percent: 2.9` and `per_transaction_fee: 0.30` for credit card processing.
- The generic discount events (`DISCOUNT_REQUESTED`, `DISCOUNT_APPROVED`, `DISCOUNT_REJECTED`) are order-level, manual manager discounts — not automatic method-based discounts.

**Gap: The entire cash discount concept is missing — config, event type, projection, and calculation logic.**

---

## Q2: Does GET /config/store have a `cash_discount_rate` field? Does any event carry it?

**Answer: No on both counts.**

`GET /config/store` (`backend/app/api/routes/config.py`) returns a `StoreConfigBundle` with 6 sections:

| Section | Fields |
|---------|--------|
| `info` | restaurant_name, address, phone, etc. |
| `tax_rules` | List of TaxRule (id, name, rate_percent, applies_to, category_id) |
| `cc_processing` | rate_percent=2.9, per_transaction_fee=0.30 |
| `operating_hours` | Dict by day (open, close, enabled) |
| `order_types` | enabled_types list |
| `auto_gratuity` | enabled, party_size_threshold, rate_percent, applies_to_order_types |

No `cash_discount` section. No `STORE_CASH_DISCOUNT_UPDATED` event type. The 8 store events are:
`STORE_INFO_UPDATED`, `STORE_CC_PROCESSING_RATE_UPDATED`, `STORE_TAX_RULE_CREATED/UPDATED/DELETED`, `STORE_OPERATING_HOURS_UPDATED`, `STORE_ORDER_TYPES_UPDATED`, `STORE_AUTO_GRATUITY_UPDATED`.

**Gap: Need new event type, new model field in StoreConfigBundle, new projection handler in StoreConfigService.**

---

## Q3: What does AddItemRequest / payment route receive for tender_type?

**Answer: `tender_type` does not exist anywhere. The system uses `method: str` at payment initiation time only.**

- **AddItemRequest** (`backend/app/api/routes/orders.py:48-57`): No payment fields at all — just menu_item_id, name, price, quantity, category, notes, seat_number.
- **InitiatePaymentRequest** (`orders.py`): Has `method: str` accepting `"card"`, `"cash"`, `"gift_card"`.
- **TransactionRequest** (`backend/app/core/adapters/base_payment.py`): Has `payment_type: PaymentType` (SALE/REFUND/VOID/AUTH_ONLY) — this is transaction type, not tender type.
- **TransactionResult**: Has `card_brand`, `last_four`, `entry_method` — no explicit payment method field.
- **"tender_type"**: Zero occurrences codebase-wide.

Payment method flow: `InitiatePaymentRequest.method` → `payment_initiated()` event payload → `Payment.method` in projection. But `payment_confirmed` and `payment_failed` events do **not** carry the method — it must be derived by replaying the corresponding `payment_initiated` event.

**Gap: No tender type at order or item level. Method only known at payment time, and only in the initiated event — not carried through to confirmation.**

---

## Summary of All Gaps

| What's needed | Current state | Key files |
|---------------|---------------|-----------|
| Cash discount rate config | Does not exist | `backend/app/models/config_events.py`, `backend/app/services/store_config_service.py` |
| Store event for cash discount | No event type | `backend/app/core/events.py` (EventType enum) |
| StoreConfigBundle field | No field | `backend/app/models/config_events.py` |
| StoreConfigService projection | No handler | `backend/app/services/store_config_service.py` |
| Config API exposure | Not in response | `backend/app/api/routes/config.py` |
| Cash discount calculation logic | Does not exist | Payment/order calculation path TBD |
| Payment method on confirmed events | Only on initiated | `backend/app/core/events.py` (`payment_confirmed()`) |
| Tender type at order level | Not tracked | `backend/app/api/routes/orders.py` |
