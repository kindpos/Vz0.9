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
};

export default function CloseDayScreen({ setScreen, staff }) {
  const [summary, setSummary] = useState(null);
  const [closing, setClosing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/orders/day-summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => setError("Failed to load day summary."));
  }, []);

  const handleCloseDay = async () => {
    setClosing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/close-day`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(data.summary);
      } else {
        setError("Close day failed.");
      }
    } catch { setError("Network error."); }
    setClosing(false);
  };

  const SummaryRow = ({ label, value, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span>{label}</span>
      <span style={{ fontWeight: "bold", color: color || C.black }}>{value}</span>
    </div>
  );

  return (
    <>
      <div style={{ background: "#d4d0c8", borderBottom: `1px solid ${C.dg}`, padding: "3px 8px", display: "flex", gap: 12, fontSize: 10, alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Close Day — Manager</span>
        <span style={{ color: C.dg }}>·</span>
        <span>{staff?.name || "Manager"}</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => setScreen("snapshot")} style={{ ...T.btn, minWidth: 0, padding: "2px 10px", fontSize: 10 }}>Back</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12, fontSize: 11 }}>
        {error && <div style={{ background: "#ffcccc", color: "#660000", padding: "4px 8px", border: "1px solid #cc0000", marginBottom: 8 }}>{error}</div>}

        {result ? (
          /* Post-close summary */
          <div>
            <div style={{ background: "#ccffcc", color: C.green, padding: "6px 10px", border: `1px solid ${C.green}`, marginBottom: 12, fontWeight: "bold", fontSize: 12 }}>
              Day Closed Successfully
            </div>

            <div style={{ border: "2px solid", borderColor: SUNKEN, padding: 12, background: C.white, marginBottom: 12 }}>
              <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 12, color: C.navy }}>Day Summary</div>
              <SummaryRow label="Total Orders" value={result.total_orders} />
              <SummaryRow label="Orders Closed Now" value={result.orders_closed_now} />
              <div style={{ height: 0, borderTop: `1px solid ${C.dg}`, margin: "4px 0" }} />
              <SummaryRow label="Total Sales" value={`$${result.total_sales.toFixed(2)}`} color={C.navy} />
              <SummaryRow label="Total Tips" value={`$${result.total_tips.toFixed(2)}`} color={C.green} />
              <div style={{ height: 0, borderTop: `1px solid ${C.dg}`, margin: "4px 0" }} />
              <SummaryRow label="Cash" value={`$${result.cash_total.toFixed(2)}`} />
              <SummaryRow label="Card" value={`$${result.card_total.toFixed(2)}`} />
              <div style={{ height: 0, borderTop: `1px solid ${C.dg}`, margin: "4px 0" }} />
              <SummaryRow
                label="Grand Total"
                value={`$${(result.total_sales + result.total_tips).toFixed(2)}`}
                color={C.navy}
              />
            </div>

            <button onClick={() => setScreen("snapshot")} style={{ ...T.btn, width: "100%", minWidth: 0, padding: "8px", fontSize: 12 }}>
              Return to Dashboard
            </button>
          </div>
        ) : !summary ? (
          <div style={{ color: C.dg }}>Loading day summary...</div>
        ) : (
          /* Pre-close view */
          <div>
            <div style={{ border: "2px solid", borderColor: SUNKEN, padding: 12, background: C.white, marginBottom: 12 }}>
              <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 12, color: C.navy }}>Current Day Status</div>
              <SummaryRow label="Open Orders" value={summary.open_orders} color={summary.open_orders > 0 ? C.red : C.green} />
              <SummaryRow label="Closed Orders" value={summary.closed_orders} />
              <div style={{ height: 0, borderTop: `1px solid ${C.dg}`, margin: "4px 0" }} />
              <SummaryRow label="Total Sales" value={`$${summary.total_sales.toFixed(2)}`} color={C.navy} />
              <SummaryRow label="Total Tips" value={`$${summary.total_tips.toFixed(2)}`} color={C.green} />
              <div style={{ height: 0, borderTop: `1px solid ${C.dg}`, margin: "4px 0" }} />
              <SummaryRow label="Cash" value={`$${summary.cash_total.toFixed(2)}`} />
              <SummaryRow label="Card" value={`$${summary.card_total.toFixed(2)}`} />
            </div>

            {summary.open_orders > 0 && (
              <div style={{ background: "#ffffcc", color: "#666600", padding: "4px 8px", border: "1px solid #cccc00", marginBottom: 12, fontSize: 10 }}>
                {summary.open_orders} open order(s) will be force-closed when you close the day.
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setScreen("batch-settle")}
                style={{ ...T.btn, flex: 1, minWidth: 0, padding: "8px", fontSize: 11 }}>
                Settle Batch First
              </button>
              <button
                onClick={handleCloseDay}
                disabled={closing}
                style={{
                  ...T.btn, flex: 1, minWidth: 0, padding: "8px",
                  fontSize: 12, fontWeight: "bold",
                  background: C.navy, color: C.white,
                  borderColor: `#4060a0 #000060 #000060 #4060a0`,
                  cursor: closing ? "wait" : "pointer",
                }}>
                {closing ? "Closing..." : "Close Day"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
