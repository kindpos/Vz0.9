import { useState, useMemo } from 'react';
import { API_BASE, FALLBACK_ROSTER } from '../config';

const C = {
  gray: "#c0c0c0", dg: "#808080", navy: "#000080", blue: "#1084d0",
  white: "#fff", black: "#000", mint: "#c6ffbb", yellow: "#fbde42", softred: "#ff6b6b",
};
const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;

const T = {
  btn: { background: C.gray, border: "2px solid", borderColor: RAISED, padding: "4px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", minWidth: 80, color: C.black, whiteSpace: "nowrap", lineHeight: 1.2 },
  inp: { border: "2px solid", borderColor: SUNKEN, background: C.white, padding: "2px 4px", fontSize: 11, fontFamily: "inherit", outline: "none" },
  tbtn: { width: 16, height: 14, background: C.gray, border: "2px solid", borderColor: RAISED, fontSize: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.black, padding: 0, lineHeight: 1, fontFamily: "inherit" },
};

function SideCard({ label, expanded, onToggle, onNav, children }) {
  return (
    <div style={{ border: "2px solid", borderColor: expanded ? SUNKEN : RAISED, marginBottom: 6, background: C.gray }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 8px", cursor: "pointer", userSelect: "none",
        background: expanded ? "#d4d0c8" : C.gray,
        borderBottom: expanded ? `1px solid ${C.dg}` : "none",
      }}>
        <span onClick={onNav || onToggle} style={{ fontWeight: "bold", fontSize: 11, flex: 1 }}>{label}</span>
        <span onClick={onToggle} style={{
          width: 16, height: 16, border: "2px solid", borderColor: expanded ? SUNKEN : RAISED,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, lineHeight: 1, fontWeight: "bold", background: C.gray,
          userSelect: "none",
        }}>{expanded ? "−" : "+"}</span>
      </div>
      {expanded && <div style={{ padding: "8px" }}>{children}</div>}
    </div>
  );
}

const CHECK_COLORS = { open: C.mint, printed: C.yellow, idle: C.softred };

function CheckBtn({ order, selected, onToggle }) {
  const bg = CHECK_COLORS[order.status] || C.white;
  return (
    <div onClick={onToggle} style={{
      width: 68, height: 68, border: "2px solid",
      borderColor: selected ? SUNKEN : RAISED,
      background: selected ? "#d4d0c8" : bg,
      cursor: "pointer", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2, userSelect: "none",
      boxShadow: selected ? `inset 1px 1px 2px ${C.dg}` : "none",
      outline: selected ? `2px solid ${C.navy}` : "none",
      outlineOffset: -2,
    }}>
      <span style={{ fontSize: 10, fontWeight: "bold", color: C.black }}>{order.label || order.id.replace("ORD-", "#")}</span>
      <span style={{ fontSize: 9, color: C.dg }}>{order.guest_count}g</span>
      <span style={{ fontSize: 9, fontWeight: "bold" }}>{order.total}</span>
    </div>
  );
}

function CheckPanel({ orders, onClose, onOpenOrder, onEdit }) {
  const multi = orders.length > 1;
  return (
    <div style={{
      borderTop: "2px solid", borderColor: RAISED,
      background: C.gray, padding: "8px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: "bold", fontSize: 11 }}>
          {multi ? `${orders.length} Checks Selected` : `Check ${orders[0].id}`}
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={onClose} style={{ ...T.btn, minWidth: 0, padding: "1px 6px", fontSize: 10, background: "#c00020", color: "#fff", borderColor: "#ff6060 #800010 #800010 #ff6060", fontWeight: "bold" }}>✕</button>
      </div>
      {!multi && (
        <div style={{ fontSize: 10, color: C.dg, marginBottom: 6 }}>
          {orders[0].server}  ·  {orders[0].guest_count} guest{orders[0].guest_count > 1 ? "s" : ""}  ·  {orders[0].elapsed}  ·  {orders[0].total}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {!multi && <>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }} onClick={() => onOpenOrder && onOpenOrder(orders[0])}>Open Check</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }} onClick={() => onEdit && onEdit(orders[0])}>Edit</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Print</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Payment</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Transfer</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10, color: "#990000" }}>Void</button>
        </>}
        {multi && <>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Merge Checks</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Print All</button>
          <button style={{ ...T.btn, minWidth: 0, padding: "3px 10px", fontSize: 10 }}>Close All</button>
        </>}
      </div>
    </div>
  );
}

function NewCheckDialog({ onConfirm, onCancel }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(null);
  const ready = guests !== null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.gray, border: "2px solid", borderColor: RAISED, minWidth: 300, boxShadow: `3px 3px 0 ${C.black}` }}>
        <div style={{ background: `linear-gradient(90deg,${C.navy},${C.blue})`, color: C.white, padding: "3px 8px", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", userSelect: "none" }}>
          <span>New Check</span>
          <button onClick={onCancel} style={{ ...T.tbtn, background: "#c00020", color: "#fff", borderColor: "#ff6060 #800010 #800010 #ff6060", fontWeight: "bold" }}>✕</button>
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, color: C.dg }}>Table Name <span style={{ fontStyle: "italic" }}>(optional)</span></label>
            <input style={{ ...T.inp, fontSize: 12 }} placeholder="e.g. Window 2, Bar 4…" value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: C.dg }}>Guests</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <button key={n} onClick={() => setGuests(n)} style={{ ...T.btn, width: 48, height: 40, padding: 0, minWidth: 0, fontSize: 15, fontWeight: "bold", background: guests === n ? C.navy : C.gray, color: guests === n ? C.white : C.black, borderColor: guests === n ? SUNKEN : RAISED }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onCancel} style={T.btn}>Cancel</button>
            <button onClick={() => ready && onConfirm({ name: name.trim(), guests })} style={{ ...T.btn, fontWeight: "bold", background: ready ? C.navy : C.gray, color: ready ? C.white : C.dg, borderColor: ready ? `#4060a0 #000060 #000060 #4060a0` : RAISED, cursor: ready ? "pointer" : "not-allowed" }}>Open Check  ▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestEditDialog({ order, onConfirm, onCancel }) {
  const [name, setName] = useState(order.label || "");
  const [guests, setGuests] = useState(order.guest_count);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.gray, border: "2px solid", borderColor: RAISED, minWidth: 280, boxShadow: `3px 3px 0 ${C.black}` }}>
        <div style={{ background: `linear-gradient(90deg,${C.navy},${C.blue})`, color: C.white, padding: "3px 8px", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: "bold", userSelect: "none" }}>
          <span>Edit — {order.id}</span>
          <button onClick={onCancel} style={{ ...T.tbtn, background: "#c00020", color: "#fff", borderColor: "#ff6060 #800010 #800010 #ff6060", fontWeight: "bold" }}>✕</button>
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10, color: C.dg }}>Table Name</label>
            <input style={{ ...T.inp, fontSize: 12 }} value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: C.dg }}>Guests</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={{ ...T.btn, minWidth: 0, width: 36, height: 36, padding: 0, fontSize: 18, fontWeight: "bold" }}>−</button>
              <span style={{ fontSize: 18, fontWeight: "bold", minWidth: 30, textAlign: "center" }}>{guests}</span>
              <button onClick={() => setGuests(g => Math.min(20, g + 1))} style={{ ...T.btn, minWidth: 0, width: 36, height: 36, padding: 0, fontSize: 18, fontWeight: "bold" }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onCancel} style={T.btn}>Cancel</button>
            <button onClick={() => onConfirm({ ...order, label: name.trim(), guest_count: guests })} style={{ ...T.btn, fontWeight: "bold" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SnapshotScreen({ staff, orders, setOrders, onOpenOrder, setOffline, setScreen, menu }) {
  const [leftA, setLeftA] = useState(true);
  const [leftB, setLeftB] = useState(false);
  const [rightA, setRightA] = useState(true);
  const [rightB, setRightB] = useState(false);
  const [rightC, setRightC] = useState(true);
  const [selected, setSelected] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const eightySixed = menu
    ? Object.values(menu).flat().filter(i => i.is_86d === true)
    : [];

  const toggleCheck = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const createCheck = async ({ name, guests }) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: name, guest_count: guests, server_id: staff.id })
      });
      const newOrder = await res.json();
      setOrders(o => [...o, newOrder]);
      setShowNew(false);
      onOpenOrder(newOrder);
      setOffline(false);
    } catch (e) {
      setOffline(true);
      // Fallback local create if needed? Spec says "start empty if offline" on login.
      // But for a new check, we probably need the ID from the backend.
    }
  };

  const saveEdit = async (updated) => {
    try {
      await fetch(`${API_BASE}/api/v1/orders/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      setOrders(o => o.map(x => x.id === updated.id ? updated : x));
      setEditTarget(null);
      setSelected([]);
      setOffline(false);
    } catch (e) {
      setOffline(true);
    }
  };

  const selectedOrders = orders.filter(o => selected.includes(o.id));
  const gross = orders.reduce((sum, o) => {
    const val = typeof o.total === 'string' ? parseFloat(o.total.replace("$", "")) : o.total;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* LEFT COLUMN */}
      <div style={{ width: 170, borderRight: `1px solid ${C.dg}`, padding: 6, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {staff.role === "manager" ? <>
          <SideCard label="Menu Configuration" expanded={leftA} onToggle={() => setLeftA(v => !v)} onNav={() => setScreen("menu-config")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Items, modifiers, pricing</div>
          </SideCard>
          <SideCard label="Labor Reporting" expanded={leftB} onToggle={() => setLeftB(v => !v)} onNav={() => setScreen("labor-reporting")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Clock-in/out, hours, cost %</div>
          </SideCard>
        </> : <>
          <SideCard label="Shift Overview" expanded={leftA} onToggle={() => setLeftA(v => !v)}>
            {[["Opened", "08:15 AM"], ["Orders", String(orders.filter(o => o.server === staff.name).length)], ["Gross", `$${gross.toFixed(2)}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                <span style={{ color: C.dg }}>{k}</span><span style={{ fontWeight: "bold" }}>{v}</span>
              </div>
            ))}
          </SideCard>
          <SideCard label="Messenger" expanded={leftB} onToggle={() => setLeftB(v => !v)} onNav={() => setScreen("messenger")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>No messages</div>
          </SideCard>
        </>}
      </div>

      {/* CENTER COLUMN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
          {(() => {
            const mine = orders.filter(o => o.server === staff.name);
            const theirs = orders.filter(o => o.server !== staff.name);
            const renderBtn = o => (
              <CheckBtn key={o.id} order={o} selected={selected.includes(o.id)} onToggle={() => toggleCheck(o.id)} />
            );
            return <>
              <div style={{ fontSize: 9, color: C.dg, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
                My Checks — {mine.length}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: theirs.length ? 14 : 0 }}>
                {mine.map(renderBtn)}
                <div onClick={() => setShowNew(true)} style={{
                  width: 68, height: 68, border: "2px dashed", borderColor: C.dg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: C.dg, fontSize: 22, fontWeight: "bold",
                  background: "transparent", userSelect: "none",
                }}>＋</div>
              </div>
              {theirs.length > 0 && <>
                <div style={{ fontSize: 9, color: C.dg, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase", borderTop: `1px solid ${C.dg}`, paddingTop: 10 }}>
                  Floor — {theirs.length}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, opacity: 0.6 }}>
                  {theirs.map(renderBtn)}
                </div>
              </>}
            </>;
          })()}
        </div>

        {selectedOrders.length > 0 && (
          <CheckPanel orders={selectedOrders} onClose={() => setSelected([])} onOpenOrder={onOpenOrder} onEdit={o => setEditTarget(o)} />
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ width: 170, borderLeft: `1px solid ${C.dg}`, padding: 6, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {staff.role === "manager" ? <>
          <SideCard label="Sales Reporting" expanded={rightA} onToggle={() => setRightA(v => !v)} onNav={() => setScreen("sales-reporting")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Daily, weekly, period reports</div>
          </SideCard>
          <SideCard label="Hardware & Settings" expanded={rightB} onToggle={() => setRightB(v => !v)} onNav={() => setScreen("hardware")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Printer, terminal, network</div>
          </SideCard>
        </> : <>
          <SideCard label="Reporting" expanded={rightA} onToggle={() => setRightA(v => !v)} onNav={() => setScreen("sales-reporting")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Your shift summary</div>
          </SideCard>
          <SideCard label="Hardware & Settings" expanded={rightB} onToggle={() => setRightB(v => !v)} onNav={() => setScreen("hardware")}>
            <div style={{ fontSize: 10, color: C.dg, fontStyle: "italic" }}>Printer, display</div>
          </SideCard>
        </>}

        {/* 86 LIST */}
        <div style={{ border: "2px solid", borderColor: C.mint, marginBottom: 6, background: C.gray }}>
          <div
            onClick={() => setRightC(v => !v)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "4px 8px", cursor: "pointer", userSelect: "none",
              background: "#1a1a1a",
              borderBottom: rightC ? `1px solid ${C.mint}` : "none",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: 11, color: C.mint, fontFamily: "'Sevastopol Interface', monospace", flex: 1 }}>
              86 List
            </span>
            <span style={{
              width: 16, height: 16, border: `1px solid ${C.mint}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, lineHeight: 1, fontWeight: "bold",
              background: "#1a1a1a", color: C.mint, userSelect: "none",
            }}>{rightC ? "−" : "+"}</span>
          </div>
          {rightC && (
            <div style={{ padding: "8px" }}>
              {eightySixed.length === 0 ? (
                <div style={{ fontSize: 10, color: C.mint, opacity: 0.45, fontStyle: "italic" }}>
                  ALL ITEMS AVAILABLE
                </div>
              ) : (
                eightySixed.map(item => (
                  <div key={item.item_id || item.name} style={{ fontSize: 10, color: C.softred, fontWeight: "bold", marginBottom: 2 }}>
                    {item.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <button onClick={() => setScreen("close-day")} style={{
            ...T.btn, width: "100%", minWidth: 0, padding: "5px 8px",
            fontSize: 10, textAlign: "center", color: C.black, cursor: "pointer",
            borderColor: RAISED,
          }}>Close Day</button>
        </div>
      </div>

      {showNew && <NewCheckDialog onConfirm={createCheck} onCancel={() => setShowNew(false)} />}
      {editTarget && <GuestEditDialog order={editTarget} onConfirm={saveEdit} onCancel={() => setEditTarget(null)} />}
    </div>
  );
}
