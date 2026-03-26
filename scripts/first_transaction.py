"""
KINDpos — First Transaction
=============================
Nice. Dependable. Yours.

This is it. The first KINDpos payment.
$0.01 test sale through the Dejavoo P8.

TAP YOUR CARD ON THE CARD READER (not the screen!)
You have 120 seconds.
"""

import time
import ssl
import xml.etree.ElementTree as ET
from urllib.request import Request, urlopen
from urllib.parse import quote

# ── Configuration ─────────────────────────────────────────────
CLOUD_HOST = "http://10.0.0.31:9000"
REGISTER_ID = "833401"
TPN = "220926700589"
AUTH_KEY = "WcqwNegEmC"
TIMEOUT = 120  # 2 minutes for card tap

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# ── The Sale ──────────────────────────────────────────────────
SALE_XML = f"""<request>
<PaymentType>Credit</PaymentType>
<TransType>Sale</TransType>
<Amount>0.01</Amount>
<Tip>0.00</Tip>
<Frequency>OneTime</Frequency>
<RefId>KIND_{int(time.time())}</RefId>
<RegisterId>{REGISTER_ID}</RegisterId>
<TPN>{TPN}</TPN>
<AuthKey>{AUTH_KEY}</AuthKey>
<PrintReceipt>No</PrintReceipt>
<SigCapture>No</SigCapture>
</request>"""

# ── Go ────────────────────────────────────────────────────────
print()
print("  " + "=" * 50)
print("  KINDpos — First Transaction")
print("  Nice. Dependable. Yours.")
print("  " + "=" * 50)
print()
print(f"  Amount:  $0.01")
print(f"  RefId:   KINDpos_FIRST_TXN")
print(f"  Time:    {time.strftime('%Y-%m-%d %H:%M:%S')}")
print()
print("  Sending sale to terminal...")
print()
print("  *** TAP YOUR CARD ON THE CARD READER NOW ***")
print("  *** (the physical reader, not the screen) ***")
print(f"  *** You have {TIMEOUT} seconds ***")
print()

start_time = time.time()

url = f"{CLOUD_HOST}/spin/cgi.html?TerminalTransaction={quote(SALE_XML.strip())}"

try:
    req = Request(url, method="GET", headers={"Accept": "*/*"})
    response = urlopen(req, timeout=TIMEOUT)
    elapsed = time.time() - start_time
    body = response.read().decode("utf-8", errors="replace")

    # Parse response
    parse_body = body
    if "<xmp>" in parse_body:
        start = parse_body.find("<xmp>") + 5
        end = parse_body.find("</xmp>")
        if end > start:
            parse_body = parse_body[start:end]

    print("  " + "-" * 50)
    print(f"  Response received in {elapsed:.1f} seconds")
    print("  " + "-" * 50)
    print()

    try:
        root = ET.fromstring(parse_body.strip())

        # Extract key fields
        fields = {}
        for child in root:
            fields[child.tag] = child.text or ""

        message = fields.get("Message", "")
        result_code = fields.get("ResultCode", "")
        resp_msg = fields.get("RespMSG", "").replace("%20", " ")
        auth_code = fields.get("AuthCode", "")
        card_type = ""
        last_four = ""
        amount = ""

        # Check ExtData for card details
        ext_data = fields.get("ExtData", "")
        if ext_data:
            for pair in ext_data.split(","):
                pair = pair.strip()
                if pair.startswith("CardType="):
                    card_type = pair.split("=", 1)[1]
                elif pair.startswith("AcntLast4="):
                    last_four = pair.split("=", 1)[1]
                elif pair.startswith("Amount="):
                    amount = pair.split("=", 1)[1]

        # Also check direct fields
        if not card_type:
            card_type = fields.get("CardType", "")
        if not last_four:
            last_four = fields.get("AcntLast4", "")

        # Print all fields
        print("  All Response Fields:")
        print("  " + "-" * 50)
        for tag, val in fields.items():
            display_val = val.replace("%20", " ") if val else "(empty)"
            print(f"    {tag}: {display_val}")
        print("  " + "-" * 50)
        print()

        # The moment of truth
        if result_code == "0" or "approved" in message.lower() or "approval" in resp_msg.lower():
            print()
            print("  " + "=" * 50)
            print("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            print()
            print("       APPROVED")
            print()
            print(f"       Amount:     ${amount or '0.01'}")
            if card_type:
                print(f"       Card:       {card_type}")
            if last_four:
                print(f"       Last Four:  {last_four}")
            if auth_code:
                print(f"       Auth Code:  {auth_code}")
            print(f"       RefId:      {fields.get('RefId', 'KINDpos_FIRST_TXN')}")
            print(f"       RespMSG:    {resp_msg}")
            print()
            print("  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            print("  " + "=" * 50)
            print()
            print("  KINDpos just processed its first payment.")
            print("  Nice. Dependable. Yours.")
            print()
        elif "declined" in message.lower() or "declined" in resp_msg.lower():
            print("  DECLINED")
            print(f"  Reason: {resp_msg}")
            print()
            print("  (This is still a success — the full pipeline works!)")
            print("  (The card was read, sent to processor, and got a response.)")
        elif "aborted" in resp_msg.lower() or "canceled" in message.lower():
            print("  TRANSACTION ABORTED / CANCELED")
            print(f"  Reason: {resp_msg}")
            print()
            print("  Did you tap the card on the physical reader?")
            print("  The NFC sensor is usually on the front face of the device.")
            print("  Try again — run this script once more and tap firmly.")
        else:
            print(f"  Result: {message}")
            print(f"  Code: {result_code}")
            print(f"  Message: {resp_msg}")

    except ET.ParseError:
        print("  Raw response (couldn't parse XML):")
        print(f"    {body[:500]}")

except Exception as e:
    elapsed = time.time() - start_time
    print(f"  Error after {elapsed:.1f}s: {type(e).__name__}: {e}")
    print()
    if "timed out" in str(e).lower():
        print("  The request timed out. The terminal may still be waiting.")
        print("  Check the terminal screen — if it shows a payment prompt,")
        print("  tap your card now. The terminal will process it but we")
        print("  won't get the response in this script.")
    else:
        print("  Something went wrong. Check the terminal screen for status.")

print()
print("  " + "=" * 50)