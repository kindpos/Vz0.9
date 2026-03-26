export default function HardwareScreen({ setScreen }) {
  return (
    <div style={{ flex: 1, background: "#333333", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Sevastopol Interface', sans-serif" }}>
      <div style={{ fontFamily: "'Alien Encounters Solid Bold', sans-serif", fontSize: 22, color: "#C6FFBB", letterSpacing: 2, marginBottom: 12 }}>HARDWARE</div>
      <div style={{ color: "#C6FFBB", opacity: 0.5, fontSize: 14 }}>Coming Soon</div>
      <button onClick={() => setScreen("snapshot")} style={{ marginTop: 20, background: "#333333", color: "#C6FFBB", border: "1px solid #C6FFBB", borderRadius: 8, padding: "8px 20px", fontFamily: "'Sevastopol Interface', sans-serif", fontSize: 14, cursor: "pointer" }}>Back</button>
    </div>
  );
}
