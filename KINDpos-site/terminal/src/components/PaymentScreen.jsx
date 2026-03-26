import { useState, useMemo } from 'react';
import { API_BASE } from '../config';

const C = {
  gray: "#c0c0c0", dg: "#808080", navy: "#000080", blue: "#1084d0",
  white: "#fff", black: "#000", green: "#006400",
};
const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;

const T = {
  btn: { background: C.gray, border: "2px solid", borderColor: RAISED, padding: "4px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", minWidth: 80, color: C.black, whiteSpace: "nowrap", lineHeight: 1.2 },
  inp: { border: "2px solid", borderColor: SUNKEN, background: C.white, padding: "2px 4px", fontSize: 11, fontFamily: "inherit", outline: "none" },
};

export default function PaymentScreen({ staff, payload, onComplete, setOffline }) {
  const [tab, setTab] = useState("Card");
  const [tender, setTender] = useState("");
  const [tip, setTip] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

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
        // Fire ORDER_CLOSED event
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
    } catch (e) {
      setError("Network error. Payment state unknown.");
      setOffline(true);
    } finally {
      setProcessing(false);
    }
  };

  const TABS = ["Cash", "Card", "Split"];

  return (
    <>
      <div style={{ background: "#d4d0c8", borderBottom: `1px solid ${C.dg}`, padding: "3px 8px", display: "flex", gap: 12, fontSize: 10, alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Payment — {order.order_id || order.id}</span>
        <span style={{ color: C.dg }}>·</span>
        <span>{staff.name}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontWeight: "bold", fontSize: 13, color: C.navy }}>${grandTotal.toFixed(2)}</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT: receipt summary */}
        <div style={{ width: 190, borderRight: `1px solid ${C.dg}`, display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#d4d0c8", padding: "2px 8px", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.dg, borderBottom: `1px solid ${C.dg}` }}>Receipt</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 4, fontFamily: "monospace", fontSize: 10 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                <span style={{ minWidth: 18, color: C.dg }}>{item.quantity}×</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.dg}`, padding: "4px 8px", fontFamily: "monospace", fontSize: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.dg }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.dg }}><span>Tax 8.5%</span><span>${tax.toFixed(2)}</span></div>
            {tipAmount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: C.dg }}><span>Tip</span><span>${tipAmount.toFixed(2)}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: `1px solid ${C.dg}`, marginTop: 3, paddingTop: 3 }}><span>TOTAL</span><span>${grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        {/* RIGHT: payment method */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 10, gap: 8 }}>
          {error && <div style={{ background: "#ffcccc", color: "#660000", padding: "4px 8px", fontSize: 11, border: "1px solid #cc0000" }}>⚠ {error}</div>}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.dg}` }}>
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setTender(""); }} style={{
                ...T.btn, minWidth: 0, flex: 1, padding: "5px 4px", fontSize: 11, borderRadius: 0,
                borderLeft: "none", borderRight: `1px solid ${C.dg}`, borderTop: "none", borderBottom: "none",
                background: tab === t ? "#d4d0c8" : C.gray,
                fontWeight: tab === t ? "bold" : "normal",
              }}>{t}</button>
            ))}
          </div>

          {/* Cash */}
          {tab === "Cash" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: "bold" }}>
                <span>Amount Due</span><span style={{ color: C.navy }}>${grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, minWidth: 80 }}>Cash Tendered</span>
                <input
                  style={{ ...T.inp, width: 100, fontSize: 14, fontWeight: "bold" }}
                  type="number" placeholder="0.00"
                  value={tender} onChange={e => setTender(e.target.value)}
                />
              </div>
              {change !== null && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: "bold", color: C.green }}>
                  <span>Change Due</span><span>${change}</span>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                {["5", "10", "20", "50", "100"].map(d => (
                  <button key={d} onClick={() => setTender(d)} style={{ ...T.btn, minWidth: 0, padding: "4px 10px", fontSize: 11 }}>${d}</button>
                ))}
                <button onClick={() => setTender(grandTotal.toFixed(2))} style={{ ...T.btn, minWidth: 0, padding: "4px 10px", fontSize: 11, fontWeight: "bold" }}>Exact</button>
              </div>
            </div>
          )}

          {/* Card */}
          {tab === "Card" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 10 }}>
              <div style={{ fontSize: 36 }}>💳</div>
              <div style={{ fontWeight: "bold", fontSize: 13 }}>{processing ? "Processing..." : "Tap, Insert, or Swipe"}</div>
              <div style={{ fontSize: 10, color: C.dg }}>{processing ? "Communicating with reader..." : "Waiting for card reader…"}</div>
              <div style={{ fontSize: 11, fontWeight: "bold", color: C.navy, marginTop: 8 }}>${grandTotal.toFixed(2)}</div>
            </div>
          )}

          {/* Split */}
          {tab === "Split" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Allocate payment across methods:</div>
              {[["Card", "$" + grandTotal.toFixed(2)], ["Cash", "$0.00"]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ minWidth: 50, fontSize: 11 }}>{label}</span>
                  <input style={{ ...T.inp, width: 100, fontSize: 12 }} defaultValue={val} />
                </div>
              ))}
              <div style={{ fontSize: 10, color: C.dg, marginTop: 4 }}>Remaining: $0.00</div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Tip line */}
          <div style={{ borderTop: `1px solid ${C.dg}`, paddingTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, minWidth: 30 }}>Tip</span>
            <input style={{ ...T.inp, width: 80, fontSize: 12 }} placeholder="$0.00" value={tip} onChange={e => setTip(e.target.value)} />
            <div style={{ display: "flex", gap: 4 }}>
              {["15%", "18%", "20%"].map(p => (
                <button key={p} onClick={() => setTip((subtotal * parseFloat(p) / 100).toFixed(2))} style={{ ...T.btn, minWidth: 0, padding: "2px 8px", fontSize: 10 }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Charge button */}
          <button
            onClick={handleCharge}
            disabled={processing || (tab === "Cash" && parseFloat(tender || 0) < grandTotal)}
            style={{
              ...T.btn, width: "100%", minWidth: 0, padding: "10px", fontSize: 13,
              fontWeight: "bold", background: C.navy, color: C.white,
              borderColor: `#4060a0 #000060 #000060 #4060a0`,
              cursor: processing ? "wait" : "pointer"
            }}>
            {processing ? "Wait..." : `✔  Charge  ${tab}  —  $${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </>
  );
}
