import { useState, useRef, useCallback, useEffect } from 'react';

/* ─── Keyframe injection (once) ─── */
const STYLE_ID = 'login-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes loginSpin{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}
    @keyframes loginShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
    .login-num:hover{background:#444444 !important}
  `;
  document.head.appendChild(style);
}

/* ─── Design tokens (prototype CSS vars) ─── */
const C = {
  bg: '#333333', bg2: '#222222', bg3: '#444444',
  mint: '#C6FFBB', mintDim: 'rgba(198,255,187,0.25)',
  red: '#E84040',
  fh: "'Alien Encounters Solid Bold','Impact','Arial Black',sans-serif",
  fb: "'Sevastopol Interface','Courier New','Lucida Console',monospace",
};

const HEX_CLIP = 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)';
const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','CLR','0','>>>'];

export default function LoginScreen({ onLogin, roster = [] }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const holdTimer = useRef(null);

  const tryAuth = useCallback(() => {
    if (!pin) return null;
    const staff = roster.find(r => r.pin === pin);
    if (!staff) {
      setError('PIN not recognised.');
      setPin('');
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return null;
    }
    return staff;
  }, [pin, roster]);

  const press = (key) => {
    setError('');
    if (key === 'CLR') { setPin(p => p.slice(0, -1)); return; }
    if (key === '>>>') { submit(); return; }
    if (pin.length < 6) setPin(p => p + key);
  };

  const submit = useCallback(() => {
    if (!pin) return;
    const staff = tryAuth();
    if (staff) onLogin(staff);
  }, [pin, tryAuth, onLogin]);

  const onClrDown = () => { holdTimer.current = setTimeout(() => { setPin(''); setError(''); }, 500); };
  const onClrUp = () => clearTimeout(holdTimer.current);

  const handleKeyDown = useCallback((e) => {
    if (e.key >= '0' && e.key <= '9') press(e.key);
    else if (e.key === 'Backspace') press('CLR');
    else if (e.key === 'Enter') submit();
    else if (e.key === 'Escape') { setPin(''); setError(''); }
  }, [pin, submit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ─── PIN hex rendering (honeycomb grid) ─── */
  const renderPinHexes = () => {
    if (pin.length === 0) {
      return <span style={{ opacity: 0.35, fontSize: 15 }}>enter PIN</span>;
    }
    const S = 30, H = S * 0.866, cStep = S * 0.75, maxCols = 6;
    const hexes = [];
    for (let i = 0; i < pin.length && i < maxCols * 2; i++) {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);
      const x = col * cStep + 4;
      const y = row * (H + 4) + (col % 2 === 1 ? H * 0.5 : 0) + 4;
      hexes.push(
        <div key={i} style={{ position: 'absolute', left: x, top: y, width: S, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.mint, clipPath: HEX_CLIP }} />
          <div style={{ position: 'absolute', inset: 2, background: C.bg3, clipPath: HEX_CLIP }} />
        </div>
      );
    }
    return hexes;
  };

  const actionHexes = [
    { label: 'Clock\nin/out', act: () => {} },
    { label: 'Settings', act: () => { const s = tryAuth(); if (s) onLogin(s); } },
    { label: 'Quick\nOrder', act: () => { const s = tryAuth(); if (s) onLogin(s); } },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
      background: C.bg, fontFamily: C.fb, color: C.mint, overflow: 'hidden',
    }}>
      {/* LEFT: LOGO + PIN DISPLAY */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 180 }}>
        {/* Spinning logo */}
        <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 55, height: 55,
            background: 'transparent', border: `2px solid ${C.mint}`,
            animation: 'loginSpin 20s linear infinite',
          }} />
        </div>

        {/* KINDpos title */}
        <div style={{ fontFamily: C.fh, fontSize: 22, letterSpacing: 3, color: C.mint, textAlign: 'center' }}>
          KINDpos
        </div>

        {/* PIN frame */}
        <div style={{
          width: 160, height: 70,
          border: `2px solid ${C.mint}`, borderRadius: 8, background: C.bg2,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...(shaking ? { animation: 'loginShake 0.3s ease' } : {}),
        }}>
          {renderPinHexes()}
        </div>

        {/* Error */}
        <div style={{ width: 160 }}>
          {error && (
            <div style={{
              background: 'rgba(232,64,64,0.15)', border: `1px solid ${C.red}`,
              padding: '4px 8px', fontSize: 15, color: C.red, marginTop: 4, borderRadius: 4,
            }}>⚠ {error}</div>
          )}
        </div>
      </div>

      {/* CENTER: NUMPAD */}
      <div style={{ background: C.mint, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 8 }}>
          {PAD_KEYS.map(k => {
            const isCLR = k === 'CLR', isENT = k === '>>>';
            const isNum = !isCLR && !isENT;
            return (
              <button
                key={k}
                className={isNum ? 'login-num' : undefined}
                onClick={() => press(k)}
                onMouseDown={isCLR ? onClrDown : undefined}
                onMouseUp={isCLR ? onClrUp : undefined}
                onMouseLeave={isCLR ? onClrUp : undefined}
                onTouchStart={isCLR ? onClrDown : undefined}
                onTouchEnd={isCLR ? onClrUp : undefined}
                style={{
                  width: 80, height: 60, border: 'none', borderRadius: 6,
                  fontFamily: C.fb, fontWeight: 'bold', cursor: 'pointer', userSelect: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isCLR ? C.red : isENT ? '#22CC66' : C.bg,
                  color: isNum ? C.mint : C.bg,
                  fontSize: isCLR ? 15 : isENT ? 16 : 22,
                }}
              >{k}</button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: ACTION HEXES */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, marginLeft: 20 }}>
        {actionHexes.map((h, i) => (
          <div key={i} onClick={h.act} style={{
            width: 120, height: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', fontSize: 20, cursor: 'pointer',
            position: 'relative', whiteSpace: 'pre-line',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: C.mint, clipPath: HEX_CLIP }} />
            <div style={{ position: 'absolute', inset: 3, background: C.bg3, clipPath: HEX_CLIP }} />
            <span style={{ zIndex: 1 }}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
