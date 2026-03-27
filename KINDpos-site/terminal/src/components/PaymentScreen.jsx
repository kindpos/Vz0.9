import { useState } from 'react';
import { API_BASE } from '../config';

const FH = "'Alien Encounters Solid Bold', sans-serif";
const FB = "'Sevastopol Interface', sans-serif";
const C = { bg: "#333333", mint: "#C6FFBB", yellow: "#FBDE42", red: "#E84040" };

const btnS = {
  background: C.bg, color: C.mint, border: `1px solid ${C.mint}`,
  borderRadius: 8, fontFamily: FB, fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

export default function PaymentScreen({ staff, payload, onComplete, setOffline }) {
  const [tab, setTab] = useState("Cash");
  const [tender, setTender] = useState("");
  const [tip, setTip] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [numInput, setNumInput] = useState("");

  const { items, subtotal, tax, cardTotal, cashTotal } = payload;
  const order = payload;
  const currentTotal = tab === "Cash" ? cashTotal : cardTotal;
  const tipAmount = parseFloat(tip || 0);
  const grandTotal = currentTotal + tipAmount;

  const change = tab === "Cash" && parseFloat(tender || 0) >= grandTotal
    ? (parseFloat(tender) - grandTotal).toFixed(2) : null;

  const handleCharge = async () => {
    setProcessing(true);
    setError("");
    try {
      const isCash = tab === "Cash";
      const amountToCharge = isCash ? cashTotal : cardTotal;
      const endpoint = isCash ? "/api/v1/payments/cash" : "/api/v1/payments/sale";

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.order_id || order.id,
          amount: amountToCharge,
          tip: tipAmount,
          payment_method: isCash ? "cash" : "card",
        })
      });
      const result = await res.json();

      if (result.success) {
        await fetch(`${API_BASE}/api/v1/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ORDER_CLOSED",
            order_id: order.order_id || order.id,
            payment_method: isCash ? "cash" : "card",
            amount: amountToCharge,
            tip: tipAmount
          })
        });
        setOffline(false);
        onComplete();
      } else {
        setError(result.error || "Payment failed");
      }
    } catch {
      setError("Network error. Payment state unknown.");
      setOffline(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleNumpad = (val) => {
    if (val === "clear") {
      setNumInput("");
      setTender("");
    } else if (val === "action") {
      setTender(grandTotal.toFixed(2));
    } else if (val === ".") {
      if (!numInput.includes(".")) {
        const next = numInput + ".";
        setNumInput(next);
        setTender(next);
      }
    } else {
      const next = numInput + val;
      setNumInput(next);
      setTender(next);
    }
  };

  const PAD = [["1","2","3"],["4","5","6"],["7","8","9"],["clr","0","."]];

  return (
    <div style={{ flex: 1, background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {error && (
        <div style={{ background: "rgba(232,64,64,0.15)", border: `1px solid ${C.red}`, color: C.red, padding: "6px 12px", fontSize: 12, fontFamily: FB, margin: "8px 16px 0" }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", padding: 16, gap: 16, overflow: "hidden" }}>
        {/* LEFT: Check Preview */}
        <div style={{ width: 380, border: `2px solid ${C.mint}`, borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ background: C.mint, color: C.bg, padding: "4px 10px", fontFamily: FH, fontSize: 14 }}>
            CHECK PREVIEW
          </div>
          <div style={{ flex: 1, padding: 10, fontFamily: FB, color: C.mint, fontSize: 13, overflowY: "auto" }}>
            <div style={{ marginBottom: 4 }}>Check: {order.order_id || order.id}</div>
            <div style={{ marginBottom: 12 }}>Server: {staff.name}</div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 12 }}>
                <span>{(item.quantity || item.qty || 1) > 1 ? `${item.quantity || item.qty}x ` : ""}{item.name}</span>
                <span>${(item.price * (item.quantity || item.qty || 1)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, borderTop: `2px solid ${C.mint}`, fontFamily: FB, color: C.yellow }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
                <span>Tip</span><span>${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: "bold", marginTop: 6 }}>
              <span>TOTAL</span><span>${grandTotal.toFixed(2)}</span>
            </div>
            {change !== null && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, marginTop: 6, color: C.mint }}>
                <span>CHANGE</span><span>${change}</span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Payment Controls */}
        <div style={{ width: 250, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>
          {/* Tab toggles */}
          <div style={{ display: "flex", gap: 6 }}>
            {["Cash", "Card"].map(t => (
              <button key={t} onClick={() => { setTab(t); setTender(""); setNumInput(""); }} style={{
                ...btnS, flex: 1, padding: "8px", fontFamily: FH, fontSize: 14,
                background: tab === t ? C.mint : C.bg,
                color: tab === t ? C.bg : C.mint,
              }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {tab === "Cash" && <>
            {/* Exact */}
            <button onClick={() => setTender(grandTotal.toFixed(2))} style={{
              ...btnS, width: 109, height: 46, background: C.mint, color: C.bg, fontWeight: "bold",
            }}>EXACT</button>

            {/* Quick cash */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 95px)", gap: 10 }}>
              {["5", "10", "15", "20", "50", "100"].map(val => (
                <button key={val} onClick={() => setTender(val)} style={{ ...btnS, height: 46 }}>${val}</button>
              ))}
            </div>

            {/* Tip */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontFamily: FB, color: C.mint, minWidth: 30 }}>Tip</span>
              <input style={{
                background: "#222", border: `1px solid ${C.mint}`, color: C.yellow,
                padding: "4px 8px", fontFamily: FB, fontSize: 14, borderRadius: 4,
                outline: "none", width: 80,
              }} placeholder="$0.00" value={tip} onChange={e => setTip(e.target.value)} />
              <div style={{ display: "flex", gap: 4 }}>
                {["15%", "18%", "20%"].map(p => (
                  <button key={p} onClick={() => setTip((subtotal * parseFloat(p) / 100).toFixed(2))} style={{ ...btnS, padding: "3px 8px", fontSize: 11 }}>{p}</button>
                ))}
              </div>
            </div>
          </>}

          {tab === "Card" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontSize: 40 }}>💳</div>
              <div style={{ fontFamily: FH, fontSize: 14, color: C.mint }}>
                {processing ? "PROCESSING..." : "TAP, INSERT, OR SWIPE"}
              </div>
              <div style={{ fontFamily: FB, fontSize: 12, color: C.mint, opacity: 0.6 }}>
                {processing ? "Communicating with reader..." : "Waiting for card reader..."}
              </div>
              <div style={{ fontFamily: FB, fontSize: 24, color: C.yellow, fontWeight: "bold", marginTop: 8 }}>
                ${grandTotal.toFixed(2)}
              </div>
              {/* Tip for card */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 12, fontFamily: FB, color: C.mint }}>Tip</span>
                <input style={{
                  background: "#222", border: `1px solid ${C.mint}`, color: C.yellow,
                  padding: "4px 8px", fontFamily: FB, fontSize: 14, borderRadius: 4,
                  outline: "none", width: 80,
                }} placeholder="$0.00" value={tip} onChange={e => setTip(e.target.value)} />
                {["15%", "18%", "20%"].map(p => (
                  <button key={p} onClick={() => setTip((subtotal * parseFloat(p) / 100).toFixed(2))} style={{ ...btnS, padding: "3px 6px", fontSize: 10 }}>{p}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto" }}>
            {/* Charge button */}
            <button
              onClick={handleCharge}
              disabled={processing || (tab === "Cash" && parseFloat(tender || 0) < grandTotal)}
              style={{
                width: "100%", height: 62, background: C.mint, color: C.bg,
                border: "none", borderRadius: 12, fontFamily: FH, fontSize: 18,
                cursor: processing ? "wait" : "pointer",
                opacity: (processing || (tab === "Cash" && parseFloat(tender || 0) < grandTotal)) ? 0.4 : 1,
              }}
            >
              {processing ? "WAIT..." : `${tab.toUpperCase()} — $${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>

        {/* RIGHT: Numpad + Amount */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          {/* Amount display */}
          <div style={{
            height: 48, border: `1px solid ${C.mint}`, borderRadius: 8,
            color: C.yellow, fontSize: 24, fontFamily: FB,
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            padding: "0 15px",
          }}>
            ${tender || "0.00"}
          </div>

          {/* Numpad */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, flex: 1 }}>
            {PAD.flat().map(key => {
              const isCLR = key === "clr";
              return (
                <button key={key} onClick={() => handleNumpad(isCLR ? "clear" : key)} style={{
                  background: isCLR ? C.red : C.bg,
                  color: isCLR ? C.bg : C.mint,
                  border: isCLR ? "none" : `1px solid ${C.mint}`,
                  borderRadius: 8, fontFamily: FB, fontSize: 22,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>{key}</button>
              );
            })}
          </div>

          {/* Exact button in numpad area */}
          <button onClick={() => handleNumpad("action")} style={{
            height: 48, background: C.mint, color: C.bg,
            border: "none", borderRadius: 8, fontFamily: FB, fontSize: 16,
            cursor: "pointer", fontWeight: "bold",
          }}>Exact</button>

          {/* Loyalty / GC */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btnS, flex: 2, height: 50, fontSize: 13 }}>Loyalty</button>
            <button style={{ ...btnS, flex: 1, height: 50, fontSize: 13 }}>GC</button>
          </div>
        </div>
      </div>
    </div>
  );
}
