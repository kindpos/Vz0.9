import { useState, useEffect, useRef } from 'react';
import { API_BASE, FALLBACK_MENU } from '../config';

const C = {
  bg: "#333333",
  mint: "#C6FFBB",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  dg: "#444444",
  red: "#E84040",
  yellow: "#FBDE42"
};

const T = {
  header: {
    fontFamily: "'Alien Encounters Solid Bold', sans-serif",
    color: C.mint,
    letterSpacing: "2px",
    textTransform: "uppercase"
  },
  body: {
    fontFamily: "'Sevastopol Interface', sans-serif",
    color: C.mint
  },
  btn: {
    background: "transparent",
    border: `2px solid ${C.mint}`,
    color: C.mint,
    padding: "8px 12px",
    cursor: "pointer",
    fontFamily: "'Sevastopol Interface', sans-serif",
    fontSize: "14px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    borderRadius: "8px"
  }
};

export default function OrderScreen({ staff, order: initialOrder, onPayment, onReview, onSave, setOffline }) {
  const [cat, setCat] = useState(null);
  const [order, setOrder] = useState(initialOrder || { items: [], id: null, order_number: "---", order_type: "Walk-up", customer_name: "" });
  const [selIdxs, setSel] = useState([]);
  const [menu, setMenu] = useState(null);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [showOpenItem, setShowOpenItem] = useState(false);
  const [openItemData, setOpenItemData] = useState({ name: "", price: "" });
  const [modTarget, setModTarget] = useState(null); // { item, index }
  const [activePrefix, setActivePrefix] = useState("ADD");
  const railRef = useRef(null);

  // Derived from menu state
  const menuCategories = Object.keys(menu || {});

  // Prefixes from spec
  const PREFIXES = ["ADD", "NO", "ON SIDE", "LITE", "EXTRA"];

  // Load menu
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/menu`)
      .then(r => r.json())
      .then(data => {
        const raw = data.items_by_category || {};
        const itemsByCategory = {};
        for (const [cat, catItems] of Object.entries(raw)) {
          itemsByCategory[cat] = catItems.map(item => ({
            ...item,
            is_86: item.is_86d === true
          }));
        }
        setMenu(itemsByCategory);
        setModifierGroups(data.modifier_groups || []);
        const cats = Object.keys(itemsByCategory);
        if (cats.length > 0) {
          setCat(cats[0]);
        }
        setOffline(false);
      })
      .catch(() => {
        setMenu(FALLBACK_MENU);
        setModifierGroups([]);
        const cats = Object.keys(FALLBACK_MENU);
        if (cats.length > 0) {
          setCat(cats[0]);
        }
        setOffline(true);
      });
  }, [setOffline]);

  const items = order.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const taxRate = 0.07; // Configurable in Overseer, but 7% for v0.9
  const tax = subtotal * taxRate;
  const cardTotal = subtotal + tax;
  const cashDiscount = 0.035; // 3.5%
  const cashTotal = cardTotal * (1 - cashDiscount);

  const toggleSel = (idx) => {
    setSel(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  const handleCancelCheck = async () => {
    const orderId = order.order_id || order.id;
    if (orderId && items.length > 0) {
      try {
        await fetch(`${API_BASE}/api/v1/orders/${orderId}/void`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Cancelled at terminal" })
        });
      } catch (err) {
        console.error("Cancel failed:", err);
      }
    }
    onSave(order.order_id ? order : null);
  };

  const handleModifierTap = async (mod) => {
    if (!modTarget) return;
    const item = modTarget.item;
    const modName = activePrefix === "ADD" ? mod.name : `${activePrefix} ${mod.name}`;
    const action = activePrefix === "NO" ? "remove" : "add";
    const orderId = order.order_id || order.id;
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${orderId}/items/${item.item_id}/modifiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modifier_id: mod.id || mod.name,
          modifier_name: modName,
          modifier_price: mod.price || 0,
          action
        })
      });
      if (!res.ok) throw new Error("Modifier failed");
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Modifier failed:", err);
      setOrder(prev => {
        const newItems = [...prev.items];
        const idx = modTarget.index;
        newItems[idx] = {
          ...newItems[idx],
          modifiers: [...(newItems[idx].modifiers || []), { name: modName, price: mod.price || 0, action }]
        };
        return { ...prev, items: newItems };
      });
    }
    setModTarget(null);
  };

  const handleOpenItemConfirm = async () => {
    if (!openItemData.name || !openItemData.price) return;
    const mItem = {
      id: `open-${Date.now()}`,
      name: openItemData.name,
      price: parseFloat(openItemData.price) || 0,
    };
    setShowOpenItem(false);
    setOpenItemData({ name: "", price: "" });
    await handleItemTap(mItem);
  };

  const handleItemTap = async (mItem) => {
    let currentOrder = order;
    
    // 1. Auto-create order if needed
    if (!currentOrder.id) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_type: "Walk-up",
            guest_count: 1,
            server_id: staff.id,
            server_name: staff.name
          })
        });
        if (!res.ok) throw new Error("Failed to create order");
        currentOrder = await res.json();
        // The backend returns the projected order object in OrderResponse format
        setOrder(currentOrder);
      } catch (err) {
        console.error("Order creation failed:", err);
        setOffline(true);
        // Fallback for local-first if backend is down
        const fallbackOrder = {
          id: `local-${Date.now()}`,
          order_id: `local-${Date.now()}`,
          order_number: "001",
          order_type: "Walk-up",
          customer_name: "",
          items: [],
          status: "open"
        };
        currentOrder = fallbackOrder;
        setOrder(fallbackOrder);
      }
    }

    // 2. Add item to order
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${currentOrder.order_id || currentOrder.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_item_id: mItem.id || mItem.name,
          name: mItem.name,
          price: mItem.price,
          quantity: 1,
          category: cat
        })
      });
      if (!res.ok) throw new Error("Failed to add item");
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      setOffline(false);

      // 3. Handle Mandatory Modifiers
      // If item has mandatory modifiers, open modifier panel for the newly added item
      const newItem = updatedOrder.items[updatedOrder.items.length - 1];
      const hasMandatory = modifierGroups.some(g => g.mandatory && (g.applies_to_items?.includes(mItem.id) || g.applies_to_categories?.includes(cat) || g.universal));
      
      if (hasMandatory) {
        setModTarget({ item: newItem, index: updatedOrder.items.length - 1 });
      }

    } catch (err) {
      console.error("Add item failed:", err);
      setOffline(true);
      // Local fallback
      const newItem = {
        item_id: `local-item-${Date.now()}`,
        menu_item_id: mItem.id || mItem.name,
        name: mItem.name,
        price: mItem.price,
        quantity: 1,
        category: cat,
        modifiers: []
      };
      setOrder(prev => {
        const updated = {
          ...prev,
          items: [...(prev.items || []), newItem]
        };
        // Check mandatory for local too
        const hasMandatory = modifierGroups.some(g => g.mandatory);
        if (hasMandatory) {
          setModTarget({ item: newItem, index: updated.items.length - 1 });
        }
        return updated;
      });
    }
    
    // Auto-scroll check rail to bottom
    setTimeout(() => {
      if (railRef.current) {
        railRef.current.scrollTop = railRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleQtyChange = async (idx, delta) => {
    const item = items[idx];
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) {
      handleDeleteItem(idx);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${order.order_id || order.id}/items/${item.item_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Qty update failed:", err);
      setOrder(prev => {
        const newItems = [...prev.items];
        newItems[idx] = { ...newItems[idx], quantity: newQty };
        return { ...prev, items: newItems };
      });
    }
  };

  const handleDeleteItem = async (idx) => {
    const item = items[idx];
    try {
      const res = await fetch(`${API_BASE}/api/v1/orders/${order.order_id || order.id}/items/${item.item_id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete item");
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      setSel(s => s.filter(i => i !== idx));
    } catch (err) {
      console.error("Delete failed:", err);
      setOrder(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== idx)
      }));
      setSel(s => s.filter(i => i !== idx));
    }
  };

  const handleHold = async () => {
    if (!order.id) return;
    try {
      await fetch(`${API_BASE}/api/v1/orders/${order.order_id || order.id}/hold`, { method: "POST" });
      onSave(order); // Return to snapshot
    } catch (err) {
      onSave(order);
    }
  };

  // Auto-hold on navigate away or idle
  useEffect(() => {
    return () => {
      // This is basic. In a real app we'd need to know if we're "leaving"
      // or just unmounting due to screen change.
      // For now, if order is active and we unmount, we should hold.
      if (order.id && items.length > 0) {
        fetch(`${API_BASE}/api/v1/orders/${order.order_id || order.id}/hold`, { method: "POST" });
      }
    };
  }, [order.id, items.length]);

  // Idle timeout (5 minutes)
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (order.id && items.length > 0) {
          handleHold();
        } else {
          onSave(null); // Return to login/snapshot if empty
        }
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [order.id, items.length]);

  return (
    <div style={{ flex: 1, display: "flex", background: C.bg, height: "100%", overflow: "hidden" }}>
      {/* LEFT PANEL (~35%): Check View */}
      <div style={{ width: "35%", borderRight: `1px solid ${C.dg}`, display: "flex", flexDirection: "column" }}>
        
        {/* 2.1 Check Header */}
        <div style={{ height: "60px", borderBottom: `2px solid ${C.mint}`, padding: "8px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...T.header, fontSize: "18px" }}>#{order.order_number || "---"}</span>
            <span style={{ ...T.header, fontSize: "18px" }}>${cardTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
            <span style={{ ...T.body, borderBottom: `1px dashed ${C.mint}`, cursor: "pointer" }}>{order.order_type || "Walk-up"} ▾</span>
            <span style={{ ...T.body, borderBottom: `1px dashed ${C.mint}`, cursor: "pointer", flex: 1 }}>{order.customer_name ? order.customer_name : "+ Name"}</span>
          </div>
        </div>

        {/* 2.2 Check Rail (Scrollable) */}
        <div 
          ref={railRef}
          style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "4px" }}
          onClick={() => setSel([])}
        >
          {items.map((item, idx) => {
            const isSelected = selIdxs.includes(idx);
            return (
              <div 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); toggleSel(idx); }}
                style={{ 
                  padding: "6px",
                  border: isSelected ? `1px solid ${C.mint}` : "1px solid transparent",
                  background: isSelected ? `${C.mint}22` : "transparent",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", ...T.body, fontSize: "16px" }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.modifiers && item.modifiers.map((mod, midx) => (
                  <div key={midx} style={{ ...T.body, fontSize: "13px", paddingLeft: "20px", color: C.mint + "AA" }}>
                    {mod.action} {mod.name} {mod.price ? `+$${mod.price.toFixed(2)}` : ""}
                  </div>
                ))}
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ ...T.body, textAlign: "center", marginTop: "40px", opacity: 0.5 }}>
              READY FOR FIRST ITEM
            </div>
          )}
        </div>

        {/* 2.3 Check Footer (Fixed) */}
        <div style={{ borderTop: `2px solid ${C.mint}`, padding: "8px", ...T.body, color: C.yellow }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: 3 }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: 3 }}>
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", marginTop: "5px", fontWeight: "bold" }}>
            <span>Card Total</span>
            <span>${cardTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", opacity: 0.8 }}>
            <span>Cash Total</span>
            <span>${cashTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* 5. Action Bar (Contextual) */}
        <div style={{ height: "80px", borderTop: `1px solid ${C.dg}`, padding: "8px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
          {selIdxs.length === 0 ? (
            <>
              <button onClick={() => items.length > 0 && onPayment({ ...order, items, subtotal, tax, total: cardTotal, cardTotal, cashTotal })} style={{ ...T.btn, gridColumn: "span 1", opacity: items.length > 0 ? 1 : 0.5 }}>PAY FULL</button>
              <button onClick={() => items.length > 0 && onReview(order)} style={{ ...T.btn, gridColumn: "span 1", opacity: items.length > 0 ? 1 : 0.5 }}>REVIEW</button>
              <button onClick={handleHold} style={{ ...T.btn, gridColumn: "span 1", opacity: items.length > 0 ? 1 : 0.5 }}>HOLD</button>
              <button onClick={handleCancelCheck} style={{ ...T.btn, gridColumn: "span 1", color: C.red, borderColor: C.red }}>CANCEL</button>
            </>
          ) : selIdxs.length === 1 ? (
            <>
              <button onClick={() => setModTarget({ item: items[selIdxs[0]], index: selIdxs[0] })} style={{ ...T.btn }}>MODIFY</button>
              <button onClick={() => handleQtyChange(selIdxs[0], 1)} style={{ ...T.btn }}>QTY +</button>
              <button onClick={() => handleQtyChange(selIdxs[0], -1)} style={{ ...T.btn }}>QTY -</button>
              <button onClick={() => handleDeleteItem(selIdxs[0])} style={{ ...T.btn, color: C.red, borderColor: C.red }}>DELETE</button>
            </>
          ) : (
            <>
              <button style={{ ...T.btn, gridColumn: "span 2" }}>MODIFY ALL</button>
              <button onClick={() => { if(window.confirm("Delete all selected?")) selIdxs.forEach(i => handleDeleteItem(i)); }} style={{ ...T.btn, gridColumn: "span 2", color: C.red, borderColor: C.red }}>DELETE ALL</button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT PANEL (~65%): Menu Area / Modifier Panel */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column" }}>
        {modTarget ? (
          /* 4. Modifier Panel */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#222" }}>
            {/* Prefix Row */}
            <div style={{ display: "flex", gap: "8px", padding: "12px", borderBottom: `1px solid ${C.dg}` }}>
              {PREFIXES.map(p => (
                <button 
                  key={p} 
                  onClick={() => setActivePrefix(p)}
                  style={{
                    ...T.btn,
                    flex: 1,
                    background: activePrefix === p ? C.mint : "transparent",
                    color: activePrefix === p ? C.black : C.mint
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            
            {/* Modifier Grid (Universal for v0.9) */}
            <div style={{ 
              flex: 1, 
              padding: "12px", 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gridAutoRows: "80px",
              gap: "10px",
              overflowY: "auto"
            }}>
              {/* Show item-specific groups first if any, then universal */}
              {modifierGroups.map((group) => (
                group.modifiers.map((mod) => (
                  <button 
                    key={mod.id || mod.name} 
                    onClick={() => handleModifierTap(mod)}
                    style={{ ...T.btn, height: "100%", flexDirection: "column" }}
                  >
                    <span style={{ fontSize: "14px" }}>{mod.name}</span>
                    {mod.price > 0 && <span style={{ fontSize: "11px", opacity: 0.8 }}>+${mod.price.toFixed(2)}</span>}
                  </button>
                ))
              ))}
              {/* Fallback universal modifiers from spec if groups empty */}
              {modifierGroups.length === 0 && ["Onions", "Jalapeños", "Cheese", "Bacon", "Avocado"].map(name => (
                <button 
                  key={name} 
                  onClick={() => handleModifierTap({ name, price: 0 })}
                  style={{ ...T.btn, height: "100%" }}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Cancel/Confirm Footer */}
            <div style={{ padding: "12px", borderTop: `1px solid ${C.dg}`, display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setModTarget(null)}
                style={{ ...T.btn, flex: 1, background: C.mint, color: C.black }}
              >
                DONE
              </button>
            </div>
          </div>
        ) : (
          /* Menu Grid */
          <>
            {/* 3.1 Category Tabs */}
        <div style={{ 
          height: "50px", 
          borderBottom: `1px solid ${C.dg}`, 
          display: "flex", 
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {menuCategories.map(c => (
            <div 
              key={c} 
              onClick={() => setCat(c)}
              style={{
                ...T.header,
                padding: "0 20px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                borderBottom: cat === c ? `4px solid ${C.mint}` : "none",
                background: cat === c ? `${C.mint}11` : "transparent"
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {/* 3.2 Item Grid */}
        <div style={{ 
          flex: 1, 
          padding: "12px", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gridAutoRows: "100px",
          gap: "10px",
          overflowY: "auto"
        }}>
          {menu && cat && menu[cat] && menu[cat].map((mItem, idx) => {
            const is86 = mItem.is_86 || mItem.out_of_stock;
            return (
              <button 
                key={idx} 
                onClick={() => !is86 && handleItemTap(mItem)}
                style={{
                  ...T.btn,
                  height: "100%",
                  flexDirection: "column",
                  gap: "4px",
                  opacity: is86 ? 0.3 : 1,
                  cursor: is86 ? "not-allowed" : "pointer",
                  borderColor: is86 ? C.gray : C.mint
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{mItem.name}</span>
                <span style={{ fontSize: "12px", opacity: 0.8 }}>${mItem.price.toFixed(2)}</span>
                {is86 && <span style={{ fontSize: "10px", color: C.red }}>86'D</span>}
              </button>
            );
          })}
          <button 
            onClick={() => setShowOpenItem(true)}
            style={{ ...T.btn, height: "100%", borderStyle: "dashed" }}
          >
            OPEN ITEM
          </button>
        </div>
      </>
    )}
  </div>

      {/* Open Item Modal */}
      {showOpenItem && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{ background: C.bg, border: `2px solid ${C.mint}`, padding: "20px", width: "300px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <h3 style={{ ...T.header, margin: 0 }}>Open Item</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ ...T.body, fontSize: "12px" }}>Name</label>
              <input 
                type="text" 
                value={openItemData.name}
                onChange={(e) => setOpenItemData(d => ({ ...d, name: e.target.value }))}
                style={{ background: "#222", border: `1px solid ${C.mint}`, color: C.mint, padding: "8px", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ ...T.body, fontSize: "12px" }}>Price</label>
              <input 
                type="number" 
                step="0.01"
                value={openItemData.price}
                onChange={(e) => setOpenItemData(d => ({ ...d, price: e.target.value }))}
                style={{ background: "#222", border: `1px solid ${C.mint}`, color: C.mint, padding: "8px", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleOpenItemConfirm} style={{ ...T.btn, flex: 1 }}>ADD</button>
              <button onClick={() => setShowOpenItem(false)} style={{ ...T.btn, flex: 1, borderColor: C.gray, color: C.gray }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
