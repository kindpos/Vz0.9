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
