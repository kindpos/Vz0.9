import { useState, useEffect } from "react";
import { TERMINAL_ID, VERSION } from "../config";

const C = {
  gray: "#c0c0c0", dg: "#808080", navy: "#000080", blue: "#1084d0",
  white: "#fff", black: "#000", red: "#c00020", yellow: "#fbde42"
};

const BAR_STYLE = {
  background: `linear-gradient(90deg, ${C.navy}, ${C.blue})`,
  color: C.white,
  padding: "3px 8px",
  fontSize: 10,
  userSelect: "none",
  display: "flex",
  alignItems: "center",
  height: 20,
  boxSizing: "border-box"
};

const TBTN_STYLE = {
  width: 18, height: 16, fontSize: 10, marginLeft: 12,
  background: "#c00020", color: C.white,
  border: "2px solid",
  borderColor: `#ff6060 #800010 #800010 #ff6060`,
  fontWeight: "bold", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1, fontFamily: "inherit"
};

const BADGE_STYLE = (role) => ({
  marginLeft: 8,
  padding: "0 4px",
  fontSize: 9,
  fontWeight: "bold",
  color: C.black,
  background: role === "manager" ? C.yellow : "#c6ffbb",
  border: `1px solid ${C.dg}`,
  textTransform: "uppercase"
});

export default function TBar({ greeting, role, onLogout }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={BAR_STYLE}>
      <span style={{ opacity: 0.85, letterSpacing: 0.5 }}>{dateStr}  {timeStr}</span>
      {greeting && (
        <>
          <span style={{ flex: 1 }} />
          <span style={{ opacity: 0.9, fontStyle: "italic", letterSpacing: 0.5 }}>{greeting}</span>
        </>
      )}
      {!greeting && <span style={{ flex: 1 }} />}
      {role && <span style={BADGE_STYLE(role)}>[{role}]</span>}
      {onLogout && (
        <button onClick={onLogout} style={TBTN_STYLE}>✕</button>
      )}
    </div>
  );
}

export function SBar({ terminalId = TERMINAL_ID, offline = false }) {
  return (
    <div style={BAR_STYLE}>
      <span style={{ opacity: 0.85, letterSpacing: 1 }}>
        {terminalId} // {VERSION}
        {offline && <span style={{ color: C.yellow, marginLeft: 10 }}>⚡ OFFLINE</span>}
      </span>
      <span style={{ flex: 1 }} />
      <span style={{ fontWeight: "bold", letterSpacing: 2, fontFamily: "'Alien Encounters', sans-serif" }}>KINDpos</span>
    </div>
  );
}
