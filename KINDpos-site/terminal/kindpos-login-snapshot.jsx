import { useState } from "react";

// ─── Tokens ───────────────────────────────────────────────────────────────
const C = {
  gray:"#c0c0c0", dg:"#808080", navy:"#000080", blue:"#1084d0",
  white:"#fff", teal:"#008080", black:"#000", green:"#006400",
  mint:"#c6ffbb", yellow:"#fbde42", softred:"#ff6b6b",
};
const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;

// ─── Base Styles ──────────────────────────────────────────────────────────
const T = {
  desk:  { background:C.teal, minHeight:"100vh", fontFamily:"'MS Sans Serif',Tahoma,sans-serif", fontSize:11, color:C.black, padding:8, display:"flex", flexDirection:"column", gap:6, boxSizing:"border-box" },
  win:   { background:C.gray, border:"2px solid", borderColor:RAISED, flex:1, display:"flex", flexDirection:"column", boxShadow:`2px 2px 0 ${C.black}` },
  tbar:  { background:`linear-gradient(90deg,${C.navy},${C.blue})`, color:C.white, padding:"3px 6px", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, fontWeight:"bold", userSelect:"none" },
  tbtn:  { width:16, height:14, background:C.gray, border:"2px solid", borderColor:RAISED, fontSize:8, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.black, padding:0, lineHeight:1, fontFamily:"inherit" },
  body:  { padding:12, flex:1, display:"flex", flexDirection:"column", gap:6, overflowY:"auto" },
  sbar:  { display:"flex", gap:2, padding:"2px 4px", borderTop:`2px solid ${C.dg}` },
  sp:    { border:"1px solid", borderColor:`${C.dg} ${C.white} ${C.white} ${C.dg}`, padding:"1px 6px", flex:1, fontSize:10, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" },
  nav:   { display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${C.dg}`, padding:"6px 12px", background:C.gray },
  btn:   { background:C.gray, border:"2px solid", borderColor:RAISED, padding:"4px 14px", cursor:"pointer", fontSize:11, fontFamily:"inherit", minWidth:80, color:C.black, whiteSpace:"nowrap", lineHeight:1.2 },
  inp:   { border:"2px solid", borderColor:SUNKEN, background:C.white, padding:"2px 4px", fontSize:11, fontFamily:"inherit", outline:"none" },
  grp:   { border:`1px solid ${C.dg}`, padding:"12px 8px 8px", margin:"2px 0 4px", position:"relative" },
  gl:    { position:"absolute", top:-7, left:8, background:C.gray, padding:"0 4px", fontSize:11 },
  sep:   { height:0, borderTop:`1px solid ${C.dg}`, borderBottom:`1px solid ${C.white}`, margin:"6px 0" },
  row:   { display:"flex", gap:8, alignItems:"center", marginBottom:4 },
  lbl:   { minWidth:100, fontSize:11 },
};

// ─── Primitives ───────────────────────────────────────────────────────────
const BAR_STYLE = { background:`linear-gradient(90deg,${C.navy},${C.blue})`, color:C.white, padding:"3px 8px", fontSize:10, userSelect:"none", display:"flex", alignItems:"center" };
const TBar = ({ greeting, onLogout }) => (
  <div style={BAR_STYLE}>
    <span style={{ opacity:0.85, letterSpacing:0.5 }}>03/25/2026  08:14 AM</span>
    {greeting && <><span style={{ flex:1 }}/><span style={{ opacity:0.9, fontStyle:"italic", letterSpacing:0.5 }}>{greeting}</span></>}
    {!greeting && <span style={{ flex:1 }}/>}
    {onLogout && (
      <button onClick={onLogout} style={{
        ...T.tbtn, width:18, height:16, fontSize:10, marginLeft:12,
        background:"#c00020", color:C.white, borderColor:`#ff6060 #800010 #800010 #ff6060`,
        fontWeight:"bold",
      }}>✕</button>
    )}
  </div>
);

const Btn = ({ children, onClick, bold, red, disabled, sx={} }) => (
  <button
    style={{ ...T.btn, ...(bold?{fontWeight:"bold"}:{}), ...(red?{color:"#990000"}:{}), ...(disabled?{color:C.dg,cursor:"default"}:{}), ...sx }}
    onClick={disabled ? undefined : onClick}
  >{children}</button>
);

const Grp = ({ label, children, sx={} }) => (
  <div style={{...T.grp,...sx}}>
    <span style={T.gl}>{label}</span>
    {children}
  </div>
);

const Sep = () => <div style={T.sep}/>;
const SBar = () => <div style={BAR_STYLE}><span style={{ opacity:0.85, letterSpacing:1 }}>T-01 // Vz0.9</span><span style={{ flex:1 }}/><span style={{ fontWeight:"bold", letterSpacing:2 }}>KINDpos</span></div>;

// ─── Roster (mock) ────────────────────────────────────────────────────────
const ROSTER = [
  { id:"alex",   name:"Alex M.",   pin:"1234", role:"manager" },
  { id:"jordan", name:"Jordan K.", pin:"5678", role:"server"  },
  { id:"casey",  name:"Casey R.",  pin:"9012", role:"server"  },
];

// ─── Mock active orders ───────────────────────────────────────────────────
const MOCK_ORDERS = [];

const STATUS_COLOR = { open:C.mint, printed:C.yellow, idle:C.softred };
const STATUS_LABEL = { open:"● OPEN", printed:"● IN PROGRESS", idle:"⚠ IDLE" };

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 1: LOGIN
// ─────────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pin, setPin]     = useState("");
  const [error, setError] = useState("");
  const holdRef           = useState(null)[1];
  let   _holdTimer        = null;

  const press = (key) => {
    setError("");
    if (key === "CLR") { setPin(p => p.slice(0,-1)); return; }
    if (key === ">>>") { submit(); return; }
    if (pin.length < 6) setPin(p => p + key);
  };

  const submit = () => {
    const staff = ROSTER.find(r => r.pin === pin);
    if (!staff) { setError("PIN not recognised. Try again."); setPin(""); return; }
    onLogin(staff);
  };

  // Long-press handlers for CLR button
  const onClrDown = () => {
    _holdTimer = setTimeout(() => { setPin(""); setError(""); }, 600);
  };
  const onClrUp = () => { clearTimeout(_holdTimer); };

  const PAD = [["1","2","3"],["4","5","6"],["7","8","9"],["CLR","0",">>>"]];

  return (
    <>
      <div style={T.body}>
        {/* Header */}
        <div style={{ textAlign:"center", paddingTop:8 }}>
          <div style={{ fontSize:22, fontWeight:"bold", color:C.navy, letterSpacing:4 }}>KINDpos</div>
        </div>

        <Sep/>

        {/* Login panel — centered */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>

          {/* PIN dot display */}
          <div style={{ width:172 }}>
            <div style={{ border:"2px solid", borderColor:SUNKEN, background:C.white, height:36, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              {pin.length === 0
                ? <span style={{ color:C.dg, fontSize:10 }}>enter PIN</span>
                : Array.from({length:pin.length}).map((_,i) => (
                    <span key={i} style={{ fontSize:20, lineHeight:1, color:C.navy }}>●</span>
                  ))
              }
            </div>
            {error && (
              <div style={{ background:"#ffcccc", border:`1px solid #cc0000`, padding:"2px 6px", fontSize:10, marginTop:4, color:"#660000" }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Numpad */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:4 }}>
            {PAD.flat().map(key => {
              const isCLR = key === "CLR";
              const isENT = key === ">>>";
              return (
                <button
                  key={key}
                  onClick={() => press(key)}
                  onMouseDown={isCLR ? onClrDown : undefined}
                  onMouseUp={isCLR ? onClrUp : undefined}
                  onMouseLeave={isCLR ? onClrUp : undefined}
                  onTouchStart={isCLR ? onClrDown : undefined}
                  onTouchEnd={isCLR ? onClrUp : undefined}
                  style={{
                    ...T.btn,
                    width:56, height:48, padding:0, minWidth:0,
                    fontSize: isENT ? 11 : 16,
                    fontWeight:"bold",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: isCLR ? "#d4d0c8" : isENT ? C.navy : C.gray,
                    color: isENT ? C.white : C.black,
                    letterSpacing: isENT ? 1 : 0,
                  }}
                >{key}</button>
              );
            })}
          </div>

        </div>
      </div>

      <SBar/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 2: SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────

// Greeting helper
function greeting(name) {
  const h = new Date().getHours();
  const tod = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  return `// ${tod}, ${name}`;
}

// Simple side-panel expandable card
function SideCard({ label, expanded, onToggle, children }) {
  return (
    <div style={{ border:"2px solid", borderColor: expanded ? SUNKEN : RAISED, marginBottom:6, background:C.gray }}>
      <div onClick={onToggle} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"4px 8px", cursor:"pointer", userSelect:"none",
        background: expanded ? "#d4d0c8" : C.gray,
        borderBottom: expanded ? `1px solid ${C.dg}` : "none",
      }}>
        <span style={{ fontWeight:"bold", fontSize:11 }}>{label}</span>
        <span style={{
          width:16, height:16, border:"2px solid", borderColor: expanded ? SUNKEN : RAISED,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, lineHeight:1, fontWeight:"bold", background:C.gray,
          userSelect:"none",
        }}>{expanded ? "−" : "+"}</span>
      </div>
      {expanded && <div style={{ padding:"8px" }}>{children}</div>}
    </div>
  );
}

// Check grid button
const CHECK_COLORS = { open:C.mint, printed:C.yellow, idle:C.softred };

function CheckBtn({ order, selected, onToggle }) {
  const bg = CHECK_COLORS[order.status] || C.white;
  return (
    <div onClick={onToggle} style={{
      width:68, height:68, border:"2px solid",
      borderColor: selected ? SUNKEN : RAISED,
      background: selected ? "#d4d0c8" : bg,
      cursor:"pointer", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:2, userSelect:"none",
      boxShadow: selected ? `inset 1px 1px 2px ${C.dg}` : "none",
      outline: selected ? `2px solid ${C.navy}` : "none",
      outlineOffset:-2,
    }}>
      <span style={{ fontSize:10, fontWeight:"bold", color:C.black }}>{order.label || order.id.replace("ORD-","#")}</span>
      <span style={{ fontSize:9, color:C.dg }}>{order.guest_count}g</span>
      <span style={{ fontSize:9, fontWeight:"bold" }}>{order.total}</span>
    </div>
  );
}

// Bottom check-action panel
function CheckPanel({ orders, onClose, onOpenOrder, onEdit }) {
  const multi = orders.length > 1;
  return (
    <div style={{
      borderTop:"2px solid", borderColor:RAISED,
      background:C.gray, padding:"8px 10px",
      animation:"slideUp 0.12s ease-out",
    }}>
      <div style={{ display:"flex", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontWeight:"bold", fontSize:11 }}>
          {multi ? `${orders.length} Checks Selected` : `Check ${orders[0].id}`}
        </span>
        <span style={{ flex:1 }}/>
        <button onClick={onClose} style={{ ...T.btn, minWidth:0, padding:"1px 6px", fontSize:10, background:"#c00020", color:"#fff", borderColor:"#ff6060 #800010 #800010 #ff6060", fontWeight:"bold" }}>✕</button>
      </div>
      {!multi && (
        <div style={{ fontSize:10, color:C.dg, marginBottom:6 }}>
          {orders[0].server}  ·  {orders[0].guest_count} guest{orders[0].guest_count>1?"s":""}  ·  {orders[0].elapsed}  ·  {orders[0].total}
        </div>
      )}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        {!multi && <>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }} onClick={() => onOpenOrder && onOpenOrder(orders[0])}>Open Check</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }} onClick={() => onEdit && onEdit(orders[0])}>Edit</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Print</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Payment</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Transfer</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10, color:"#990000" }}>Void</button>
        </>}
        {multi && <>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Merge Checks</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Print All</button>
          <button style={{ ...T.btn, minWidth:0, padding:"3px 10px", fontSize:10 }}>Close All</button>
        </>}
      </div>
    </div>
  );
}

// ── New Check Dialog ─────────────────────────────────────────────────────
function NewCheckDialog({ staff, onConfirm, onCancel }) {
  const [name,   setName]   = useState("");
  const [guests, setGuests] = useState(null);
  const ready = guests !== null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:C.gray, border:"2px solid", borderColor:RAISED, minWidth:300, boxShadow:`3px 3px 0 ${C.black}` }}>
        <div style={{ background:`linear-gradient(90deg,${C.navy},${C.blue})`, color:C.white, padding:"3px 8px", display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:"bold", userSelect:"none" }}>
          <span>New Check</span>
          <button onClick={onCancel} style={{ ...T.tbtn, background:"#c00020", color:"#fff", borderColor:"#ff6060 #800010 #800010 #ff6060", fontWeight:"bold" }}>✕</button>
        </div>
        <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:10, color:C.dg }}>Table Name <span style={{ fontStyle:"italic" }}>(optional)</span></label>
            <input style={{ ...T.inp, fontSize:12 }} placeholder="e.g. Window 2, Bar 4…" value={name} onChange={e => setName(e.target.value)} maxLength={20}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:10, color:C.dg }}>Guests</label>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {[1,2,3,4,5,6,7,8].map(n => (
                <button key={n} onClick={() => setGuests(n)} style={{ ...T.btn, width:48, height:40, padding:0, minWidth:0, fontSize:15, fontWeight:"bold", background:guests===n?C.navy:C.gray, color:guests===n?C.white:C.black, borderColor:guests===n?SUNKEN:RAISED }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginTop:4 }}>
            <button onClick={onCancel} style={T.btn}>Cancel</button>
            <button onClick={() => ready && onConfirm({ name: name.trim(), guests })} style={{ ...T.btn, fontWeight:"bold", background:ready?C.navy:C.gray, color:ready?C.white:C.dg, borderColor:ready?`#4060a0 #000060 #000060 #4060a0`:RAISED, cursor:ready?"pointer":"not-allowed" }}>Open Check  ▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Guest Edit Dialog ─────────────────────────────────────────────────────
function GuestEditDialog({ order, onConfirm, onCancel }) {
  const [name,   setName]   = useState(order.label || "");
  const [guests, setGuests] = useState(order.guest_count);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:C.gray, border:"2px solid", borderColor:RAISED, minWidth:280, boxShadow:`3px 3px 0 ${C.black}` }}>
        <div style={{ background:`linear-gradient(90deg,${C.navy},${C.blue})`, color:C.white, padding:"3px 8px", display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:"bold", userSelect:"none" }}>
          <span>Edit — {order.id}</span>
          <button onClick={onCancel} style={{ ...T.tbtn, background:"#c00020", color:"#fff", borderColor:"#ff6060 #800010 #800010 #ff6060", fontWeight:"bold" }}>✕</button>
        </div>
        <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <label style={{ fontSize:10, color:C.dg }}>Table Name</label>
            <input style={{ ...T.inp, fontSize:12 }} value={name} onChange={e => setName(e.target.value)} maxLength={20}/>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:10, color:C.dg }}>Guests</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={() => setGuests(g => Math.max(1,g-1))} style={{ ...T.btn, minWidth:0, width:36, height:36, padding:0, fontSize:18, fontWeight:"bold" }}>−</button>
              <span style={{ fontSize:18, fontWeight:"bold", minWidth:30, textAlign:"center" }}>{guests}</span>
              <button onClick={() => setGuests(g => Math.min(20,g+1))} style={{ ...T.btn, minWidth:0, width:36, height:36, padding:0, fontSize:18, fontWeight:"bold" }}>+</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end", marginTop:4 }}>
            <button onClick={onCancel} style={T.btn}>Cancel</button>
            <button onClick={() => onConfirm({ ...order, label: name.trim(), guest_count: guests })} style={{ ...T.btn, fontWeight:"bold" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapshotScreen({ staff, onLogout, onOpenOrder, orders, setOrders }) {
  const [leftA,  setLeftA]  = useState(true);
  const [leftB,  setLeftB]  = useState(false);
  const [rightA, setRightA] = useState(true);
  const [rightB, setRightB] = useState(false);
  const [rightC, setRightC] = useState(false);
  const [rightD, setRightD] = useState(false);
  const [selected,   setSelected]   = useState([]);
  const [showNew,    setShowNew]    = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const toggleCheck = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const createCheck = ({ name, guests }) => {
    const nextId = String(orders.length + 1).padStart(3,"0");
    const newOrder = { id:`ORD-${nextId}`, label:name||null, guest_count:guests, server:staff.name, status:"open", items:[], total:"$0.00", elapsed:"0:00" };
    setOrders(o => [...o, newOrder]);
    setShowNew(false);
    onOpenOrder(newOrder);
  };

  const saveEdit = (updated) => {
    setOrders(o => o.map(x => x.id === updated.id ? updated : x));
    setEditTarget(null);
    setSelected([]);
  };

  const selectedOrders = orders.filter(o => selected.includes(o.id));
  const gross = orders.reduce((sum, o) => sum + parseFloat(o.total.replace("$","")), 0);

  return (
    <>
      {/* ── 3-Column Body ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT COLUMN */}
        <div style={{ width:170, borderRight:`1px solid ${C.dg}`, padding:6, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {staff.role === "manager" ? <>
            <SideCard label="Menu Configuration" expanded={leftA} onToggle={() => setLeftA(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Items, modifiers, pricing</div>
            </SideCard>
            <SideCard label="Labor Reporting" expanded={leftB} onToggle={() => setLeftB(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Clock-in/out, hours, cost %</div>
            </SideCard>
          </> : <>
            <SideCard label="Shift Overview" expanded={leftA} onToggle={() => setLeftA(v=>!v)}>
              {[["Opened","08:15 AM"],["Orders","4"],["Gross",`$${gross.toFixed(2)}`],["Avg Ticket","$17.63"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
                  <span style={{ color:C.dg }}>{k}</span><span style={{ fontWeight:"bold" }}>{v}</span>
                </div>
              ))}
            </SideCard>
            <SideCard label="Messenger" expanded={leftB} onToggle={() => setLeftB(v=>!v)}>
              {ROSTER.map(r => (
                <div key={r.id} style={{ fontSize:10, marginBottom:3, display:"flex", justifyContent:"space-between" }}>
                  <span>{r.name}</span>
                  <span style={{ color:C.dg, fontSize:9, textTransform:"uppercase" }}>{r.role}</span>
                </div>
              ))}
            </SideCard>
          </>}
        </div>

        {/* CENTER COLUMN */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Check grid — scrollable */}
          <div style={{ flex:1, padding:10, overflowY:"auto" }}>
            {(() => {
              const mine  = orders.filter(o => o.server === staff.name);
              const theirs = orders.filter(o => o.server !== staff.name);
              const renderBtn = o => (
                <CheckBtn key={o.id} order={o} selected={selected.includes(o.id)} onToggle={() => toggleCheck(o.id)}/>
              );
              return <>
                {/* My checks */}
                <div style={{ fontSize:9, color:C.dg, marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>
                  My Checks — {mine.length}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom: theirs.length ? 14 : 0 }}>
                  {mine.map(renderBtn)}
                  <div onClick={() => setShowNew(true)} style={{
                    width:68, height:68, border:"2px dashed", borderColor:C.dg,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", color:C.dg, fontSize:22, fontWeight:"bold",
                    background:"transparent", userSelect:"none",
                  }}>＋</div>
                </div>
                {/* Other checks */}
                {theirs.length > 0 && <>
                  <div style={{ fontSize:9, color:C.dg, marginBottom:6, letterSpacing:1, textTransform:"uppercase", borderTop:`1px solid ${C.dg}`, paddingTop:10 }}>
                    Floor — {theirs.length}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, opacity:0.6 }}>
                    {theirs.map(renderBtn)}
                  </div>
                </>}
              </>;
            })()}
          </div>

          {/* Bottom check panel — rises when selection exists */}
          {selectedOrders.length > 0 && (
            <CheckPanel orders={selectedOrders} onClose={() => setSelected([])} onOpenOrder={onOpenOrder} onEdit={o => setEditTarget(o)}/>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ width:170, borderLeft:`1px solid ${C.dg}`, padding:6, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {staff.role === "manager" ? <>
            <SideCard label="Sales Reporting" expanded={rightA} onToggle={() => setRightA(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Daily, weekly, period reports</div>
            </SideCard>
            <SideCard label="Hardware & Settings" expanded={rightB} onToggle={() => setRightB(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Printer, terminal, network</div>
            </SideCard>
          </> : <>
            <SideCard label="Reporting" expanded={rightA} onToggle={() => setRightA(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Your shift summary</div>
            </SideCard>
            <SideCard label="Hardware & Settings" expanded={rightB} onToggle={() => setRightB(v=>!v)}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Printer, display</div>
            </SideCard>
          </>}
          <div style={{ marginTop:"auto", paddingTop:8 }}>
            <button disabled style={{
              ...T.btn, width:"100%", minWidth:0, padding:"5px 8px",
              fontSize:10, textAlign:"center", color:C.dg, cursor:"not-allowed",
              borderColor:`${C.dg} ${C.white} ${C.white} ${C.dg}`,
            }}>Close Day</button>
          </div>
        </div>

      </div>

      <SBar/>
      {showNew    && <NewCheckDialog  staff={staff} onConfirm={createCheck} onCancel={() => setShowNew(false)}/>}
      {editTarget && <GuestEditDialog order={editTarget} onConfirm={saveEdit} onCancel={() => setEditTarget(null)}/>}
    </>
  );
}


// ─────────────────────────────────────────────────────────────────────────
// MOCK MENU DATA
// ─────────────────────────────────────────────────────────────────────────
const MENU = {
  "Mains":  [["Smash Burger","$12.00"],["Chicken Sand.","$11.00"],["Hot Dog","$8.00"],["Veggie Wrap","$10.00"]],
  "Sides":  [["Waffle Fries","$5.00"],["Onion Rings","$5.00"],["Slaw","$4.00"],["Side Salad","$4.00"]],
  "Drinks": [["Lemonade","$4.00"],["Soda","$3.00"],["Water","$2.00"],["Iced Tea","$3.00"]],
  "Extras": [["Cheese +","$1.00"],["Bacon +","$2.00"],["Sauce","$0.50"],["Jalapeños","$0.50"]],
};

// ─────────────────────────────────────────────────────────────────────────
// ORDER SCREEN
// ─────────────────────────────────────────────────────────────────────────
function OrderScreen({ staff, order, onBack, onPayment, onSave }) {
  const [cat,      setCat]    = useState("Mains");
  const [items,    setItems]  = useState([]);
  const [selIdxs,  setSel]    = useState([]);          // multi-select indices
  const [guests,   setGuests] = useState(order.guest_count);

  // Toggle a line in/out of selection. Tap selected-only line → deselect all.
  const toggleSel = (idx) => {
    setSel(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  const addItem = (name, price) => {
    setItems(prev => {
      const ex = prev.findIndex(i => i.name === name);
      if (ex >= 0) {
        const n = [...prev]; n[ex] = { ...n[ex], qty: n[ex].qty + 1 }; return n;
      }
      return [...prev, { name, price: parseFloat(price.replace("$","")), qty:1, mod:"" }];
    });
    setSel([]);
  };

  const addQty = (idx) => setItems(prev => { const n=[...prev]; n[idx]={...n[idx],qty:n[idx].qty+1}; return n; });
  const remQty = (idx) => {
    setItems(prev => {
      const n=[...prev];
      if (n[idx].qty>1){ n[idx]={...n[idx],qty:n[idx].qty-1}; return n; }
      return n.filter((_,i)=>i!==idx);
    });
    setSel(s => s.filter(i => i!==idx));
  };
  const voidLines = (idxs) => {
    setItems(prev => prev.filter((_,i) => !idxs.includes(i)));
    setSel([]);
  };

  const subtotal = items.reduce((s,i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.085;
  const total    = subtotal + tax;

  const multiSel = selIdxs.length > 1;
  const singleSel = selIdxs.length === 1 ? selIdxs[0] : null;

  return (
    <>
      {/* Subheader — guests editable inline */}
      <div style={{ background:"#d4d0c8", borderBottom:`1px solid ${C.dg}`, padding:"3px 8px", display:"flex", gap:8, fontSize:10, alignItems:"center" }}>
        <span style={{ fontWeight:"bold" }}>Check: {order.label || order.id}</span>
        <span style={{ color:C.dg }}>·</span>
        {/* Inline guest adjuster */}
        <button onClick={() => setGuests(g => Math.max(1,g-1))} style={{ ...T.btn, minWidth:0, width:18, height:16, padding:0, fontSize:12, lineHeight:1 }}>−</button>
        <span style={{ fontWeight:"bold", minWidth:22, textAlign:"center" }}>{guests}</span>
        <button onClick={() => setGuests(g => Math.min(20,g+1))} style={{ ...T.btn, minWidth:0, width:18, height:16, padding:0, fontSize:12, lineHeight:1 }}>+</button>
        <span style={{ fontSize:9, color:C.dg }}>guest{guests!==1?"s":""}</span>
        <span style={{ color:C.dg }}>·</span>
        <span>{staff.name}</span>
        <span style={{ flex:1 }}/>
        <span style={{ color:C.dg, fontStyle:"italic" }}>{order.elapsed} elapsed</span>
      </div>

      {/* 3-zone body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── LEFT: Check View ── */}
        <div style={{ width:200, borderRight:`1px solid ${C.dg}`, display:"flex", flexDirection:"column" }}>
          <div style={{ background:"#d4d0c8", padding:"2px 8px", fontSize:9, letterSpacing:1, textTransform:"uppercase", color:C.dg, borderBottom:`1px solid ${C.dg}`, display:"flex", justifyContent:"space-between" }}>
            <span>Check</span>
            {selIdxs.length > 0 && <span style={{ color:C.navy, fontWeight:"bold" }}>{selIdxs.length} selected</span>}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:4, fontFamily:"monospace", fontSize:11 }}>
            {items.length === 0
              ? <div style={{ color:C.dg, fontSize:10, fontStyle:"italic", padding:8 }}>No items yet</div>
              : items.map((item, idx) => {
                  const sel = selIdxs.includes(idx);
                  return (
                    <div key={idx} onClick={() => toggleSel(idx)} style={{
                      display:"flex", gap:4, padding:"4px 4px", marginBottom:1, cursor:"pointer",
                      background: sel ? C.navy : "transparent",
                      color: sel ? C.white : C.black,
                      border: sel ? `1px solid ${C.navy}` : "1px solid transparent",
                      userSelect:"none",
                    }}>
                      <span style={{ minWidth:18, color: sel ? "#aad" : C.dg }}>{item.qty}×</span>
                      <span style={{ flex:1, fontSize:10 }}>{item.name}{item.mod ? <span style={{ fontSize:9, color:sel?"#adf":"#888" }}> {item.mod}</span> : null}</span>
                      <span style={{ fontSize:10 }}>${(item.price*item.qty).toFixed(2)}</span>
                    </div>
                  );
                })
            }
          </div>
          {/* Totals */}
          <div style={{ borderTop:`1px solid ${C.dg}`, padding:"4px 8px", fontFamily:"monospace", fontSize:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:C.dg }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", color:C.dg }}><span>Tax 8.5%</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:"bold", borderTop:`1px solid ${C.dg}`, marginTop:3, paddingTop:3 }}><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* ── CENTER: Menu Items ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ display:"flex", borderBottom:`1px solid ${C.dg}`, background:C.gray }}>
            {Object.keys(MENU).map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                ...T.btn, flex:1, minWidth:0, padding:"4px 2px", fontSize:10, borderRadius:0,
                borderLeft:"none", borderRight:`1px solid ${C.dg}`, borderTop:"none", borderBottom:"none",
                background: cat===c ? "#d4d0c8" : C.gray,
                fontWeight: cat===c ? "bold" : "normal",
              }}>{c}</button>
            ))}
          </div>
          <div style={{ flex:1, padding:8, overflowY:"auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6, alignContent:"start" }}>
            {(MENU[cat]||[]).map(([name, price]) => (
              <button key={name} onClick={() => addItem(name, price)} style={{
                ...T.btn, minWidth:0, padding:"10px 6px", fontSize:10, lineHeight:1.4,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
              }}>
                <span style={{ fontWeight:"bold" }}>{name}</span>
                <span style={{ color:C.dg, fontSize:9 }}>{price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Contextual Actions ── */}
        <div style={{ width:130, borderLeft:`1px solid ${C.dg}`, display:"flex", flexDirection:"column", padding:6, gap:4 }}>
          <div style={{ fontSize:9, letterSpacing:1, textTransform:"uppercase", color:C.dg, marginBottom:2 }}>Actions</div>

          {/* Single line selected */}
          {singleSel !== null && !multiSel && <>
            <div style={{ fontSize:9, color:C.dg, marginBottom:1 }}>1 line:</div>
            <button onClick={() => addQty(singleSel)} style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>+ Qty</button>
            <button onClick={() => remQty(singleSel)} style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>− Qty</button>
            <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Modify</button>
            <button onClick={() => voidLines(selIdxs)} style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10, color:"#990000" }}>Void Line</button>
            <div style={{ height:0, borderTop:`1px solid ${C.dg}`, margin:"4px 0" }}/>
          </>}

          {/* Multiple lines selected */}
          {multiSel && <>
            <div style={{ fontSize:9, color:C.dg, marginBottom:1 }}>{selIdxs.length} lines:</div>
            <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Modify All</button>
            <button onClick={() => voidLines(selIdxs)} style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10, color:"#990000" }}>Void All</button>
            <button onClick={() => setSel([])} style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Deselect</button>
            <div style={{ height:0, borderTop:`1px solid ${C.dg}`, margin:"4px 0" }}/>
          </>}

          <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Discount</button>
          <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Comp</button>
          <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Fire All</button>
          <button style={{ ...T.btn, minWidth:0, width:"100%", padding:"3px 6px", fontSize:10 }}>Print Check</button>
          <div style={{ flex:1 }}/>
          <button onClick={() => onSave && onSave({ ...order, guest_count:guests, items, total:"$"+total.toFixed(2), status:"open" })} style={{ ...T.btn, minWidth:0, width:"100%", padding:"5px 6px", fontSize:10, fontWeight:"bold", marginBottom:4 }}>💾 Save Table</button>
          <button
            onClick={() => items.length > 0 ? onPayment({ items, subtotal, tax, total, order:{ ...order, guest_count:guests } }) : null}
            style={{ ...T.btn, minWidth:0, width:"100%", padding:"7px 6px", fontSize:11, fontWeight:"bold", background:items.length>0?C.navy:C.gray, color:items.length>0?C.white:C.dg, borderColor:items.length>0?`#4060a0 #000060 #000060 #4060a0`:RAISED, cursor:items.length>0?"pointer":"not-allowed" }}
          >Pay  ▶</button>
        </div>

      </div>
      <SBar/>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PAYMENT SCREEN
// ─────────────────────────────────────────────────────────────────────────
function PaymentScreen({ staff, payload, onBack, onComplete }) {
  const [tab,    setTab]    = useState("Card");
  const [tender, setTender] = useState("");
  const { items, subtotal, tax, total, order } = payload;
  const change = tab==="Cash" && parseFloat(tender||0) >= total
    ? (parseFloat(tender) - total).toFixed(2) : null;

  const TABS = ["Cash","Card","Split"];

  return (
    <>
      <div style={{ background:"#d4d0c8", borderBottom:`1px solid ${C.dg}`, padding:"3px 8px", display:"flex", gap:12, fontSize:10, alignItems:"center" }}>
        <span style={{ fontWeight:"bold" }}>Payment — {order.id}</span>
        <span style={{ color:C.dg }}>·</span>
        <span>{staff.name}</span>
        <span style={{ flex:1 }}/>
        <span style={{ fontWeight:"bold", fontSize:13, color:C.navy }}>${total.toFixed(2)}</span>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT: receipt summary */}
        <div style={{ width:190, borderRight:`1px solid ${C.dg}`, display:"flex", flexDirection:"column" }}>
          <div style={{ background:"#d4d0c8", padding:"2px 8px", fontSize:9, letterSpacing:1, textTransform:"uppercase", color:C.dg, borderBottom:`1px solid ${C.dg}` }}>Receipt</div>
          <div style={{ flex:1, overflowY:"auto", padding:4, fontFamily:"monospace", fontSize:10 }}>
            {items.map((item,i) => (
              <div key={i} style={{ display:"flex", gap:4, marginBottom:2 }}>
                <span style={{ minWidth:18, color:C.dg }}>{item.qty}×</span>
                <span style={{ flex:1 }}>{item.name}</span>
                <span>${(item.price*item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${C.dg}`, padding:"4px 8px", fontFamily:"monospace", fontSize:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:C.dg }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", color:C.dg }}><span>Tax 8.5%</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontWeight:"bold", borderTop:`1px solid ${C.dg}`, marginTop:3, paddingTop:3 }}><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>

        {/* RIGHT: payment method */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:10, gap:8 }}>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.dg}` }}>
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setTender(""); }} style={{
                ...T.btn, minWidth:0, flex:1, padding:"5px 4px", fontSize:11, borderRadius:0,
                borderLeft:"none", borderRight:`1px solid ${C.dg}`, borderTop:"none", borderBottom:"none",
                background: tab===t ? "#d4d0c8" : C.gray,
                fontWeight: tab===t ? "bold" : "normal",
              }}>{t}</button>
            ))}
          </div>

          {/* Cash */}
          {tab === "Cash" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, paddingTop:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:"bold" }}>
                <span>Amount Due</span><span style={{ color:C.navy }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, minWidth:80 }}>Cash Tendered</span>
                <input
                  style={{ ...T.inp, width:100, fontSize:14, fontWeight:"bold" }}
                  type="number" placeholder="0.00"
                  value={tender} onChange={e => setTender(e.target.value)}
                />
              </div>
              {change !== null && (
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:"bold", color:C.green }}>
                  <span>Change Due</span><span>${change}</span>
                </div>
              )}
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
                {["5","10","20","50","100"].map(d => (
                  <button key={d} onClick={() => setTender(d)} style={{ ...T.btn, minWidth:0, padding:"4px 10px", fontSize:11 }}>${d}</button>
                ))}
                <button onClick={() => setTender(total.toFixed(2))} style={{ ...T.btn, minWidth:0, padding:"4px 10px", fontSize:11, fontWeight:"bold" }}>Exact</button>
              </div>
            </div>
          )}

          {/* Card */}
          {tab === "Card" && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:10 }}>
              <div style={{ fontSize:36 }}>💳</div>
              <div style={{ fontWeight:"bold", fontSize:13 }}>Tap, Insert, or Swipe</div>
              <div style={{ fontSize:10, color:C.dg }}>Waiting for card reader…</div>
              <div style={{ fontSize:11, fontWeight:"bold", color:C.navy, marginTop:8 }}>${total.toFixed(2)}</div>
            </div>
          )}

          {/* Split */}
          {tab === "Split" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, paddingTop:8 }}>
              <div style={{ fontSize:10, color:C.dg, fontStyle:"italic" }}>Allocate payment across methods:</div>
              {[["Card","$"+total.toFixed(2)],["Cash","$0.00"]].map(([label,val]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ minWidth:50, fontSize:11 }}>{label}</span>
                  <input style={{ ...T.inp, width:100, fontSize:12 }} defaultValue={val}/>
                </div>
              ))}
              <div style={{ fontSize:10, color:C.dg, marginTop:4 }}>Remaining: $0.00</div>
            </div>
          )}

          <div style={{ flex:1 }}/>

          {/* Tip line */}
          <div style={{ borderTop:`1px solid ${C.dg}`, paddingTop:8, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, minWidth:30 }}>Tip</span>
            <input style={{ ...T.inp, width:80, fontSize:12 }} placeholder="$0.00"/>
            <div style={{ display:"flex", gap:4 }}>
              {["15%","18%","20%"].map(p => (
                <button key={p} onClick={() => {}} style={{ ...T.btn, minWidth:0, padding:"2px 8px", fontSize:10 }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Charge button */}
          <button onClick={onComplete} style={{
            ...T.btn, width:"100%", minWidth:0, padding:"10px", fontSize:13,
            fontWeight:"bold", background:C.navy, color:C.white,
            borderColor:`#4060a0 #000060 #000060 #4060a0`,
          }}>
            ✔  Charge  {tab}  —  ${total.toFixed(2)}
          </button>

        </div>
      </div>
      <SBar/>
    </>
  );
}
// ─────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState("login");
  const [staff,   setStaff]   = useState(null);
  const [order,   setOrder]   = useState(null);
  const [payment, setPayment] = useState(null);
  const [orders,  setOrders]  = useState(MOCK_ORDERS);  // lifted — single source of truth

  const goLogin    = () => { setStaff(null); setOrder(null); setPayment(null); setScreen("login"); };
  const goOrder    = (ord) => { setOrder(ord); setScreen("order"); };
  const goPayment  = (payload) => { setPayment(payload); setScreen("payment"); };
  const goComplete = () => {
    // Remove the closed check from the grid
    if (payment?.order?.id) {
      setOrders(prev => prev.filter(o => o.id !== payment.order.id));
    }
    setOrder(null); setPayment(null); setScreen("snapshot");
  };

  const showLogout = screen === "snapshot" || screen === "order" || screen === "payment";
  const greet      = showLogout && staff ? greeting(staff.name) : null;

  return (
    <div style={T.desk}>
      <div style={T.win}>
        <TBar greeting={greet} onLogout={showLogout ? goLogin : null}/>
        {screen === "login"    && <LoginScreen    onLogin={s => { setStaff(s); setScreen("snapshot"); }}/>}
        {screen === "snapshot" && <SnapshotScreen staff={staff} onLogout={goLogin} onOpenOrder={goOrder} orders={orders} setOrders={setOrders}/>}
        {screen === "order"    && <OrderScreen    staff={staff} order={order} onBack={() => setScreen("snapshot")} onPayment={goPayment}
          onSave={(updated) => {
            setOrders(prev => prev.some(o => o.id === updated.id)
              ? prev.map(o => o.id === updated.id ? updated : o)
              : [...prev, updated]
            );
            setScreen("snapshot");
          }}
        />}
        {screen === "payment"  && <PaymentScreen  staff={staff} payload={payment} onBack={() => setScreen("order")} onComplete={goComplete}/>}
      </div>
    </div>
  );
}
