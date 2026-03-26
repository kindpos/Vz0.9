import { useState, useRef, useEffect } from 'react';

const FH = "'Alien Encounters Solid Bold', sans-serif";
const FB = "'Sevastopol Interface', sans-serif";

export default function LoginScreen({ onLogin, roster = [] }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const holdTimer = useRef(null);

  const press = (key) => {
    setError("");
    if (key === "CLR") {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (key === ">>>") {
      submit();
      return;
    }
    if (pin.length < 6) setPin(p => p + key);
  };

  const submit = () => {
    if (!pin) return;
    const staff = roster.find(r => r.pin === pin);
    if (!staff) {
      setError("PIN not recognised. Try again.");
      setPin("");
      return;
    }
    onLogin(staff);
  };

  const onClrDown = () => {
    holdTimer.current = setTimeout(() => { setPin(""); setError(""); }, 600);
  };
  const onClrUp = () => { clearTimeout(holdTimer.current); };

  const PAD = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["CLR", "0", ">>>"]];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') press("CLR");
      else if (e.key === 'Enter') submit();
      else if (e.key === 'Escape') { setPin(""); setError(""); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div style={{
      flex: 1, background: "#333333", display: "flex",
      alignItems: "center", justifyContent: "center", position: "relative",
    }}>
      {/* Left: PIN Frame */}
      <div style={{
        width: 287, height: 353, border: "6px solid #C6FFBB",
        background: "#333333", borderRadius: 12,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        marginRight: 40,
      }}>
        <div style={{ fontFamily: FH, fontSize: 22, color: "#C6FFBB", letterSpacing: 4 }}>
          KINDpos
        </div>

        {/* PIN dots */}
        <div style={{
          width: 200, height: 50, border: "2px solid #C6FFBB",
          borderRadius: 8, background: "#222222",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          {pin.length === 0
            ? <span style={{ color: "#C6FFBB", opacity: 0.4, fontSize: 12, fontFamily: FB }}>enter PIN</span>
            : Array.from({ length: pin.length }).map((_, i) => (
              <span key={i} style={{ fontSize: 24, color: "#C6FFBB", lineHeight: 1 }}>&#x2B22;</span>
            ))
          }
        </div>

        {error && (
          <div style={{
            background: "rgba(232,64,64,0.15)", border: "1px solid #E84040",
            padding: "4px 12px", fontSize: 12, color: "#E84040",
            fontFamily: FB, borderRadius: 4, maxWidth: 220, textAlign: "center",
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Center: Numpad */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 82px)",
        gridTemplateRows: "repeat(4, 74px)", gap: "12px 6px",
      }}>
        {PAD.flat().map(key => {
          const isCLR = key === "CLR";
          const isENT = key === ">>>";
          const isDigit = !isCLR && !isENT;
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
                background: isCLR ? "#E84040" : isENT ? "#C6FFBB" : "#333333",
                color: isDigit ? "#C6FFBB" : "#333333",
                border: isDigit ? "1px solid #C6FFBB" : "none",
                borderRadius: 8,
                fontFamily: FB,
                fontSize: isCLR || isENT ? 18 : 24,
                fontWeight: "bold",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >{key}</button>
          );
        })}
      </div>
    </div>
  );
}
