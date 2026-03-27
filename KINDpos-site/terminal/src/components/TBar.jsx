import { useState, useEffect } from "react";
import { TERMINAL_ID, VERSION } from "../config";

const HEADER_STYLE = {
  background: "#C6FFBB",
  color: "#333333",
  padding: "0 15px",
  fontSize: 14,
  userSelect: "none",
  display: "flex",
  alignItems: "center",
  height: 30,
  boxSizing: "border-box",
  fontFamily: "'Alien Encounters Solid Bold', sans-serif",
  flexShrink: 0,
};

const BADGE_STYLE = (role) => ({
  marginLeft: 8,
  padding: "2px 6px",
  fontSize: 10,
  fontWeight: "bold",
  color: "#333333",
  background: role === "manager" ? "#FBDE42" : "#FF8C00",
  fontFamily: "'Sevastopol Interface', sans-serif",
});

export default function TBar({ greeting, role, onLogout }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

  return (
    <div style={HEADER_STYLE}>
      <span>{dateStr} // {timeStr}</span>
      {greeting && (
        <>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: "'Sevastopol Interface', sans-serif", fontSize: 12 }}>{greeting}</span>
        </>
      )}
      {!greeting && <span style={{ flex: 1 }} />}
      {role && <span style={BADGE_STYLE(role)}>[{role}]</span>}
      {onLogout && (
        <button onClick={onLogout} style={{
          marginLeft: 12, padding: "2px 8px", border: "1px solid #333333",
          background: "transparent", color: "#333333", cursor: "pointer",
          fontFamily: "'Sevastopol Interface', sans-serif", fontSize: 12,
        }}>X</button>
      )}
    </div>
  );
}

export function SBar({ terminalId = TERMINAL_ID, offline = false }) {
  return (
    <div style={{
      background: "#333333",
      color: "#C6FFBB",
      padding: "0 16px",
      fontSize: 14,
      userSelect: "none",
      display: "flex",
      alignItems: "center",
      height: 30,
      boxSizing: "border-box",
      borderTop: "1px solid #C6FFBB",
      fontFamily: "'Sevastopol Interface', sans-serif",
      flexShrink: 0,
    }}>
      <span>
        <span style={{ color: "#C6FFBB" }}>TRM-</span>
        <span style={{ color: "#FBDE42" }}>{terminalId.replace("T-", "")}</span>
        <span style={{ color: "#C6FFBB" }}> // vz</span>
        <span style={{ color: "#FBDE42" }}>0.9</span>
        {offline && <span style={{ color: "#FBDE42", marginLeft: 10 }}>OFFLINE</span>}
      </span>
      <span style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          width: 20, height: 20, marginRight: 8,
          border: "2px solid #C6FFBB",
          animation: "spin 20s linear infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 10, height: 10, background: "#C6FFBB" }} />
        </div>
        <span style={{ fontFamily: "'Alien Encounters Solid Bold', sans-serif", fontSize: 14, letterSpacing: 2 }}>KINDpos</span>
      </div>
    </div>
  );
}
