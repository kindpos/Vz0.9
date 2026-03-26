import { useState } from 'react';
import { API_BASE } from '../config';

const FH = "'Alien Encounters Solid Bold', sans-serif";
const FB = "'Sevastopol Interface', sans-serif";

const C = {
  bg: "#333333", mint: "#C6FFBB", yellow: "#FBDE42", red: "#E84040",
};

function Card({ title, expanded, onToggle, onNav, children }) {
  return (
    <div style={{
      border: `2px solid ${C.mint}`, borderRadius: 8,
      background: C.bg, overflow: "hidden", marginBottom: 8,
      display: "flex", flexDirection: "column",
      flex: expanded ? 1 : "0 0 auto",
      transition: "all 0.2s ease-in-out",
    }}>
      <div onClick={onNav || onToggle} style={{
        background: C.mint, color: C.bg, fontFamily: FH,
        padding: "0 10px", minHeight: 27,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", userSelect: "none",
        borderTopLeftRadius: 6, borderTopRightRadius: 6,
      }}>
        <span style={{ fontSize: 14 }}>{title}</span>
        <span onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
          width: 20, height: 20, display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: "bold", fontSize: 16,
        }}>{expanded ? "−" : "+"}</span>
      </div>
      {expanded && (
        <div style={{ padding: 8, color: C.mint, fontFamily: FB, fontSize: 12, flex: 1 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TableTile({ order, selected, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width: 78, height: 77,
      border: `2px solid ${C.mint}`,
      background: selected ? C.mint : C.bg,
      color: selected ? C.bg : C.mint,
      borderRadius: 8, cursor: "pointer",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      fontFamily: FB, userSelect: "none",
    }}>
      <span style={{ fontSize: 13, fontWeight: "bold" }}>{order.table || order.label || (order.order_id || order.id || '').replace("ORD-", "#")}</span>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{order.guest_count}g</span>
      <span style={{ fontSize: 10, color: selected ? C.bg : C.yellow, fontWeight: "bold" }}>
        {typeof order.total === 'number' ? "$" + order.total.toFixed(2) : order.total}
      </span>
    </div>
  );
}

function EditBar({ orders, onClose, onOpenOrder, onEdit }) {
  const multi = orders.length > 1;
  return (
    <div style={{
      background: C.mint, color: C.bg, padding: "6px 12px",
      fontFamily: FH, fontSize: 12,
      display: "flex", alignItems: "center", gap: 8,
      position: "absolute", bottom: 0, left: 0, right: 0,
    }}>
      <span style={{ flex: 1 }}>
        {multi ? `${orders.length} SELECTED` : `${orders[0].table || orders[0].label || orders[0].id}`}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        {!multi && <>
          <button onClick={() => onOpenOrder && onOpenOrder(orders[0])} style={editBtn}>OPEN</button>
          <button onClick={() => onEdit && onEdit(orders[0])} style={editBtn}>EDIT</button>
          <button style={editBtn}>PRINT</button>
          <button style={editBtn}>PAY</button>
        </>}
        {multi && <>
          <button style={editBtn}>MERGE</button>
          <button style={editBtn}>PRINT ALL</button>
        </>}
      </div>
      <button onClick={onClose} style={{ ...editBtn, background: C.red, color: C.bg, border: "none" }}>X</button>
    </div>
  );
}

const editBtn = {
  background: C.bg, color: C.mint, border: "none",
  padding: "4px 10px", fontFamily: FB, fontSize: 11,
  cursor: "pointer", borderRadius: 4,
};

function NewCheckDialog({ onConfirm, onCancel }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(null);
  const ready = guests !== null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, border: `2px solid ${C.mint}`, borderRadius: 8, minWidth: 320, overflow: "hidden" }}>
        <div style={{ background: C.mint, color: C.bg, padding: "4px 12px", fontFamily: FH, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>NEW CHECK</span>
          <button onClick={onCancel} style={{ background: "transparent", border: "none", color: C.bg, fontFamily: FH, fontSize: 16, cursor: "pointer" }}>X</button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: C.mint, opacity: 0.7, fontFamily: FB }}>Table Name <span style={{ fontStyle: "italic" }}>(optional)</span></label>
            <input style={{ background: "#222", border: `1px solid ${C.mint}`, color: C.mint, padding: "6px 8px", fontFamily: FB, fontSize: 14, borderRadius: 4, outline: "none" }}
              placeholder="e.g. Window 2, Bar 4..." value={name} onChange={e => setName(e.target.value)} maxLength={20} />
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
            <button onClick={() => ready && onConfirm({ name: name.trim(), guests })} style={{
              background: ready ? C.mint : C.bg, color: ready ? C.bg : C.mint,
              border: `1px solid ${C.mint}`, padding: "6px 14px", borderRadius: 8,
              fontFamily: FB, fontSize: 14, fontWeight: "bold",
              cursor: ready ? "pointer" : "not-allowed", opacity: ready ? 1 : 0.4,
            }}>Open Check</button>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: C.bg, border: `2px solid ${C.mint}`, borderRadius: 8, minWidth: 300, overflow: "hidden" }}>
        <div style={{ background: C.mint, color: C.bg, padding: "4px 12px", fontFamily: FH, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>EDIT — {order.id}</span>
          <button onClick={onCancel} style={{ background: "transparent", border: "none", color: C.bg, fontFamily: FH, fontSize: 16, cursor: "pointer" }}>X</button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, color: C.mint, opacity: 0.7, fontFamily: FB }}>Table Name</label>
            <input style={{ background: "#222", border: `1px solid ${C.mint}`, color: C.mint, padding: "6px 8px", fontFamily: FB, fontSize: 14, borderRadius: 4, outline: "none" }}
              value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, color: C.mint, opacity: 0.7, fontFamily: FB }}>Guests</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={{ width: 40, height: 40, borderRadius: 8, background: C.bg, color: C.mint, border: `1px solid ${C.mint}`, fontSize: 20, fontWeight: "bold", cursor: "pointer" }}>−</button>
              <span style={{ fontSize: 22, fontWeight: "bold", color: C.mint, fontFamily: FB, minWidth: 30, textAlign: "center" }}>{guests}</span>
              <button onClick={() => setGuests(g => Math.min(20, g + 1))} style={{ width: 40, height: 40, borderRadius: 8, background: C.bg, color: C.mint, border: `1px solid ${C.mint}`, fontSize: 20, fontWeight: "bold", cursor: "pointer" }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onCancel} style={{ background: C.bg, color: C.mint, border: `1px solid ${C.mint}`, padding: "6px 14px", borderRadius: 8, fontFamily: FB, fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => onConfirm({ ...order, label: name.trim(), guest_count: guests })} style={{ background: C.mint, color: C.bg, border: "none", padding: "6px 14px", borderRadius: 8, fontFamily: FB, fontSize: 14, fontWeight: "bold", cursor: "pointer" }}>Save</button>
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
    } catch {
      setOffline(true);
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
    } catch {
      setOffline(true);
    }
  };

  const selectedOrders = orders.filter(o => selected.includes(o.order_id || o.id));
  const gross = orders.reduce((sum, o) => {
    const val = typeof o.total === 'string' ? parseFloat(o.total.replace("$", "")) : o.total;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const mine = orders.filter(o => (o.server_name || o.server) === staff.name);
  const theirs = orders.filter(o => (o.server_name || o.server) !== staff.name);

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "278px 1fr 278px", gap: 15, padding: "15px 15px", overflow: "hidden" }}>
      {/* LEFT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {staff.role === "manager" ? <>
          <Card title="MENU CONFIG" expanded={leftA} onToggle={() => setLeftA(v => !v)} onNav={() => setScreen("menu-config")}>
            <div style={{ opacity: 0.6 }}>Items, modifiers, pricing</div>
          </Card>
          <Card title="LABOR" expanded={leftB} onToggle={() => setLeftB(v => !v)} onNav={() => setScreen("labor-reporting")}>
            <div style={{ opacity: 0.6 }}>Clock-in/out, hours, cost %</div>
          </Card>
        </> : <>
          <Card title="SHIFT OVERVIEW" expanded={leftA} onToggle={() => setLeftA(v => !v)}>
            {[["Opened", "08:15 AM"], ["Orders", String(mine.length)], ["Gross", `$${gross.toFixed(2)}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ opacity: 0.6 }}>{k}</span><span style={{ fontWeight: "bold", color: k === "Gross" ? C.yellow : C.mint }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card title="MESSENGER" expanded={leftB} onToggle={() => setLeftB(v => !v)} onNav={() => setScreen("messenger")}>
            <div style={{ opacity: 0.6 }}>No messages</div>
          </Card>
        </>}
      </div>

      {/* CENTER COLUMN */}
      <div style={{ border: `2px solid ${C.mint}`, borderRadius: 8, display: "flex", flexDirection: "column", background: C.bg, position: "relative", overflow: "hidden" }}>
        <div style={{
          background: C.mint, color: C.bg, fontFamily: FH, fontSize: 14,
          padding: "0 10px", minHeight: 27, display: "flex", alignItems: "center",
          justifyContent: "space-between", borderTopLeftRadius: 6, borderTopRightRadius: 6,
        }}>
          <span>CHECK OVERVIEW</span>
          <span style={{ fontFamily: FB, fontSize: 12 }}>{mine.length} open</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column" }}>
          {/* My Checks grid */}
          <div style={{ fontFamily: FH, fontSize: 11, color: C.mint, marginBottom: 8, letterSpacing: 1 }}>
            MY CHECKS — {mine.length}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: theirs.length ? 16 : 0 }}>
            {mine.map(o => (
              <TableTile key={o.order_id || o.id} order={o} selected={selected.includes(o.order_id || o.id)} onToggle={() => toggleCheck(o.order_id || o.id)} />
            ))}
            <div onClick={() => setShowNew(true)} style={{
              width: 78, height: 77, border: `2px dashed ${C.mint}`, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.mint, fontSize: 28, opacity: 0.5, userSelect: "none",
            }}>+</div>
          </div>

          {theirs.length > 0 && <>
            <div style={{ fontFamily: FH, fontSize: 11, color: C.mint, marginBottom: 8, letterSpacing: 1, borderTop: `1px solid ${C.mint}33`, paddingTop: 12 }}>
              FLOOR — {theirs.length}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, opacity: 0.5 }}>
              {theirs.map(o => (
                <TableTile key={o.order_id || o.id} order={o} selected={selected.includes(o.order_id || o.id)} onToggle={() => toggleCheck(o.order_id || o.id)} />
              ))}
            </div>
          </>}
        </div>

        {selectedOrders.length > 0 && (
          <EditBar orders={selectedOrders} onClose={() => setSelected([])} onOpenOrder={onOpenOrder} onEdit={o => setEditTarget(o)} />
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {staff.role === "manager" ? <>
          <Card title="REPORTING" expanded={rightA} onToggle={() => setRightA(v => !v)} onNav={() => setScreen("sales-reporting")}>
            <div style={{ opacity: 0.6 }}>Daily, weekly, period reports</div>
          </Card>
          <Card title="HARDWARE" expanded={rightB} onToggle={() => setRightB(v => !v)} onNav={() => setScreen("hardware")}>
            <div style={{ opacity: 0.6 }}>Printer, terminal, network</div>
          </Card>
        </> : <>
          <Card title="REPORTING" expanded={rightA} onToggle={() => setRightA(v => !v)} onNav={() => setScreen("sales-reporting")}>
            <div style={{ opacity: 0.6 }}>Your shift summary</div>
          </Card>
          <Card title="HARDWARE" expanded={rightB} onToggle={() => setRightB(v => !v)} onNav={() => setScreen("hardware")}>
            <div style={{ opacity: 0.6 }}>Printer, display</div>
          </Card>
        </>}

        {/* 86 LIST */}
        <div style={{ border: `2px solid ${C.mint}`, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
          <div onClick={() => setRightC(v => !v)} style={{
            background: "#1a1a1a", color: C.mint, padding: "0 10px", minHeight: 27,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", userSelect: "none", fontFamily: FH, fontSize: 14,
            borderBottom: rightC ? `1px solid ${C.mint}` : "none",
          }}>
            <span>86 LIST</span>
            <span style={{ fontSize: 16, fontWeight: "bold" }}>{rightC ? "−" : "+"}</span>
          </div>
          {rightC && (
            <div style={{ padding: 8, background: "#1a1a1a" }}>
              {eightySixed.length === 0 ? (
                <div style={{ fontSize: 11, color: C.mint, opacity: 0.4, fontStyle: "italic", fontFamily: FB }}>ALL ITEMS AVAILABLE</div>
              ) : (
                eightySixed.map(item => (
                  <div key={item.item_id || item.name} style={{ fontSize: 11, color: C.red, fontWeight: "bold", fontFamily: FB, marginBottom: 2 }}>
                    {item.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto" }}>
          <button onClick={() => setScreen("close-day")} style={{
            width: "100%", padding: "8px", background: C.bg, color: C.mint,
            border: `1px solid ${C.mint}`, borderRadius: 8, fontFamily: FB,
            fontSize: 13, cursor: "pointer",
          }}>Close Day</button>
        </div>
      </div>

      {showNew && <NewCheckDialog onConfirm={createCheck} onCancel={() => setShowNew(false)} />}
      {editTarget && <GuestEditDialog order={editTarget} onConfirm={saveEdit} onCancel={() => setEditTarget(null)} />}
    </div>
  );
}
