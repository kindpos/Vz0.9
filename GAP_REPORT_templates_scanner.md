# Gap Report: Kitchen/Receipt Templates & Network Scanner

**Date**: 2026-03-27
**Verified by**: Automated analysis + test execution

## Context
Gap analysis of the template and scanner subsystems, verified against live test runs. Guides Phase 2 completion work.

---

## Verification Results (live run)

| Check | Result |
|-------|--------|
| Backend tests (standard CI) | **17/17 passed** (`pytest --ignore=tests/test_payment_manager.py -k "not health_check"`) |
| Printer system tests | **15/16 passed** (`test_health_check` excluded by CI filter; has assertion typo) |
| Scanner import | **OK** (`from shared.scanner.printer_detector import PrinterDiscovery`) |
| `python-nmap` module | **Not installed** — confirms gap; scanner falls back to socket scan |
| Template imports | **All 4 templates import OK** |
| DeliveryKitchenTemplate.render() | Returns fixture data (list of 12 commands) — **stub confirmed** |
| DriverReceiptTemplate.render() | Returns fixture data (list of 17 commands) — **stub confirmed** |

---

## 1. KITCHEN & RECEIPT TEMPLATES

### Template Status
| Template | File | Status |
|----------|------|--------|
| GuestReceiptTemplate | `backend/app/printing/templates/guest_receipt.py` | **Complete** — header, items, tax, tip suggestions, reprint markers, copy types |
| KitchenTicketTemplate | `backend/app/printing/templates/kitchen_ticket.py` | **Partial (50%)** — has order type banner + items + allergens, but does NOT follow the 5-zone spec from OPUS_NOTES_v3.md (missing Zone 2 context line, Zone 3 item consolidation/inline allergen flags, Zone 4 alert block with inverted bars, Zone 5 footer with ticket X of Y) |
| CharTestTemplate | `backend/app/printing/templates/char_test_template.py` | **Complete** — hardware character set verification |
| DeliveryKitchenTemplate | `backend/app/printing/templates/delivery_kitchen.py` | **Stub** — returns fixture data only |
| DriverReceiptTemplate | `backend/app/printing/templates/driver_receipt.py` | **Stub** — returns fixture data only |

### Supporting Infrastructure
| Component | File | Status |
|-----------|------|--------|
| ESCPOSFormatter | `backend/app/printing/escpos_formatter.py` | **Partial** — has text/alignment/bold/double_width/feed/divider/cut. Missing: red/black color, reverse/inverted print, double-height, font selection (Font A/B) |
| PrintJobQueue | `backend/app/printing/print_queue.py` | **Complete** — SQLite-based with retry/dismiss |
| Template Fixtures (JSON) | `backend/app/printing/fixtures/*.json` | **Complete** — 8 fixture files |
| BasePrinter interface | `backend/app/core/adapters/base_printer.py` | **Complete** — all 6 abstract methods |
| MockThermalPrinter | `backend/app/core/adapters/mock_thermal.py` | **Complete** — full simulation with failure modes |
| MockImpactPrinter | `backend/app/core/adapters/mock_impact.py` | **Complete** — uppercase rendering, RUSH emphasis |
| PrinterManager | `backend/app/core/adapters/printer_manager.py` | **Complete** — retry, fallback, double-print prevention, event sourcing |
| Test Suite | `backend/tests/test_printer_system.py` | **15/16 passing** (health_check excluded by CI) |

### Critical Gaps in Template Pipeline
1. **PrintContextBuilder** (`backend/app/services/print_context_builder.py`) — all `build_*_context()` methods are stubs/TODOs. This blocks the entire route → template → printer pipeline.
2. **Printing Routes** (`backend/app/api/routes/printing.py`) — endpoints defined but use placeholder MACs ("DEFAULT_RECEIPT", "DEFAULT_KITCHEN") and don't wire template rendering → ESCPOSFormatter → socket.
3. **Real Hardware Adapters** — only mocks exist. No EpsonThermalAdapter or StarImpactAdapter.
4. **PrinterManager not connected to Routes** — PrinterManager manages printers; routes use PrintJobQueue; these two aren't integrated.

---

## 2. NETWORK SCANNER

### Implemented
| Feature | File | Notes |
|---------|------|-------|
| Port scanning (9100/515/631) | `shared/scanner/printer_detector.py` | nmap primary, pure-Python socket fallback |
| Network utilities (ARP, ping, DNS) | `shared/scanner/printer_detector.py` | Cross-platform MAC lookup, response time, hostname |
| MAC manufacturer lookup | `shared/scanner/printer_detector.py` | Curated OUI table (Epson, Star, Bixolon, Citizen, Zebra, HP, Brother) |
| API: discover-printers | `backend/app/api/routes/hardware.py` | `POST /api/v1/hardware/discover-printers` — SSE streaming |
| API: test-print | `backend/app/api/routes/hardware.py` | `POST /api/v1/hardware/test-print` — raw TCP socket |
| CLI scanner tool | `components/overseer/scan_test.py` | Standalone with JSON export, progress callbacks |
| Dejavoo payment probe | `scripts/dejavoo_probe.py` | Standalone connectivity test |

### Stubbed (NotImplementedError)
| Feature | Location | Notes |
|---------|----------|-------|
| mDNS/Bonjour discovery | `printer_detector.py` ~line 715 | No `zeroconf` dependency |
| SNMP discovery | `printer_detector.py` ~line 719 | No `pysnmp` dependency |
| USB device discovery | `printer_detector.py` ~line 723 | No `pyusb` dependency |

### Missing Entirely
| Feature | Impact |
|---------|--------|
| Payment terminal auto-discovery | Only manual registration — no network scan for Dejavoo/Square |
| Scanner configuration UI | Frontend hardware workspace shows "Build in progress" |
| Device persistence | Discovered printers exist only in memory — no DB storage |
| CRUD APIs for devices | No GET/POST/PUT/DELETE for `/hardware/printers` or `/hardware/payment-devices` |
| `python-nmap` in requirements.txt | Used but not listed — confirmed missing via import test |

### Known Issues
1. `hardware.py` imports `from shared.scanner.printer_detector` — requires `shared/` on PYTHONPATH
2. Test-print endpoint uses raw socket without timeout — can hang on unresponsive printer
3. No scan result pagination — large subnet scans could return excessive results

---

## 3. SUMMARY SCORECARD

| Area | Completion | Key Blocker |
|------|-----------|-------------|
| Kitchen ticket template | **50%** | Not 5-zone spec compliant; DeliveryKitchenTemplate is a stub |
| Guest receipt template | **95%** | Complete, but route integration missing |
| Template → Printer pipeline | **40%** | PrintContextBuilder stubbed, routes not wired |
| Network scanner (printers) | **70%** | Port scan works; mDNS/SNMP/USB not implemented |
| Network scanner (payment) | **10%** | Only standalone probe script |
| Scanner UI | **5%** | Frontend skeleton only |
| Device persistence/CRUD | **0%** | Not started |

---

## 4. Recommended Implementation Phases

### Phase A — Wire the template pipeline (highest impact)
1. Implement `PrintContextBuilder` methods to project ledger events to template context
2. Connect printing routes to template rendering → ESCPOSFormatter → PrinterManager
3. Replace placeholder printer MACs with actual device lookup

### Phase B — Kitchen ticket 5-zone compliance + ESC/POS formatter
1. Rewrite `KitchenTicketTemplate` to follow 5-zone spec in OPUS_NOTES_v3.md
2. Implement `DeliveryKitchenTemplate` with delivery-specific fields
3. Add ESC/POS formatter advanced features: color, reverse print, double-height, font selection (reference: `receipt_test.py`)

### Phase C — Scanner hardening
1. Add `python-nmap` to requirements.txt (or document as optional)
2. Add timeout handling to test-print endpoint
3. Add scan result pagination/limits

### Phase D — Scanner expansion (lower priority)
1. Implement mDNS discovery (add `zeroconf` dependency)
2. Build device persistence layer (integrate with EventLedger)
3. Build scanner UI in Overseer hardware workspace
4. Add payment terminal auto-discovery
