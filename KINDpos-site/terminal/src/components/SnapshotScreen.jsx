import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const FH = "'Alien Encounters Solid Bold', sans-serif";
const FB = "'Sevastopol Interface', sans-serif";

const C = {
  bg: "#333333", mint: "#C6FFBB", yellow: "#FBDE42", red: "#E84040", dark: "#1a1a1a",
};

// ─── Layout helpers ─────────────────────────────────────────────────────────

// Always-open card — no expand/collapse toggle
function Card({ title, titleRight, children }) {
  return (
    <div style={{
      border: `2px solid ${C.mint}`, borderRadius: 8,
      background: C.bg, overflow: "hidden",
      display: "flex", flexDirection: "column", flex: 1, minHeight: 0,
    }}>
      <div style={{
        background: C.mint, color: C.bg, fontFamily: FH, fontSize: 14,
        padding: "0 10px", minHeight: 27, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTopLeftRadius: 6, borderTopRightRadius: 6,
      }}>
        <span>{title}</span>
        {titleRight && <span style={{ fontFamily: FB, fontSize: 11, opacity: 0.7 }}>{titleRight}</span>}
      </div>
      <div style={{
        padding: 8, color: C.mint, fontFamily: FB, fontSize: 12,
        flex: 1, overflowY: "auto", minHeight: 0,
      }}>
        {children}
      </div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{
      fontFamily: FH, fontSize: 10, color: C.mint, opacity: 0.6,
      letterSpacing: 1, marginTop: 8, marginBottom: 4,
      borderTop: `1px solid ${C.mint}33`, paddingTop: 6,
    }}>
      {label}
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

const MOCK_TODAY_SPARK  = [320, 880, 1240, 760, 290, 410, 920];
const MOCK_LW_SPARK     = [210, 640,  980, 920, 420, 380, 840];
const MOCK_HOURLY = [
  { h: "11a", v: 320  }, { h: "12p", v: 880  }, { h: "1p",  v: 1240 },
  { h: "2p",  v: 760  }, { h: "3p",  v: 290  }, { h: "4p",  v: 410  },
  { h: "5p",  v: 920  }, { h: "6p",  v: 1560 }, { h: "7p",  v: 1890 },
  { h: "8p",  v: 2100 }, { h: "9p",  v: 1680 }, { h: "10p", v: 890  },
];

function Sparkline({ today = [], lastWeek = [] }) {
  const max  = Math.max(...today, ...lastWeek, 1);
  const W = 220, H = 50, pad = 2, pts = today.length;
  const step = pts > 1 ? W / (pts - 1) : W;
  const toY  = v => pad + (H - 2 * pad) * (1 - v / max);
  const lwPts  = lastWeek.map((v, i) => `${i * step},${toY(v)}`).join(' ');
  const tdPts  = today.map((v, i)    => `${i * step},${toY(v)}`).join(' ');
  const lwArea = `${lwPts} ${(pts - 1) * step},${H} 0,${H}`;
  const tdArea = `${tdPts} ${(pts - 1) * step},${H} 0,${H}`;
  const todayTotal  = today.reduce((a, b) => a + b, 0);
  const lastTotal   = lastWeek.reduce((a, b) => a + b, 0);
  const delta       = todayTotal - lastTotal;
  const deltaPct    = lastTotal > 0 ? ((delta / lastTotal) * 100).toFixed(1) : 0;
  const deltaColor  = delta >= 0 ? '#44FF88' : '#FF5555';

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3, fontFamily: FB }}>
        <span style={{ opacity: 0.4 }}>TODAY vs LAST WK</span>
        <span style={{ color: deltaColor, fontWeight: "bold" }}>{delta >= 0 ? '▲' : '▼'} {Math.abs(deltaPct)}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#44FF88" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#44FF88" stopOpacity="0"    />
          </linearGradient>
          <linearGradient id="oFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF8C00" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <polygon points={lwArea} fill="url(#oFill)" />
        <polyline points={lwPts} fill="none" stroke="#FF8C00" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
        {lastWeek.map((v, i) => <circle key={i} cx={i * step} cy={toY(v)} r="2.5" fill="#FF8C00" opacity="0.7" />)}
        <polygon points={tdArea} fill="url(#gFill)" />
        <polyline points={tdPts} fill="none" stroke="#44FF88" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {today.map((v, i) => <circle key={i} cx={i * step} cy={toY(v)} r="3" fill="#44FF88" />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.3, marginTop: 2, fontFamily: FB }}>
        <span>11a</span><span>2p</span><span>5p</span><span>8p</span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 9, marginTop: 3, fontFamily: FB }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 12, height: 3, background: "#FF8C00", borderRadius: 2, display: "inline-block" }} />Last wk
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 12, height: 3, background: "#44FF88", borderRadius: 2, display: "inline-block" }} />Today
        </span>
      </div>
    </div>
  );
}

function HourlyBars({ data = [] }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const W = 234, H = 40, bw = Math.floor(W / data.length) - 1;
  return (
    <div>
      <svg width={W} height={H} style={{ display: "block" }}>
        {data.map((d, i) => {
          const h = Math.max(2, Math.round((d.v / max) * (H - 6)));
          return (
            <rect key={i} x={i * (bw + 1)} y={H - h - 2}
              width={bw} height={h} fill={C.mint} opacity={0.75} />
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.45, fontFamily: FB, marginTop: 2 }}>
        <span>11A</span><span>2P</span><span>5P</span><span>8P</span><span>10P</span>
      </div>
    </div>
  );
}

// ─── Messenger vertical tabs ──────────────────────────────────────────────────

const MSG_TAB_COLORS = { RECV: "#C6FFBB", SENT: "#00CFCF", ALERTS: "#FF8C00" };

function MessengerTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "2px 0", flexShrink: 0 }}>
      {tabs.map(t => (
        <div key={t} onClick={() => onChange(t)} style={{
          writingMode: "vertical-rl", textOrientation: "mixed",
          transform: "rotate(180deg)",
          background: active === t ? MSG_TAB_COLORS[t] : "#1a1a1a",
          color: active === t ? C.bg : C.mint,
          padding: "10px 5px", fontSize: 13,
          borderRadius: "0 4px 4px 0",
          cursor: "pointer",
          fontWeight: active === t ? "bold" : "normal",
          textAlign: "center", letterSpacing: 2,
          fontFamily: FB,
        }}>{t}</div>
      ))}
    </div>
  );
}

// ─── Center column components ────────────────────────────────────────────────

function elapsed(created) {
  if (!created) return '';
  const ms = Date.now() - new Date(created).getTime();
  if (isNaN(ms) || ms < 0) return '';
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}

function TableTile({ order, selected, onToggle, onRightClick }) {
  const label = order.table || order.label || (order.order_id || order.id || '').replace("ORD-", "#");
  const rawTotal = typeof order.total === 'string'
    ? parseFloat(order.total.replace("$", ""))
    : order.total;
  const total = !isNaN(rawTotal) && rawTotal != null ? `$${rawTotal.toFixed(2)}` : '—';
  const time  = elapsed(order.created_at);

  return (
    <div
      onClick={onToggle}
      onContextMenu={e => { e.preventDefault(); onRightClick && onRightClick(); }}
      style={{
        width: 78, height: 77,
        border: `2px solid ${C.mint}`,
        background: selected ? C.mint : C.bg,
        color: selected ? C.bg : C.mint,
        borderRadius: 8, cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 1,
        fontFamily: FB, userSelect: "none",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: "bold" }}>{label}</span>
      <span style={{ fontSize: 10, opacity: 0.65 }}>{order.guest_count ?? '—'}g</span>
      {time && <span style={{ fontSize: 9, opacity: 0.5 }}>{time}</span>}
      <span style={{ fontSize: 10, fontWeight: "bold", color: selected ? C.bg : C.yellow }}>{total}</span>
    </div>
  );
}

function EmptySlot({ slot, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 78, height: 77,
        border: `1px dashed ${C.mint}40`,
        borderRadius: 8, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: `${C.mint}25`, fontSize: 11, fontFamily: FB,
        userSelect: "none",
      }}
    >
      {slot}
    </div>
  );
}

const eBtn = (bg, color, bordered = false) => ({
  background: bg, color,
  border: bordered ? `1px solid ${C.mint}44` : "none",
  padding: "14px", borderRadius: 6,
  fontFamily: FB, fontSize: 15, cursor: "pointer",
});

function EditBar({ orders, onClose, onOpenOrder }) {
  const multi = orders.length > 1;
  const o     = orders[0];
  const rawTotal = typeof o.total === 'string' ? parseFloat(o.total.replace("$", "")) : (o.total ?? 0);
  const total    = !isNaN(rawTotal) ? rawTotal : 0;

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
    }}>
      <div style={{
        pointerEvents: "auto",
        background: "#2a2a2a", border: `2px solid ${C.mint}`,
        borderRadius: 10, padding: 14, minWidth: 260,
        boxShadow: "0 4px 24px rgba(0,0,0,0.55)",
        fontFamily: FB, color: C.mint,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: FH, fontSize: 16 }}>
              {multi ? `${orders.length} CHECKS` : (o.table || o.label || o.order_id || o.id)}
            </div>
            {!multi && (
              <div style={{ fontSize: 13, opacity: 0.35 }}>
                {o.guest_count ?? '—'} guest{o.guest_count !== 1 ? 's' : ''}
                {' · '}<span style={{ color: C.yellow }}>${total.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div onClick={onClose} style={{
            cursor: "pointer", fontSize: 18, fontWeight: "bold",
            width: 28, height: 28, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "50%", background: "#1a1a1a",
          }}>✕</div>
        </div>
        {!multi ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => onOpenOrder && onOpenOrder(o)} style={eBtn(C.mint, C.bg)}>Open</button>
            <button style={eBtn(C.bg, C.mint, true)}>Print</button>
            <button style={{ ...eBtn("#FFD700", C.bg), gridColumn: "1 / 3" }}>Pay</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={eBtn(C.mint, C.bg)}>Merge</button>
            <button style={eBtn(C.bg, C.mint, true)}>Print All</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dialogs ─────────────────────────────────────────────────────────────────

function NewCheckDialog({ defaultSlot, onConfirm, onCancel }) {
  const [name, setName] = useState(defaultSlot || "");
  const [guests, setGuests] = useState(null);
  const ready = guests !== null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, border: `2px solid ${C.mint}`, borderRadius: 8, minWidth: 320, overflow: "hidden" }}>
        <div style={{ background: C.mint, color: C.bg, padding: "4px 12px", fontFamily: FH, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>NEW CHECK</span>
          <button onClick={onCancel} style={{ background: "transparent", border: "none", color: C.bg, fontFamily: FH, fontSize: 16, cursor: "pointer" }}>X</button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: C.mint, opacity: 0.7, fontFamily: FB }}>
              Table Name <span style={{ fontStyle: "italic" }}>(optional)</span>
            </label>
            <input
              style={{ background: "#222", border: `1px solid ${C.mint}`, color: C.mint, padding: "6px 8px", fontFamily: FB, fontSize: 14, borderRadius: 4, outline: "none" }}
              placeholder="e.g. T1, Bar 4, Patio 2..."
              value={name} onChange={e => setName(e.target.value)} maxLength={20}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, color: C.mint, opacity: 0.7, fontFamily: FB }}>Guests</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <button key={n} onClick={() => setGuests(n)} style={{
                  width: 48, height: 44, borderRadius: 8,
                  background: guests === n ? C.mint : C.bg,
                  color: guests === n ? C.bg : C.mint,
                  border: `1px solid ${C.mint}`, fontSize: 18, fontWeight: "bold",
                  fontFamily: FB, cursor: "pointer",
                }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onCancel} style={{ background: C.bg, color: C.mint, border: `1px solid ${C.mint}`, padding: "6px 14px", borderRadius: 8, fontFamily: FB, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button
              onClick={() => ready && onConfirm({ name: name.trim(), guests })}
              style={{
                background: ready ? C.mint : C.bg, color: ready ? C.bg : C.mint,
                border: `1px solid ${C.mint}`, padding: "6px 14px", borderRadius: 8,
                fontFamily: FB, fontSize: 14, fontWeight: "bold",
                cursor: ready ? "pointer" : "not-allowed", opacity: ready ? 1 : 0.4,
              }}
            >Open Check</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mock specials ────────────────────────────────────────────────────────────

const MOCK_SPECIALS = [
  { name: "Hamachi Crudo",  price: "$18", note: "chef's feature"   },
  { name: "Wagyu Striploin", price: "$52", note: "limited — 4 left" },
  { name: "Tuna Tartare",   price: "$22", note: "new menu item"    },
];

const TABLE_SLOTS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'];

// ─── Main component ───────────────────────────────────────────────────────────

export default function SnapshotScreen({ staff, orders, setOrders, onOpenOrder, setOffline, setScreen, menu }) {
  const [selected, setSelected]         = useState([]);
  const [newSlot, setNewSlot]           = useState(null); // null = closed, string = pre-filled slot
  const [messengerTab, setMessengerTab] = useState("RECV");
  const [hwStatus, setHwStatus]         = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/hardware/status`)
      .then(r => r.json())
      .then(setHwStatus)
      .catch(() => setHwStatus(null));
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const eightySixed = menu
    ? Object.values(menu).flat().filter(i => i.is_86d === true)
    : [];

  const serverId = staff?.id || staff?.name;
  const mine   = orders.filter(o => (o.server_id || o.server_name || o.server) === serverId);
  const theirs = orders.filter(o => (o.server_id || o.server_name || o.server) !== serverId);

  const sumTotal = (arr) => arr.reduce((s, o) => {
    const v = typeof o.total === 'string' ? parseFloat(o.total.replace("$", "")) : (o.total ?? 0);
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  const grossAll  = sumTotal(orders);
  const grossMine = sumTotal(mine);
  const serverSet = new Set(orders.map(o => o.server_id || o.server_name || o.server).filter(Boolean));

  const selectedOrders = orders.filter(o => selected.includes(o.order_id || o.id));
  const isManager = staff?.role === "manager";

  // T1–T9 slot map — keyed by order.table
  const slotMap = {};
  orders.forEach(o => {
    const t = o.table || o.label;
    if (t && TABLE_SLOTS.includes(t)) slotMap[t] = o;
  });

  // Orders not mapped to a named slot (overflow)
  const overflowOrders = orders.filter(o => {
    const t = o.table || o.label;
    return !t || !TABLE_SLOTS.includes(t);
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const toggleCheck = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const createCheck = async ({ name, guests }) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: name || null, table: name || null, guest_count: guests, server_id: staff.id }),
      });
      const newOrder = await res.json();
      setOrders(o => [...o, newOrder]);
      setNewSlot(null);
      onOpenOrder(newOrder);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{
      flex: 1, display: "grid",
      gridTemplateColumns: "278px 408px 278px",
      gap: 15, padding: 15,
      overflow: "hidden", minHeight: 0, boxSizing: "border-box",
    }}>

      {/* ════════════════ LEFT COLUMN ════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>

        {/* SHIFT OVERVIEW */}
        <Card title="SHIFT OVERVIEW">
          {isManager ? (
            // ── Manager: aggregate stats + sparkline + specials + 86 list
            <>
              {[
                ["GROSS SALES",  `$${grossAll.toFixed(2)}`,    C.yellow],
                ["OPEN CHECKS",  String(orders.length),        C.mint  ],
                ["SERVERS ON",   String(serverSet.size),       C.mint  ],
              ].map(([k, v, col]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: col }}>{v}</span>
                </div>
              ))}

              <SectionDivider label="SALES — TODAY vs LAST WK" />
              <Sparkline today={MOCK_TODAY_SPARK} lastWeek={MOCK_LW_SPARK} />

              <SectionDivider label="SPECIALS" />
              {MOCK_SPECIALS.map(s => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: C.yellow, fontWeight: "bold" }}>{s.price}</span>
                </div>
              ))}

              <SectionDivider label={eightySixed.length > 0 ? `86 LIST — ${eightySixed.length}` : "86 LIST — CLEAR"} />
              {eightySixed.length === 0 ? (
                <div style={{ fontSize: 10, opacity: 0.4, fontStyle: "italic" }}>ALL ITEMS AVAILABLE</div>
              ) : eightySixed.map(item => (
                <div key={item.item_id || item.name} style={{ fontSize: 11, color: C.red, fontWeight: "bold", marginBottom: 2 }}>
                  {item.name}
                </div>
              ))}
            </>
          ) : (
            // ── Server: personal stats + specials + 86 list
            <>
              {[
                ["Opened",     "08:15 AM",                C.mint  ],
                ["My Checks",  String(mine.length),        C.mint  ],
                ["My Gross",   `$${grossMine.toFixed(2)}`, C.yellow],
                ["Open Floor", String(orders.length),      C.mint  ],
              ].map(([k, v, col]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ opacity: 0.6 }}>{k}</span>
                  <span style={{ fontWeight: "bold", color: col }}>{v}</span>
                </div>
              ))}

              <SectionDivider label="TONIGHT'S SPECIALS" />
              {MOCK_SPECIALS.length > 0 ? MOCK_SPECIALS.map(s => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11 }}>• {s.name}</span>
                  <span style={{ fontSize: 11, color: C.yellow, fontWeight: "bold" }}>{s.price}</span>
                </div>
              )) : <div style={{ fontSize: 10, opacity: 0.4 }}>No specials tonight</div>}

              <SectionDivider label={eightySixed.length > 0 ? `86 LIST — ${eightySixed.length}` : "86 LIST — CLEAR"} />
              {eightySixed.length === 0 ? (
                <div style={{ fontSize: 10, opacity: 0.4, fontStyle: "italic" }}>All clear</div>
              ) : eightySixed.map(item => (
                <div key={item.item_id || item.name} style={{ fontSize: 11, color: C.red, fontWeight: "bold", marginBottom: 2 }}>
                  ✕ {item.name}
                </div>
              ))}
            </>
          )}
        </Card>

        {/* MESSENGER */}
        <Card title="MESSENGER">
          <div style={{ display: "flex", height: "100%", minHeight: 80 }}>
            <MessengerTabs
              tabs={isManager ? ["RECV", "SENT", "ALERTS"] : ["SENT", "ALERTS"]}
              active={messengerTab}
              onChange={setMessengerTab}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: 6, overflow: "hidden" }}>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {messengerTab === "RECV"   && <div style={{ opacity: 0.4, fontSize: 11, fontStyle: "italic" }}>No new messages</div>}
                {messengerTab === "SENT"   && <div style={{ opacity: 0.4, fontSize: 11, fontStyle: "italic" }}>No sent messages</div>}
                {messengerTab === "ALERTS" && <div style={{ opacity: 0.4, fontSize: 11, fontStyle: "italic" }}>No alerts</div>}
              </div>
              {isManager && (
                <div style={{ paddingTop: 4, borderTop: `1px solid ${C.mint}22`, flexShrink: 0 }}>
                  <button style={{
                    width: "100%", fontSize: 11, padding: "3px 0",
                    background: C.mint, color: C.bg, border: "none",
                    borderRadius: 3, cursor: "pointer", fontFamily: FB,
                  }}>Post Alert</button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ════════════════ CENTER COLUMN ════════════════ */}
      <div style={{
        border: `2px solid ${C.mint}`, borderRadius: 8,
        display: "flex", flexDirection: "column",
        background: C.bg, position: "relative", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: C.mint, color: C.bg, fontFamily: FH, fontSize: 14,
          padding: "0 10px", minHeight: 27, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTopLeftRadius: 6, borderTopRightRadius: 6,
        }}>
          <span>CHECK OVERVIEW</span>
          <span style={{ fontFamily: FB, fontSize: 12, opacity: 0.55 }}>{'</>'}</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* MY CHECKS — fixed 3×3 grid */}
          <div>
            <div style={{ fontFamily: FH, fontSize: 11, color: C.mint, marginBottom: 8, letterSpacing: 1 }}>
              MY CHECKS — {mine.length}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 78px)",
              gridTemplateRows: "repeat(3, 77px)",
              gap: "11px 36px",
              justifyContent: "center",
            }}>
              {TABLE_SLOTS.map(slot => {
                const order = slotMap[slot];
                if (!order) {
                  return <EmptySlot key={slot} slot={slot} onClick={() => setNewSlot(slot)} />;
                }
                const id = order.order_id || order.id;
                const isMine = (order.server_id || order.server_name || order.server) === serverId;
                return (
                  <div key={slot} style={{ opacity: isMine ? 1 : 0.45 }}>
                    <TableTile
                      order={order}
                      selected={selected.includes(id)}
                      onToggle={() => toggleCheck(id)}
                      onRightClick={() => onOpenOrder(order)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* FLOOR — overflow orders not in T1–T9 */}
          {(theirs.length > 0 || overflowOrders.length > 0) && (
            <div>
              <div style={{
                fontFamily: FH, fontSize: 11, color: C.mint, marginBottom: 8,
                letterSpacing: 1, borderTop: `1px solid ${C.mint}33`, paddingTop: 12,
              }}>
                FLOOR — {theirs.length + overflowOrders.filter(o => {
                  const sid = o.server_id || o.server_name || o.server;
                  return sid !== serverId;
                }).length}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, opacity: 0.5 }}>
                {[...theirs, ...overflowOrders.filter(o => {
                  const sid = o.server_id || o.server_name || o.server;
                  return sid !== serverId;
                })].map(o => {
                  const id = o.order_id || o.id;
                  return (
                    <TableTile
                      key={id}
                      order={o}
                      selected={selected.includes(id)}
                      onToggle={() => toggleCheck(id)}
                      onRightClick={() => onOpenOrder(o)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {selectedOrders.length > 0 && (
          <EditBar
            orders={selectedOrders}
            onClose={() => setSelected([])}
            onOpenOrder={onOpenOrder}
          />
        )}
      </div>

      {/* ════════════════ RIGHT COLUMN ════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>

        {/* REPORTING */}
        <Card title="REPORTING">
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 3, fontFamily: FH, letterSpacing: 1 }}>HOURLY SALES</div>
            <HourlyBars data={MOCK_HOURLY} />
          </div>

          {/* Sales Report nav */}
          <div
            onClick={() => setScreen('sales-reporting')}
            style={{
              fontSize: 11, cursor: "pointer",
              padding: "4px 0", borderBottom: `1px solid ${C.mint}22`,
              marginBottom: 3,
            }}
          >
            Sales Report →
          </div>

          {/* Settle Batch */}
          <div
            onClick={() => setScreen('batch-settle')}
            style={{
              display: "flex", justifyContent: "space-between",
              cursor: "pointer", padding: "4px 0",
              borderBottom: `1px solid ${C.mint}22`, marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 11 }}>Settle Batch</span>
            <span style={{ fontSize: 11, color: C.yellow, fontWeight: "bold" }}>0/{orders.length}</span>
          </div>

          {/* Role-split CTA */}
          <button
            onClick={() => setScreen(isManager ? 'close-day' : 'batch-settle')}
            style={{
              width: "100%", padding: "6px 0",
              background: C.bg, color: C.mint,
              border: `1px solid ${C.mint}`, borderRadius: 6,
              fontFamily: FB, fontSize: 12, cursor: "pointer",
            }}
          >
            {isManager ? "Close Day" : "Checkout"}
          </button>
        </Card>

        {/* HARDWARE */}
        <Card title="HARDWARE">
          {(() => {
            // Build a unified device list from hwStatus or fallback
            const devices = hwStatus ? [
              ...(hwStatus.printers
                ? Object.entries(hwStatus.printers).map(([name, status]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    ok: ["ok","online"].includes(String(status).toLowerCase()),
                    detail: String(status),
                  }))
                : [{ name: "Printers", ok: true, detail: "2 online" }]),
              hwStatus.terminal
                ? { name: "Payment",  ok: String(hwStatus.terminal).toLowerCase() === "online", detail: String(hwStatus.terminal) }
                : null,
              { name: "Network", ok: true, detail: "LAN active" },
            ].filter(Boolean) : [
              { name: "Printers", ok: true,  detail: "2 online"      },
              { name: "Payment",  ok: true,  detail: "Dejavoo ready" },
              { name: "Network",  ok: true,  detail: "LAN active"    },
            ];

            return devices.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 7 }}>
                <span style={{ fontSize: 16, color: d.ok ? "#44FF88" : C.red }}>{d.ok ? "●" : "✕"}</span>
                <span>{d.name}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.5 }}>{d.detail}</span>
              </div>
            ));
          })()}
          <div
            onClick={() => setScreen('hardware')}
            style={{ fontSize: 10, opacity: 0.4, cursor: "pointer", marginTop: 4 }}
          >
            Hardware settings →
          </div>
        </Card>
      </div>

      {/* New check dialog */}
      {newSlot !== null && (
        <NewCheckDialog
          defaultSlot={newSlot}
          onConfirm={createCheck}
          onCancel={() => setNewSlot(null)}
        />
      )}
    </div>

    {/* Footer — Settings button (managers only) */}
    {isManager && (
      <div style={{
        flexShrink: 0,
        borderTop: `1px solid ${C.mint}22`,
        display: "flex", justifyContent: "flex-end",
        padding: "4px 10px",
      }}>
        <button
          onClick={() => setScreen("settings")}
          style={{
            background: C.bg, color: C.mint,
            border: `1px solid ${C.mint}44`,
            padding: "4px 14px", borderRadius: 4,
            fontFamily: FB, fontSize: 11, cursor: "pointer",
          }}
        >⚙ Settings</button>
      </div>
    )}
    </div>
  );
}
