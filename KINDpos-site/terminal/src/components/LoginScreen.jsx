import { useState, useRef, useCallback, useEffect } from 'react';

const C = {
  gray: "#c0c0c0", dg: "#808080", navy: "#000080", blue: "#1084d0",
  white: "#fff", black: "#000"
};

const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;

const T = {
  body: { padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" },
  btn: { background: C.gray, border: "2px solid", borderColor: RAISED, padding: "4px 14px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", minWidth: 80, color: C.black, whiteSpace: "nowrap", lineHeight: 1.2 },
  inp: { border: "2px solid", borderColor: SUNKEN, background: C.white, padding: "2px 4px", fontSize: 11, fontFamily: "inherit", outline: "none" },
  sep: { height: 0, borderTop: `1px solid ${C.dg}`, borderBottom: `1px solid ${C.white}`, margin: "6px 0" },
};

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

  const submit = useCallback(() => {
    if (!pin) return;
    const staff = roster.find(r => r.pin === pin);
    if (!staff) {
      setError("PIN not recognised. Try again.");
      setPin("");
      return;
    }
    onLogin(staff);
  }, [pin, roster, onLogin]);

  const onClrDown = () => {
    holdTimer.current = setTimeout(() => { setPin(""); setError(""); }, 600);
  };
  const onClrUp = () => { clearTimeout(holdTimer.current); };

  const PAD = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["CLR", "0", ">>>"]];

  const handleKeyDown = useCallback((e) => {
    if (e.key >= '0' && e.key <= '9') press(e.key);
    else if (e.key === 'Backspace') press("CLR");
    else if (e.key === 'Enter') submit();
    else if (e.key === 'Escape') { setPin(""); setError(""); }
  }, [pin, submit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={T.body}>
      <div style={{ textAlign: "center", paddingTop: 8 }}>
        <div style={{ fontSize: 22, fontWeight: "bold", color: C.navy, letterSpacing: 4, fontFamily: "'Alien Encounters', sans-serif" }}>KINDpos</div>
      </div>

      <div style={T.sep} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 172 }}>
          <div style={{ border: "2px solid", borderColor: SUNKEN, background: C.white, height: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {pin.length === 0
              ? <span style={{ color: C.dg, fontSize: 10 }}>enter PIN</span>
              : Array.from({ length: pin.length }).map((_, i) => (
                <span key={i} style={{ fontSize: 20, lineHeight: 1, color: C.navy }}>●</span>
              ))
            }
          </div>
          {error && (
            <div style={{ background: "#ffcccc", border: `1px solid #cc0000`, padding: "2px 6px", fontSize: 10, marginTop: 4, color: "#660000" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
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
                  width: 56, height: 48, padding: 0, minWidth: 0,
                  fontSize: isENT ? 11 : 16,
                  fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
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
  );
}
