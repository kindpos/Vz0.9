# KINDpos-site — Junie Integration Spec

## Context

Claude Code scaffolded a Vite + React terminal app at:
`C:\Users\bgkd2\PycharmProjects\KINDpos_vz0.9\KINDpos-site\terminal\`

The component structure already matches the approved prototype (`kindpos-login-snapshot.jsx`).
Your job is to wire everything together properly — fonts, assets, routing, API, and state.

---

## Directory Map

```
KINDpos-site/
├── Alien-Encounters-Solid-Bold.ttf   ← brand display font
├── Sevastopol Interface.ttf          ← brand UI font
├── index.html                        ← static landing page (do not modify)
├── logo.jpg
├── palm.jpg
└── terminal/                         ← Vite React app (your working directory)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx                   ← root, owns all state + navigation
        ├── App.css
        ├── index.css
        ├── main.jsx
        ├── assets/
        └── components/
            ├── TBar.jsx
            ├── LoginScreen.jsx
            ├── SnapshotScreen.jsx
            ├── OrderScreen.jsx
            └── PaymentScreen.jsx
```

---

## Task 1 — Copy Brand Fonts into Terminal

Copy both font files from `KINDpos-site/` into `terminal/src/assets/fonts/`:

```
terminal/src/assets/fonts/Alien-Encounters-Solid-Bold.ttf
terminal/src/assets/fonts/Sevastopol-Interface.ttf
```

Then declare them in `terminal/src/index.css`:

```css
@font-face {
  font-family: 'Alien Encounters';
  src: url('./assets/fonts/Alien-Encounters-Solid-Bold.ttf') format('truetype');
  font-weight: bold;
}

@font-face {
  font-family: 'Sevastopol Interface';
  src: url('./assets/fonts/Sevastopol-Interface.ttf') format('truetype');
}
```

Use `'Sevastopol Interface'` as the base UI font throughout the terminal (replaces `'MS Sans Serif', Tahoma`).
Use `'Alien Encounters'` for the `KINDpos` wordmark in TBar and the login screen title only.

---

## Task 2 — Implement TBar.jsx

`TBar` is the persistent top bar across all post-login screens. It must:

- Render a navy-to-blue gradient bar (`linear-gradient(90deg, #000080, #1084d0)`)
- Left side: live clock, updating every second (`new Date()` via `useEffect` + `setInterval`)
- Center: greeting string passed as prop — `// Good Morning/Afternoon/Evening, [name]` — derived from hour, shown only when `greeting` prop is provided
- Right: role badge `[manager]` or `[server]`, then red `✕` logout button when `onLogout` prop provided

Props:
```js
TBar({ greeting: string | null, role: string | null, onLogout: fn | null })
```

The login screen uses a **separate** plain nav bar (just date/time, no greeting, no logout).

Footer (`SBar`) is a matching gradient bar, static:
- Left: terminal ID from config (see Task 5)
- Right: `KINDpos` in bold, letter-spacing 2

---

## Task 3 — Implement App.jsx State & Navigation

App owns all shared state. No state should live below App except local UI state (open/closed cards, selected lines, etc).

```js
// App-level state
const [screen,  setScreen]  = useState("login");
const [staff,   setStaff]   = useState(null);
const [order,   setOrder]   = useState(null);
const [payment, setPayment] = useState(null);
const [orders,  setOrders]  = useState([]);   // starts empty, loaded from API on login
```

Navigation handlers:
```js
const goLogin    = () => { setStaff(null); setOrder(null); setPayment(null); setOrders([]); setScreen("login"); };
const goOrder    = (ord) => { setOrder(ord); setScreen("order"); };
const goPayment  = (payload) => { setPayment(payload); setScreen("payment"); };
const goComplete = () => {
  if (payment?.order?.id) setOrders(prev => prev.filter(o => o.id !== payment.order.id));
  setOrder(null); setPayment(null); setScreen("snapshot");
};
const goSave = (updated) => {
  setOrders(prev => prev.some(o => o.id === updated.id)
    ? prev.map(o => o.id === updated.id ? updated : o)
    : [...prev, updated]
  );
  setScreen("snapshot");
};
```

Render:
```jsx
<TBar greeting={...} role={staff?.role} onLogout={screen !== "login" ? goLogin : null}/>
{screen === "login"    && <LoginScreen    onLogin={handleLogin}/>}
{screen === "snapshot" && <SnapshotScreen staff={staff} orders={orders} setOrders={setOrders} onOpenOrder={goOrder}/>}
{screen === "order"    && <OrderScreen    staff={staff} order={order} onPayment={goPayment} onSave={goSave}/>}
{screen === "payment"  && <PaymentScreen  staff={staff} payload={payment} onComplete={goComplete}/>}
<SBar terminalId={TERMINAL_ID}/>
```

---

## Task 4 — Wire API Calls

Replace all mock data with real API calls against the KINDpos FastAPI backend (base URL from config, see Task 5).

### Login
```js
// On mount, fetch server roster once
const [roster, setRoster] = useState([]);
useEffect(() => {
  fetch(`${API_BASE}/api/v1/servers`)
    .then(r => r.json())
    .then(data => setRoster(data.servers))
    .catch(() => setRoster(FALLBACK_ROSTER)); // offline fallback
}, []);

// On PIN submit
const staff = roster.find(s => s.pin === pin);
```

### Snapshot — load active orders on login
```js
// In handleLogin (App.jsx), after setting staff:
fetch(`${API_BASE}/api/v1/orders/active`)
  .then(r => r.json())
  .then(data => setOrders(data.orders))
  .catch(() => setOrders([])); // start empty if offline
```

### New Check
```js
// POST then navigate
const res = await fetch(`${API_BASE}/api/v1/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ label: name, guest_count: guests, server_id: staff.id })
});
const newOrder = await res.json();
goOrder(newOrder);
```

### Save Table
```js
// PATCH existing or POST new
const method = isExisting ? "PATCH" : "POST";
const url = isExisting ? `${API_BASE}/api/v1/orders/${order.id}` : `${API_BASE}/api/v1/orders`;
await fetch(url, { method, headers: {...}, body: JSON.stringify(updated) });
```

### Menu
```js
// In OrderScreen on mount
useEffect(() => {
  fetch(`${API_BASE}/api/v1/menu`)
    .then(r => r.json())
    .then(data => setMenu(data.categories))
    .catch(() => setMenu(FALLBACK_MENU));
}, []);
```

### Payment Complete
```js
// Fire ORDER_CLOSED event
await fetch(`${API_BASE}/api/v1/events`, {
  method: "POST",
  body: JSON.stringify({ type: "ORDER_CLOSED", order_id: order.id, payment_method: tab, amount: total, tip })
});
goComplete();
```

---

## Task 5 — Config File

Create `terminal/src/config.js`:

```js
export const API_BASE      = import.meta.env.VITE_API_BASE || "http://localhost:8000";
export const TERMINAL_ID   = import.meta.env.VITE_TERMINAL_ID || "T-01";
export const VERSION       = "Vz0.9";

// Offline fallback roster — used if /api/v1/servers is unreachable
export const FALLBACK_ROSTER = [
  { id: "alex",   name: "Alex M.",   pin: "1234", role: "manager" },
  { id: "jordan", name: "Jordan K.", pin: "5678", role: "server"  },
  { id: "casey",  name: "Casey R.",  pin: "9012", role: "server"  },
];

// Offline fallback menu
export const FALLBACK_MENU = {
  "Mains":  [{ name:"Smash Burger", price:12.00 }, { name:"Chicken Sand.", price:11.00 }, { name:"Hot Dog", price:8.00 }, { name:"Veggie Wrap", price:10.00 }],
  "Sides":  [{ name:"Waffle Fries", price:5.00 },  { name:"Onion Rings",   price:5.00 },  { name:"Slaw",    price:4.00 }, { name:"Side Salad",   price:4.00  }],
  "Drinks": [{ name:"Lemonade",     price:4.00 },  { name:"Soda",          price:3.00 },  { name:"Water",   price:2.00 }, { name:"Iced Tea",     price:3.00  }],
  "Extras": [{ name:"Cheese +",     price:1.00 },  { name:"Bacon +",       price:2.00 },  { name:"Sauce",   price:0.50 }, { name:"Jalapeños",    price:0.50  }],
};
```

Create `terminal/.env.local`:
```
VITE_API_BASE=http://localhost:8000
VITE_TERMINAL_ID=T-01
```

---

## Task 6 — Offline Detection

In `App.jsx`, add an offline indicator:

```js
const [offline, setOffline] = useState(false);

// Detect offline on any fetch failure
// Set offline=true, show subtle indicator in SBar
// e.g. SBar shows "⚡ OFFLINE" in yellow when offline=true
```

Do not block the UI when offline. Fall back to local state silently. Make offline visible but not alarming.

---

## Task 7 — vite.config.js

Ensure the dev server proxies API calls to avoid CORS issues during development:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
```

---

## Reference Implementation

The file `kindpos-login-snapshot.jsx` (in this project) is the approved working prototype.
All layout decisions, component structure, color tokens, and interaction patterns are defined there.
Do not redesign — integrate and replace mocks with real data.

## Design Constants (do not change)

```js
const C = {
  gray:"#c0c0c0", dg:"#808080", navy:"#000080", blue:"#1084d0",
  white:"#fff",   teal:"#008080", black:"#000",  green:"#006400",
  mint:"#c6ffbb", yellow:"#fbde42", softred:"#ff6b6b",
};
const RAISED = `${C.white} ${C.dg} ${C.dg} ${C.white}`;
const SUNKEN = `${C.dg} ${C.white} ${C.white} ${C.dg}`;
```

## Execution Order

1. Task 5 (config) — foundation everything else imports from
2. Task 1 (fonts) — visual identity before any screen renders
3. Task 2 (TBar) — shared chrome used by all screens
4. Task 3 (App state + navigation) — wire screens together
5. Task 4 (API calls) — replace mocks one endpoint at a time
6. Task 6 (offline detection) — wrap around Task 4
7. Task 7 (vite.config) — dev environment cleanup
