import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const C = {
  gray: "#c0c0c0", dg: "#808080", navy: "#000080", blue: "#1084d0",
  white: "#fff", black: "#000", green: "#006400", red: "#cc0000",
};
const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;

const T = {
  btn: { background: C.gray, border: "2px solid", borderColor: RAISED, padding: "4px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", minWidth: 80, color: C.black, whiteSpace: "nowrap", lineHeight: 1.2 },
  inp: { border: "2px solid", borderColor: SUNKEN, background: C.white, padding: "2px 4px", fontSize: 11, fontFamily: "inherit", outline: "none" },
};

export default function BatchSettleScreen({ setScreen }) {
  const [summary, setSummary] = useState(null);
  const [settling, setSettling] = useState(false);
  const [settled, setSettled] = useState(false);
  const [error, setError] = useState("");
  const [editingTip, setEditingTip] = useState(null);
  const [tipValue, setTipValue] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/orders/day-summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => setError("Failed to load summary."));
  }, []);

  const handleSettle = async () => {
    setSettling(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/close-batch`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSettled(true);
        // Refresh summary
        const s = await fetch(`${API_BASE}/api/v1/orders/day-summary`).then(r => r.json());
        setSummary(s);
      } else {
        setError("Settle failed.");
      }
    } catch { setError("Network error."); }
    setSettling(false);
  };

  const handleTipAdjust = async (orderId, paymentId) => {
    const tip = parseFloat(tipValue);
    if (isNaN(tip) || tip < 0) { setError("Invalid tip amount."); return; }
    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/tip-adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, payment_id: paymentId, tip_amount: tip }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTip(null);
        setTipValue("");
        // Refresh
        const s = await fetch(`${API_BASE}/api/v1/orders/day-summary`).then(r => r.json());
        setSummary(s);
      } else {
        setError("Tip adjust failed.");
      }
    } catch { setError("Network error."); }
  };

  return (
    <>
      <div style={{ background: "#d4d0c8", borderBottom: `1px solid ${C.dg}`, padding: "3px 8px", display: "flex", gap: 12, fontSize: 10, alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Batch Settlement</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setScreen("snapshot")} style={{ ...T.btn, minWidth: 0, padding: "2px 10px", fontSize: 10 }}>Back</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 10, fontSize: 11 }}>
        {error && <div style={{ background: "#ffcccc", color: "#660000", padding: "4px 8px", border: "1px solid #cc0000", marginBottom: 8 }}>{error}</div>}

        {settled && (
          <div style={{ background: "#ccffcc", color: C.green, padding: "4px 8px", border: `1px solid ${C.green}`, marginBottom: 8 }}>
            Batch settled successfully.
          </div>
        )}

        {!summary ? (
          <div style={{ color: C.dg }}>Loading...</div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ border: "2px solid", borderColor: SUNKEN, padding: 8, marginBottom: 10, background: C.white }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 11 }}>
                <span>Open Orders:</span><span style={{ fontWeight: "bold" }}>{summary.open_orders}</span>
                <span>Closed Orders:</span><span style={{ fontWeight: "bold" }}>{summary.closed_orders}</span>
                <span>Total Sales:</span><span style={{ fontWeight: "bold", color: C.navy }}>${summary.total_sales.toFixed(2)}</span>
                <span>Total Tips:</span><span style={{ fontWeight: "bold", color: C.green }}>${summary.total_tips.toFixed(2)}</span>
                <span>Cash:</span><span>${summary.cash_total.toFixed(2)}</span>
                <span>Card:</span><span>${summary.card_total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payments list with tip edit */}
            {summary.payments && summary.payments.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>Payments</div>
                <div style={{ border: "2px solid", borderColor: SUNKEN, background: C.white }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                    <thead>
                      <tr style={{ background: "#d4d0c8", borderBottom: `1px solid ${C.dg}` }}>
                        <th style={{ padding: "3px 6px", textAlign: "left" }}>Order</th>
                        <th style={{ padding: "3px 6px", textAlign: "left" }}>Method</th>
                        <th style={{ padding: "3px 6px", textAlign: "right" }}>Amount</th>
                        <th style={{ padding: "3px 6px", textAlign: "right" }}>Tip</th>
                        <th style={{ padding: "3px 6px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.payments.map((p, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.gray}` }}>
                          <td style={{ padding: "3px 6px" }}>{p.order_id.slice(-8)}</td>
                          <td style={{ padding: "3px 6px" }}>{p.method}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>${p.amount.toFixed(2)}</td>
                          <td style={{ padding: "3px 6px", textAlign: "right" }}>
                            {editingTip === p.payment_id ? (
                              <input
                                style={{ ...T.inp, width: 50, fontSize: 10 }}
                                value={tipValue}
                                onChange={e => setTipValue(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                              />
                            ) : (
                              <span>${p.tip.toFixed(2)}</span>
                            )}
                          </td>
                          <td style={{ padding: "3px 6px", textAlign: "center" }}>
                            {editingTip === p.payment_id ? (
                              <div style={{ display: "flex", gap: 2 }}>
                                <button onClick={() => handleTipAdjust(p.order_id, p.payment_id)} style={{ ...T.btn, minWidth: 0, padding: "1px 6px", fontSize: 9 }}>OK</button>
                                <button onClick={() => { setEditingTip(null); setTipValue(""); }} style={{ ...T.btn, minWidth: 0, padding: "1px 6px", fontSize: 9 }}>X</button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingTip(p.payment_id); setTipValue(p.tip > 0 ? p.tip.toFixed(2) : ""); }} style={{ ...T.btn, minWidth: 0, padding: "1px 6px", fontSize: 9 }}>Tip</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settle button */}
            {!settled && summary.open_orders > 0 && (
              <button
                onClick={handleSettle}
                disabled={settling}
                style={{
                  ...T.btn, width: "100%", minWidth: 0, padding: "8px",
                  fontSize: 12, fontWeight: "bold",
                  background: C.navy, color: C.white,
                  borderColor: `#4060a0 #000060 #000060 #4060a0`,
                  cursor: settling ? "wait" : "pointer",
                }}>
                {settling ? "Settling..." : `Settle Batch (${summary.open_orders} open)`}
              </button>
            )}

            {!settled && summary.open_orders === 0 && (
              <div style={{ color: C.dg, fontStyle: "italic", textAlign: "center", padding: 10 }}>
                All orders are closed. No batch settlement needed.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
