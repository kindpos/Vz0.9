"""
KINDpos — Dejavoo Hardware Probe v3
====================================
Cloud mode first (prove the flow), then local retry.

Cloud endpoint from device config: test.spin.spinpos.net
Docs show: HTTPS://test.SPInpos.net:443/SPIn/cgi.html?TerminalTransaction=

Run: python dejavoo_probe_v3.py
"""

import sys
import time
import socket
import ssl
import xml.etree.ElementTree as ET
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import quote

# ── Configuration ─────────────────────────────────────────────
# Cloud endpoints (from device config and docs)
CLOUD_HOSTS = [
    ("http://10.0.0.31:9000"),
    ("test.spinpos.net", 443),
    ("spin.spinpos.net", 443),
    ("test.spin.spinpos.net", 48777),
]

# Local device (for retry after switching back)
LOCAL_IP = "10.0.0.31"
LOCAL_PORT = 9000

# Credentials
REGISTER_ID = "833401"
TPN = "220926700589"
AUTH_KEY = "WcqwNegEmC"

# Timeouts
STATUS_TIMEOUT = 30
SALE_TIMEOUT = 120

# SSL context (allow self-signed certs on test endpoints)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


# ── Helpers ───────────────────────────────────────────────────
def separator(char="=", width=60):
    print(char * width)

def header(text):
    print()
    separator()
    print(f"  {text}")
    separator()

def success(text):
    print(f"  [OK]  {text}")

def fail(text):
    print(f"  [--]  {text}")

def info(text):
    print(f"  [ii]  {text}")

def warn(text):
    print(f"  [!!]  {text}")


def auth_fields():
    return (
        f"<RegisterId>{REGISTER_ID}</RegisterId>"
        f"<TPN>{TPN}</TPN>"
        f"<AuthKey>{AUTH_KEY}</AuthKey>"
    )


def send_request(base_url, xml_body, timeout=STATUS_TIMEOUT, label="Request", use_ssl=True):
    """Send SPIn request via HTTP GET."""
    encoded_xml = quote(xml_body.strip())

    paths = ["/spin/cgi.html", "/SPIn/cgi.html"]

    for path in paths:
        url = f"{base_url}{path}?TerminalTransaction={encoded_xml}"
        display_url = url[:90] + "..." if len(url) > 90 else url
        info(f"Trying: {display_url}")

        try:
            req = Request(url, method="GET", headers={"Accept": "*/*"})

            if use_ssl:
                response = urlopen(req, timeout=timeout)
            else:
                response = urlopen(req, timeout=timeout)

            status_code = response.status
            response_body = response.read().decode("utf-8", errors="replace")

            print()
            separator("-")
            success(f"{label} — RESPONSE! HTTP {status_code}")
            separator("-")
            print()

            # Print raw response
            print("  Raw Response:")
            print("  " + "-" * 50)
            for line in response_body.strip().split("\n"):
                print(f"    {line}")
            print("  " + "-" * 50)

            # Parse XML
            parse_body = response_body
            if "<xmp>" in parse_body:
                start = parse_body.find("<xmp>") + 5
                end = parse_body.find("</xmp>")
                if end > start:
                    parse_body = parse_body[start:end]

            try:
                root = ET.fromstring(parse_body.strip())
                print()
                print("  Parsed Fields:")
                print("  " + "-" * 50)

                # Handle both flat and nested response structures
                if len(root) == 0 and root.text:
                    print(f"    {root.tag} = {root.text}")
                else:
                    for child in root:
                        val = child.text if child.text else "(empty)"
                        print(f"    <{child.tag}> = {val}")
                        for sub in child:
                            sub_val = sub.text if sub.text else "(empty)"
                            print(f"      <{sub.tag}> = {sub_val}")

                print("  " + "-" * 50)

                # Check for success indicators
                msg = ""
                result_code = ""
                resp_msg = ""
                for child in root:
                    if child.tag == "Message":
                        msg = child.text or ""
                    if child.tag == "ResultCode":
                        result_code = child.text or ""
                    if child.tag == "RespMSG":
                        resp_msg = child.text or ""

                print()
                if result_code == "0" or "approved" in msg.lower() or "approved" in resp_msg.lower():
                    success(f"TRANSACTION SUCCESSFUL! Message: {msg}, RespMSG: {resp_msg}")
                elif "authentication" in resp_msg.lower():
                    warn(f"Authentication issue: {resp_msg}")
                elif "canceled" in msg.lower() or "cancelled" in msg.lower():
                    warn(f"Canceled: {resp_msg}")
                else:
                    info(f"Result: Message={msg}, Code={result_code}, RespMSG={resp_msg}")

            except ET.ParseError as e:
                warn(f"  XML parse error: {e}")

            return {
                "url": base_url + path,
                "status_code": status_code,
                "body": response_body,
                "success": True,
            }

        except HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", errors="replace")
            except:
                pass
            warn(f"  HTTP {e.code}")
            if body:
                print(f"    Body: {body[:500]}")
            if e.code != 404:
                return {"url": base_url + path, "status_code": e.code, "body": body, "success": False}

        except socket.timeout:
            fail(f"  Timeout ({timeout}s)")

        except URLError as e:
            fail(f"  Connection error: {e.reason}")

        except Exception as e:
            fail(f"  Error: {type(e).__name__}: {e}")

    return None


# ── XML Requests ──────────────────────────────────────────────

STATUS_XML = f"""<request>
<TransType>StatusCheck</TransType>
{auth_fields()}
</request>"""

# Minimal sale — $0.01 test transaction
SALE_XML = f"""<request>
<PaymentType>Credit</PaymentType>
<TransType>Sale</TransType>
<Amount>0.01</Amount>
<Tip>0.00</Tip>
<Frequency>OneTime</Frequency>
<RefId>KIND001</RefId>
{auth_fields()}
<PrintReceipt>No</PrintReceipt>
<SigCapture>No</SigCapture>
</request>"""


# ── Main ──────────────────────────────────────────────────────
def main():
    print()
    print("  KINDpos — Dejavoo Hardware Probe v3")
    print("  Nice. Dependable. Yours.")
    print(f"  Register ID: {REGISTER_ID}")
    print(f"  TPN: {TPN}")
    print(f"  Auth Key: {AUTH_KEY[:4]}{'*' * (len(AUTH_KEY)-4)}")
    print(f"  Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # ── PART 1: CLOUD MODE ────────────────────────────────────
    header("PART 1: CLOUD MODE")
    print("  Testing through iPOSpays cloud proxy...")
    print("  This proves the credentials and XML format work.")
    print()

    cloud_success = False

    for host, port in CLOUD_HOSTS:
        header(f"Cloud: {host}:{port}")

        # Check DNS resolution
        try:
            ip = socket.gethostbyname(host)
            success(f"DNS resolved: {host} -> {ip}")
        except socket.gaierror:
            fail(f"DNS failed: {host} — skipping")
            continue

        # Check port
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((ip, port))
            sock.close()
            if result == 0:
                success(f"Port {port} is open!")
            else:
                fail(f"Port {port} closed — skipping")
                continue
        except:
            fail(f"Port check failed — skipping")
            continue

        # Try HTTPS status check
        base_url = f"https://{host}:{port}" if port == 443 else f"https://{host}:{port}"
        info("Sending Status Check via HTTPS...")
        result = send_request(base_url, STATUS_XML, timeout=STATUS_TIMEOUT, label="Cloud Status", use_ssl=True)

        if result:
            cloud_success = True

            # Check if auth succeeded
            if result.get("body") and "Authentication" not in result.get("body", ""):
                print()
                success("CLOUD AUTH SUCCEEDED! Credentials are valid.")
                print()

                # Try a $0.01 sale
                header("CLOUD SALE TEST ($0.01)")
                warn("This will prompt the terminal for a card tap!")
                warn("If you have a test card, tap it. Otherwise let it timeout.")
                print()
                sale_result = send_request(
                    base_url, SALE_XML,
                    timeout=SALE_TIMEOUT,
                    label="Cloud Sale $0.01",
                    use_ssl=True
                )
                if sale_result:
                    cloud_success = True
            break

        # Try HTTP if HTTPS failed
        base_url_http = f"http://{host}:{port}"
        info("Trying HTTP fallback...")
        result = send_request(base_url_http, STATUS_XML, timeout=STATUS_TIMEOUT, label="Cloud Status (HTTP)", use_ssl=False)
        if result:
            cloud_success = True
            break

    if not cloud_success:
        warn("Cloud tests did not succeed. Check portal configuration.")

    # ── PART 2: LOCAL MODE RETRY ──────────────────────────────
    header("PART 2: LOCAL MODE (direct to device)")
    info(f"Trying {LOCAL_IP}:{LOCAL_PORT} with cloud credentials...")
    print()

    # Check if local port is open
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((LOCAL_IP, LOCAL_PORT))
        sock.close()
        if result == 0:
            success(f"Local port {LOCAL_PORT} is OPEN!")

            # Try status with full auth
            info("Sending Status Check with cloud Auth Key to local device...")
            local_result = send_request(
                f"http://{LOCAL_IP}:{LOCAL_PORT}",
                STATUS_XML,
                timeout=STATUS_TIMEOUT,
                label="Local Status (cloud creds)",
                use_ssl=False
            )

            if local_result:
                body = local_result.get("body", "")
                if "Authentication" not in body:
                    success("LOCAL AUTH WITH CLOUD KEY WORKS!")
                    success("This means we can use Local mode with the cloud-generated Auth Key!")
                else:
                    warn("Local device still rejects cloud Auth Key")
                    info("Local mode may need separate provisioning")
        else:
            info(f"Local port {LOCAL_PORT} is closed (expected in Cloud mode)")
            info("Switch portal back to Local, download params, then retry")
    except Exception as e:
        info(f"Local connection: {e}")

    # ── SUMMARY ───────────────────────────────────────────────
    header("SUMMARY")
    print()
    if cloud_success:
        success("Cloud communication: WORKING")
        success("Credentials are valid")
        success("XML format is confirmed")
        print()
        print("  Next steps:")
        print("    1. Note the exact response format from successful requests")
        print("    2. Switch portal to Local mode")
        print("    3. Download params (Auth Key should persist on device)")
        print("    4. Run probe again to test local with same Auth Key")
    else:
        warn("Cloud communication: NOT YET WORKING")
        print()
        print("  Troubleshooting:")
        print("    - Verify the portal shows Cloud mode is active and saved")
        print("    - Check that the Auth Key hasn't changed")
        print("    - Try accessing the portal URL directly in a browser")
        print("    - Contact iPOSpays support if credentials keep failing")

    print()
    separator()


if __name__ == "__main__":
    main()