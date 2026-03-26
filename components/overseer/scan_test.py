"""
KINDpos Printer Discovery — CLI Test Harness
==============================================
Nice. Dependable. Yours.

Standalone CLI scanner for validating printer discovery
against real hardware. Run this from the Overseer project
root to scan your network and find ESC/POS printers.

Usage:
    # Scan your network (default: 10.0.0.0/24)
    python scan_test.py

    # Scan a specific subnet
    python scan_test.py --network 192.168.1.0/24

    # Scan a single host (fast — great for testing)
    python scan_test.py --host 10.0.0.186

    # Export results to JSON
    python scan_test.py --export results.json

Requirements:
    pip install python-nmap     (optional — falls back to socket scan)
    nmap binary installed       (optional — needed for python-nmap)

File location: scan_test.py
"""

import argparse
import json
import sys
import time
from datetime import datetime

# Add the project root to path so we can import scanner
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scanner import PrinterDiscovery, DiscoveredPrinter


# =============================================================
# KINDpos CLI Theme
# =============================================================
# ANSI color codes matching the KINDpos palette:
#   Mint Green (#C6FFBB) → GREEN
#   Yellow (#FBDE42)     → YELLOW
#   Red (#FF3333)        → RED
#   Dark Grey (#333333)  → Default terminal bg

class Colors:
    """ANSI color codes for KINDpos-themed terminal output."""
    GREEN = "\033[92m"      # Mint green — success, borders
    YELLOW = "\033[93m"     # KINDpos yellow — headers, emphasis
    RED = "\033[91m"        # Alert red — errors, warnings
    CYAN = "\033[96m"       # Info — secondary data
    WHITE = "\033[97m"      # Bright white — primary text
    DIM = "\033[90m"        # Dim — metadata, timestamps
    BOLD = "\033[1m"        # Bold
    RESET = "\033[0m"       # Reset all

    @staticmethod
    def supports_color() -> bool:
        """Check if terminal supports ANSI colors."""
        if os.environ.get("NO_COLOR"):
            return False
        if sys.platform == "win32":
            # Windows 10+ supports ANSI via virtual terminal
            try:
                import ctypes
                kernel32 = ctypes.windll.kernel32
                # Enable virtual terminal processing
                kernel32.SetConsoleMode(
                    kernel32.GetStdHandle(-11), 7
                )
                return True
            except Exception:
                return False
        return hasattr(sys.stdout, "isatty") and sys.stdout.isatty()


# Disable colors if terminal doesn't support them
if not Colors.supports_color():
    for attr in ["GREEN", "YELLOW", "RED", "CYAN", "WHITE", "DIM", "BOLD", "RESET"]:
        setattr(Colors, attr, "")

C = Colors  # Shorthand


# =============================================================
# Display Helpers
# =============================================================

def print_banner():
    """Print the KINDpos scanner banner."""
    print()
    print(f"{C.GREEN}{'=' * 62}{C.RESET}")
    print(f"{C.GREEN}|{C.RESET}{C.YELLOW}{C.BOLD}  KINDpos Printer Discovery — Network Scanner{' ' * 11}{C.RESET}{C.GREEN}|{C.RESET}")
    print(f"{C.GREEN}|{C.RESET}{C.WHITE}  Nice. Dependable. Yours.{' ' * 30}{C.RESET}{C.GREEN}|{C.RESET}")
    print(f"{C.GREEN}{'=' * 62}{C.RESET}")
    print()


def print_section(title: str):
    """Print a themed section header."""
    print(f"\n{C.GREEN}{'—' * 62}{C.RESET}")
    print(f"  {C.YELLOW}{C.BOLD}{title}{C.RESET}")
    print(f"{C.GREEN}{'—' * 62}{C.RESET}")


def print_scan_config(network: str, host: str = None):
    """Print scan configuration."""
    print_section("SCAN CONFIGURATION")
    if host:
        print(f"  {C.WHITE}Target Host:{C.RESET}    {C.CYAN}{host}{C.RESET}")
        print(f"  {C.WHITE}Scan Type:{C.RESET}      Single host (direct socket probe)")
    else:
        print(f"  {C.WHITE}Target Network:{C.RESET} {C.CYAN}{network}{C.RESET}")
        print(f"  {C.WHITE}Scan Type:{C.RESET}      Subnet sweep")
    print(f"  {C.WHITE}Ports:{C.RESET}          9100 (ESC/POS), 515 (LPD), 631 (IPP)")
    print(f"  {C.WHITE}Platform:{C.RESET}       {sys.platform}")
    print(f"  {C.WHITE}Started:{C.RESET}        {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def print_progress(event_type: str, data: dict):
    """
    Progress callback — receives events from the scanner
    and renders them in the themed CLI output.

    This is the same callback pattern that the Overseer
    SSE endpoint will use — proving the interface works.
    """
    if event_type == "scan_start":
        print(f"\n  {C.GREEN}▶{C.RESET} Scan started: {C.CYAN}{data['network']}{C.RESET}")
        print(f"    Scan ID: {C.DIM}{data['scan_id']}{C.RESET}")

    elif event_type == "progress":
        style = data.get("style", "normal")
        if style == "warning":
            print(f"  {C.YELLOW}⚠{C.RESET} {data['message']}")
        else:
            print(f"  {C.DIM}  {data['message']}{C.RESET}")

    elif event_type == "host_found":
        ip = data["ip"]
        mac = data.get("mac", "unknown")
        ports = data.get("ports", [])
        ms = data.get("response_ms", 0)
        mfg = data.get("manufacturer")
        hostname = data.get("hostname")

        print()
        print(f"  {C.GREEN}✓ PRINTER FOUND!{C.RESET}")
        print(f"    {C.WHITE}IP:{C.RESET}           {C.CYAN}{ip}{C.RESET}")
        print(f"    {C.WHITE}MAC:{C.RESET}          {C.CYAN}{mac}{C.RESET}")
        if mfg:
            print(f"    {C.WHITE}Manufacturer:{C.RESET} {C.YELLOW}{mfg}{C.RESET}")
        if hostname:
            print(f"    {C.WHITE}Hostname:{C.RESET}     {C.CYAN}{hostname}{C.RESET}")
        print(f"    {C.WHITE}Open Ports:{C.RESET}   {C.CYAN}{ports}{C.RESET}")
        print(f"    {C.WHITE}Response:{C.RESET}     {C.CYAN}{ms}ms{C.RESET}")

    elif event_type == "scan_complete":
        count = data["printers_found"]
        duration = data["duration_seconds"]
        if count > 0:
            print(f"\n  {C.GREEN}■{C.RESET} Scan complete: "
                  f"{C.GREEN}{C.BOLD}{count} printer(s){C.RESET} "
                  f"found in {C.CYAN}{duration}s{C.RESET}")
        else:
            print(f"\n  {C.YELLOW}■{C.RESET} Scan complete: "
                  f"{C.YELLOW}No printers found{C.RESET} "
                  f"({C.CYAN}{duration}s{C.RESET})")

    elif event_type == "error":
        print(f"  {C.RED}✗ ERROR:{C.RESET} {data['message']}")
        if "hint" in data:
            print(f"    {C.DIM}{data['hint']}{C.RESET}")


def print_results(printers: list[DiscoveredPrinter]):
    """Print detailed results table."""
    if not printers:
        print_section("RESULTS")
        print(f"\n  {C.YELLOW}No printers discovered.{C.RESET}")
        print(f"  {C.DIM}Possible reasons:{C.RESET}")
        print(f"  {C.DIM}  • Printer is powered off or not connected to network{C.RESET}")
        print(f"  {C.DIM}  • Printer is on a different subnet{C.RESET}")
        print(f"  {C.DIM}  • Port 9100 is blocked by firewall{C.RESET}")
        print(f"  {C.DIM}  • Try: python scan_test.py --host <printer-ip>{C.RESET}")
        return

    print_section(f"DISCOVERED PRINTERS ({len(printers)})")

    for i, printer in enumerate(printers, 1):
        print(f"\n  {C.GREEN}{'─' * 50}{C.RESET}")
        print(f"  {C.YELLOW}{C.BOLD}Printer #{i}{C.RESET}")
        print(f"  {C.GREEN}{'─' * 50}{C.RESET}")
        print(f"    {C.WHITE}IP Address:{C.RESET}    {C.CYAN}{printer.ip_address}{C.RESET}")
        print(f"    {C.WHITE}MAC Address:{C.RESET}   {C.CYAN}{printer.mac_address}{C.RESET}")

        if printer.hostname:
            print(f"    {C.WHITE}Hostname:{C.RESET}      {C.CYAN}{printer.hostname}{C.RESET}")

        if printer.manufacturer:
            print(f"    {C.WHITE}Manufacturer:{C.RESET}  {C.YELLOW}{printer.manufacturer}{C.RESET}")

        if printer.model:
            print(f"    {C.WHITE}Model:{C.RESET}         {C.YELLOW}{printer.model}{C.RESET}")

        print(f"    {C.WHITE}Protocol:{C.RESET}      {C.CYAN}{printer.protocol}{C.RESET}")
        print(f"    {C.WHITE}Open Ports:{C.RESET}    {C.CYAN}{printer.open_ports}{C.RESET}")
        print(f"    {C.WHITE}Response:{C.RESET}      {C.CYAN}{printer.response_time_ms:.1f}ms{C.RESET}")
        print(f"    {C.WHITE}Discovered:{C.RESET}    {C.DIM}{printer.discovered_at.strftime('%H:%M:%S')}{C.RESET}")
        print(f"    {C.WHITE}Method:{C.RESET}        {C.DIM}{printer.discovery_method}{C.RESET}")


def print_config_export(printers: list[DiscoveredPrinter]):
    """Print PrinterConfig-compatible export for each printer."""
    if not printers:
        return

    print_section("PRINTERCONFIG EXPORT PREVIEW")
    print(f"  {C.DIM}What KINDpos terminal will receive after operator labels in Overseer:{C.RESET}")

    for i, printer in enumerate(printers, 1):
        # Simulate operator labeling for the preview
        printer.friendly_name = printer.friendly_name or f"Discovered Printer {i}"
        printer.device_subtype = printer.device_subtype or "receipt"
        printer.location_notes = printer.location_notes or "unlabeled"

        config = printer.to_printer_config_dict()

        # Strip metadata for clean display
        display_config = {k: v for k, v in config.items() if not k.startswith("_")}

        print(f"\n  {C.YELLOW}Printer #{i} → PrinterConfig:{C.RESET}")
        for key, value in display_config.items():
            print(f"    {C.WHITE}{key}:{C.RESET} {C.CYAN}{value}{C.RESET}")


def print_scan_summary(scanner: PrinterDiscovery):
    """Print the scan summary (same data the Overseer API returns)."""
    summary = scanner.get_scan_summary()

    print_section("SCAN SUMMARY")
    print(f"    {C.WHITE}Scan ID:{C.RESET}         {C.DIM}{summary['scan_id']}{C.RESET}")
    print(f"    {C.WHITE}Duration:{C.RESET}        {C.CYAN}{summary['duration_seconds']:.1f}s{C.RESET}")
    print(f"    {C.WHITE}Printers Found:{C.RESET}  {C.GREEN}{C.BOLD}{summary['printers_found']}{C.RESET}")


def print_footer(success: bool):
    """Print the closing banner."""
    print(f"\n{C.GREEN}{'=' * 62}{C.RESET}")
    if success:
        print(f"{C.GREEN}|{C.RESET}  {C.GREEN}{C.BOLD}Discovery complete.{C.RESET}{' ' * 37}{C.GREEN}|{C.RESET}")
        print(f"{C.GREEN}|{C.RESET}  {C.WHITE}Your hardware. Our brain. Their smiles.{C.RESET}{' ' * 16}{C.GREEN}|{C.RESET}")
    else:
        print(f"{C.GREEN}|{C.RESET}  {C.YELLOW}No printers found — but we'll keep looking.{C.RESET}{' ' * 11}{C.GREEN}|{C.RESET}")
        print(f"{C.GREEN}|{C.RESET}  {C.WHITE}Check connections and try again.{C.RESET}{' ' * 23}{C.GREEN}|{C.RESET}")
    print(f"{C.GREEN}|{C.RESET}  {C.DIM}Nice. Dependable. Yours.{C.RESET}{' ' * 31}{C.GREEN}|{C.RESET}")
    print(f"{C.GREEN}{'=' * 62}{C.RESET}")
    print()


# =============================================================
# Single Host Scanner
# =============================================================

def scan_single_host(host: str, scanner: PrinterDiscovery) -> list[DiscoveredPrinter]:
    """
    Scan a single host directly — no subnet sweep needed.

    Faster and more targeted than a full subnet scan.
    Perfect for validating a known printer like the Volcora.
    """
    scanner._scan_start = datetime.now()

    scanner._emit("scan_start", {
        "network": host,
        "methods": ["direct_probe"],
        "scan_id": scanner.scan_id,
    })

    scanner._emit("progress", {
        "message": f"Probing {host} for printer ports...",
        "style": "normal",
    })

    # Check all printer ports on this single host
    open_ports = []
    for port in scanner.PRINTER_PORTS.keys():
        scanner._emit("progress", {
            "message": f"  Checking port {port} ({scanner.PRINTER_PORTS[port]})...",
            "style": "normal",
        })
        if scanner._check_port(host, port, timeout=2.0):
            open_ports.append(port)
            scanner._emit("progress", {
                "message": f"  Port {port}: OPEN ✓",
                "style": "normal",
            })
        else:
            scanner._emit("progress", {
                "message": f"  Port {port}: closed",
                "style": "normal",
            })

    discovered = []

    if open_ports:
        protocol = "escpos" if 9100 in open_ports else "ipp" if 631 in open_ports else "lpd"
        mac = scanner._get_mac_address(host)
        response_time = scanner._ping_host(host)
        hostname = scanner._reverse_dns(host)
        manufacturer = scanner._lookup_mac_manufacturer(mac) if mac != "unknown" else None

        printer = DiscoveredPrinter(
            ip_address=host,
            mac_address=mac,
            hostname=hostname,
            open_ports=sorted(open_ports),
            response_time_ms=response_time,
            manufacturer=manufacturer,
            protocol=protocol,
            online_status=True,
            discovery_method="direct_probe",
            discovered_at=datetime.now(),
            scan_id=scanner.scan_id,
        )

        discovered.append(printer)

        scanner._emit("host_found", {
            "ip": host,
            "mac": mac,
            "ports": open_ports,
            "response_ms": round(response_time, 1),
            "hostname": hostname,
            "manufacturer": manufacturer,
            "index": 1,
            "total": 1,
        })
    else:
        scanner._emit("progress", {
            "message": f"No printer ports open on {host}",
            "style": "warning",
        })

    scanner.discovered_printers = discovered
    scanner._scan_end = datetime.now()
    duration = (scanner._scan_end - scanner._scan_start).total_seconds()

    scanner._emit("scan_complete", {
        "printers_found": len(discovered),
        "duration_seconds": round(duration, 1),
    })

    return discovered


# =============================================================
# Main Entry Point
# =============================================================

def main():
    """Run the KINDpos printer discovery CLI."""
    parser = argparse.ArgumentParser(
        description="KINDpos Printer Discovery — Network Scanner",
        epilog="Nice. Dependable. Yours.",
    )
    parser.add_argument(
        "--network", "-n",
        default="10.0.0.0/24",
        help="Network CIDR to scan (default: 10.0.0.0/24)",
    )
    parser.add_argument(
        "--host",
        help="Scan a single host instead of a subnet (e.g., 10.0.0.186)",
    )
    parser.add_argument(
        "--export", "-e",
        help="Export results to JSON file",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="Disable colored output",
    )

    args = parser.parse_args()

    # Handle --no-color
    if args.no_color:
        for attr in ["GREEN", "YELLOW", "RED", "CYAN", "WHITE", "DIM", "BOLD", "RESET"]:
            setattr(Colors, attr, "")

    # --- Banner ---
    print_banner()

    # --- Config ---
    print_scan_config(args.network, args.host)

    # --- Initialize scanner ---
    scanner = PrinterDiscovery()
    scanner.on_progress = print_progress

    # --- Scan ---
    print_section("SCANNING")

    if args.host:
        printers = scan_single_host(args.host, scanner)
    else:
        printers = scanner.scan_network(args.network)

    # --- Results ---
    print_results(printers)

    # --- PrinterConfig Preview ---
    print_config_export(printers)

    # --- Summary ---
    print_scan_summary(scanner)

    # --- Export ---
    if args.export and printers:
        summary = scanner.get_scan_summary()
        with open(args.export, "w") as f:
            json.dump(summary, f, indent=2, default=str)
        print(f"\n  {C.GREEN}✓{C.RESET} Results exported to: {C.CYAN}{args.export}{C.RESET}")

    # --- Footer ---
    print_footer(success=len(printers) > 0)

    return 0 if printers else 1


if __name__ == "__main__":
    sys.exit(main())
