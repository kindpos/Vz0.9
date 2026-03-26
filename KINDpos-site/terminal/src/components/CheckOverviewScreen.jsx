import { useState, useMemo, useCallback } from 'react';

const C = {
  bg: "#333333",
  mint: "#C6FFBB",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  dg: "#444444",
  red: "#FF4444"
};

const T = {
  header: {
    fontFamily: "'Alien Encounters', sans-serif",
    color: C.mint,
    letterSpacing: "2px",
    textTransform: "uppercase"
  },
  body: {
    fontFamily: "'Sevastopol Interface', monospace",
    color: C.mint
  },
  btn: {
    background: "transparent",
    border: `2px solid ${C.mint}`,
    color: C.mint,
    padding: "8px 12px",
    cursor: "pointer",
    fontFamily: "'Sevastopol Interface', monospace",
    fontSize: "14px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none"
  }
};

// Extract tax rate and cash discount from store config, with fallbacks
function extractRates(storeConfig) {
  let taxRate = 0.07;
  let cashDiscount = 0.0;
  if (storeConfig) {
    const allRule = (storeConfig.tax_rules || []).find(r => r.applies_to === "all");
    if (allRule) taxRate = allRule.rate_percent / 100;
    if (storeConfig.cash_discount_rate != null) {
      cashDiscount = storeConfig.cash_discount_rate / 100;
    }
  }
  return { taxRate, cashDiscount };
}

function buildPayload(order, itemSubset, taxRate, cashDiscount) {
  const subtotal = itemSubset.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const tax = subtotal * taxRate;
  const cardTotal = subtotal + tax;
  const cashTotal = cardTotal * (1 - cashDiscount);
  return {
    items: itemSubset.map(i => ({ ...i, qty: i.quantity || 1 })),
    subtotal,
    tax,
    cardTotal,
    cashTotal,
    order
  };
}

export default function CheckOverviewScreen({ order, storeConfig, onPayment, onBack }) {
  const items = useMemo(() => order?.items || [], [order?.items]);

  // Local state — seats, sent, expand, selection
  const [seatMap, setSeatMap] = useState(() => {
    const m = {};
    items.forEach(i => { m[i.item_id] = null; });
    return m;
  });
  const [sentSet, setSentSet] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(() => new Set());

  // Transfer overlay state
  const [showTransfer, setShowTransfer] = useState(false);
  const [workingMap, setWorkingMap] = useState({});
  const [transferPicks, setTransferPicks] = useState(() => new Set());
  const [undoStack, setUndoStack] = useState([]);

  const { taxRate, cashDiscount } = useMemo(() => extractRates(storeConfig), [storeConfig]);

  // Group items by seat
  const seatGroups = useMemo(() => {
    const groups = new Map();
    items.forEach(item => {
      const seat = seatMap[item.item_id] ?? null;
      const key = seat === null ? "shared" : seat;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    // Sort: shared first, then seat numbers ascending
    const sorted = new Map();
    if (groups.has("shared")) sorted.set("shared", groups.get("shared"));
    [...groups.keys()]
      .filter(k => k !== "shared")
      .sort((a, b) => a - b)
      .forEach(k => sorted.set(k, groups.get(k)));
    return sorted;
  }, [items, seatMap]);

  const hasUnsent = useMemo(() => items.some(i => !sentSet.has(i.item_id)), [items, sentSet]);

  const seatSubtotal = useCallback((seatItems) => {
    return seatItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  }, []);

  const selectedSubtotal = useMemo(() => {
    let total = 0;
    for (const [key, seatItems] of seatGroups) {
      if (selectedSeats.has(key)) total += seatSubtotal(seatItems);
    }
    return total;
  }, [seatGroups, selectedSeats, seatSubtotal]);

  // Handlers
  const toggleSeatSelection = (key) => {
    setSelectedSeats(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSend = () => {
    setSentSet(prev => {
      const next = new Set(prev);
      items.forEach(i => next.add(i.item_id));
      return next;
    });
  };

  const handlePayAll = () => {
    onPayment(buildPayload(order, items, taxRate, cashDiscount));
  };

  const handlePaySelected = () => {
    const selected = items.filter(i => {
      const seat = seatMap[i.item_id] ?? null;
      const key = seat === null ? "shared" : seat;
      return selectedSeats.has(key);
    });
    if (selected.length > 0) {
      onPayment(buildPayload(order, selected, taxRate, cashDiscount));
    }
  };

  // Transfer overlay handlers
  const openTransfer = () => {
    setWorkingMap({ ...seatMap });
    setTransferPicks(new Set());
    setUndoStack([]);
    setShowTransfer(true);
  };

  const toggleTransferPick = (itemId) => {
    setTransferPicks(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const movePicksToSeat = (destSeat) => {
    if (transferPicks.size === 0) return;
    const moves = [];
    const nextMap = { ...workingMap };
    for (const itemId of transferPicks) {
      const from = nextMap[itemId] ?? null;
      const fromKey = from === null ? "shared" : from;
      const toKey = destSeat === "shared" ? null : destSeat;
      if (fromKey !== (destSeat === "shared" ? "shared" : destSeat)) {
        moves.push({ itemId, from: fromKey, to: destSeat });
        nextMap[itemId] = toKey;
      }
    }
    if (moves.length > 0) {
      setUndoStack(prev => [...prev, moves]);
      setWorkingMap(nextMap);
      setTransferPicks(new Set());
    }
  };

  const handleTransferUndo = () => {
    if (undoStack.length === 0) return;
    const lastMoves = undoStack[undoStack.length - 1];
    const nextMap = { ...workingMap };
    for (const { itemId, from } of lastMoves) {
      nextMap[itemId] = from === "shared" ? null : from;
    }
    setWorkingMap(nextMap);
    setUndoStack(prev => prev.slice(0, -1));
    setTransferPicks(new Set());
  };

  const handleTransferConfirm = () => {
    setSeatMap(workingMap);
    setShowTransfer(false);
  };

  const handleTransferCancel = () => {
    setShowTransfer(false);
  };

  const addNewSeat = () => {
    const existingSeats = Object.values(workingMap).filter(v => v !== null);
    const maxSeat = existingSeats.length > 0 ? Math.max(...existingSeats) : 0;
    movePicksToSeat(maxSeat + 1);
  };

  // Transfer overlay seat groups (from workingMap)
  const transferGroups = useMemo(() => {
    if (!showTransfer) return new Map();
    const groups = new Map();
    items.forEach(item => {
      const seat = workingMap[item.item_id] ?? null;
      const key = seat === null ? "shared" : seat;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    const sorted = new Map();
    if (groups.has("shared")) sorted.set("shared", groups.get("shared"));
    [...groups.keys()]
      .filter(k => k !== "shared")
      .sort((a, b) => a - b)
      .forEach(k => sorted.set(k, groups.get(k)));
    return sorted;
  }, [items, workingMap, showTransfer]);

  // Seat label helper
  const seatLabel = (key) => key === "shared" ? "SHARED" : `SEAT ${key}`;

  // Empty order
  if (items.length === 0) {
    return (
      <div style={{ flex: 1, background: C.bg, display: "flex", flexDirection: "column", ...T.body }}>
        <div style={{ padding: "12px 16px", borderBottom: `2px solid ${C.mint}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...T.header, fontSize: "18px" }}>CHECK #{order?.order_number || "---"}</span>
          <button onClick={onBack} style={{ ...T.btn, fontSize: "12px" }}>← BACK</button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
          <span style={{ ...T.header, fontSize: "16px" }}>NO ITEMS ON CHECK</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, background: C.bg, display: "flex", flexDirection: "column", ...T.body, position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `2px solid ${C.mint}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ ...T.header, fontSize: "18px" }}>CHECK #{order?.order_number || "---"}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {order?.customer_name && <span style={{ fontSize: "13px", opacity: 0.7 }}>{order.customer_name}</span>}
          <button onClick={onBack} style={{ ...T.btn, fontSize: "12px" }}>← BACK</button>
        </div>
      </div>

      {/* Scrollable Seat Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {[...seatGroups.entries()].map(([key, seatItems]) => {
          const isSelected = selectedSeats.has(key);
          const sub = seatSubtotal(seatItems);
          return (
            <div key={key} style={{
              border: `2px solid ${isSelected ? C.mint : C.dg}`,
              background: isSelected ? `${C.mint}11` : "transparent",
              marginBottom: "10px"
            }}>
              {/* Seat Header — tap to select for payment */}
              <div
                onClick={() => toggleSeatSelection(key)}
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  borderBottom: `1px solid ${isSelected ? C.mint : C.dg}`,
                  background: isSelected ? `${C.mint}22` : `${C.dg}44`
                }}
              >
                <span style={{ ...T.header, fontSize: "14px" }}>{seatLabel(key)}</span>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>${sub.toFixed(2)}</span>
              </div>

              {/* Item Rows */}
              {seatItems.map(item => {
                const isSent = sentSet.has(item.item_id);
                const isExpanded = expandedId === item.item_id;
                return (
                  <div key={item.item_id}>
                    {/* Condensed row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.item_id)}
                      style={{
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        cursor: "pointer",
                        opacity: isSent ? 0.5 : 1,
                        borderBottom: `1px solid ${C.dg}33`
                      }}
                    >
                      <span style={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(item.quantity || 1) > 1 && <span style={{ opacity: 0.7 }}>{item.quantity}× </span>}
                        {item.name}
                      </span>
                      {isExpanded && <span style={{ fontSize: "11px", opacity: 0.6 }}>▼</span>}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: "4px 12px 8px 24px", borderBottom: `1px solid ${C.dg}33` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span>{item.name}</span>
                          <span>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                        {(item.modifiers || []).map((mod, mi) => (
                          <div key={mi} style={{ fontSize: "12px", color: `${C.mint}AA`, marginTop: "2px" }}>
                            {mod.name}{mod.price > 0 ? ` +$${mod.price.toFixed(2)}` : ""}
                          </div>
                        ))}
                        {isSent && <div style={{ fontSize: "11px", color: C.gray, marginTop: "2px" }}>SENT</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div style={{
        height: "70px",
        borderTop: `2px solid ${C.mint}`,
        padding: "8px 16px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        flexShrink: 0
      }}>
        {hasUnsent && (
          <button onClick={handleSend} style={{ ...T.btn, flex: 1 }}>SEND</button>
        )}
        <button onClick={openTransfer} style={{ ...T.btn, flex: 1 }}>TRANSFER</button>
        <button
          onClick={handlePaySelected}
          style={{
            ...T.btn,
            flex: 2,
            opacity: selectedSeats.size > 0 ? 1 : 0.4,
            cursor: selectedSeats.size > 0 ? "pointer" : "default"
          }}
        >
          PAY SELECTED{selectedSeats.size > 0 ? ` $${selectedSubtotal.toFixed(2)}` : ""}
        </button>
        <button onClick={handlePayAll} style={{ ...T.btn, flex: 1, background: C.mint, color: C.black }}>PAY ALL</button>
      </div>

      {/* Transfer Overlay */}
      {showTransfer && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column",
          zIndex: 100
        }}>
          {/* Transfer Header */}
          <div style={{
            padding: "12px 16px",
            borderBottom: `2px solid ${C.mint}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}>
            <span style={{ ...T.header, fontSize: "16px" }}>TRANSFER ITEMS</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleTransferUndo}
                style={{ ...T.btn, fontSize: "12px", opacity: undoStack.length > 0 ? 1 : 0.4 }}
              >UNDO</button>
              <button
                onClick={handleTransferConfirm}
                style={{ ...T.btn, fontSize: "12px", background: C.mint, color: C.black }}
              >CONFIRM</button>
              <button
                onClick={handleTransferCancel}
                style={{ ...T.btn, fontSize: "12px", borderColor: C.red, color: C.red }}
              >CANCEL</button>
            </div>
          </div>

          {/* Transfer Columns */}
          <div style={{ flex: 1, display: "flex", overflowX: "auto", padding: "12px 8px" }}>
            {[...transferGroups.entries()].map(([key, seatItems]) => (
              <div key={key} style={{
                minWidth: "160px",
                flex: 1,
                border: `1px solid ${C.dg}`,
                marginRight: "8px",
                display: "flex",
                flexDirection: "column"
              }}>
                {/* Column header — tap to move items here */}
                <div
                  onClick={() => movePicksToSeat(key)}
                  style={{
                    padding: "8px",
                    borderBottom: `1px solid ${C.dg}`,
                    cursor: "pointer",
                    background: `${C.dg}66`,
                    textAlign: "center"
                  }}
                >
                  <span style={{ ...T.header, fontSize: "12px" }}>{seatLabel(key)}</span>
                </div>
                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {seatItems.map(item => {
                    const isPicked = transferPicks.has(item.item_id);
                    return (
                      <div
                        key={item.item_id}
                        onClick={() => toggleTransferPick(item.item_id)}
                        style={{
                          padding: "6px 8px",
                          fontSize: "12px",
                          cursor: "pointer",
                          background: isPicked ? `${C.mint}33` : "transparent",
                          borderBottom: `1px solid ${C.dg}22`,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span style={{
                          width: "14px", height: "14px",
                          border: `1px solid ${C.mint}`,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", flexShrink: 0
                        }}>
                          {isPicked ? "✓" : ""}
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* + NEW SEAT column */}
            <div
              onClick={addNewSeat}
              style={{
                minWidth: "120px",
                border: `1px dashed ${C.mint}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: transferPicks.size > 0 ? "pointer" : "default",
                opacity: transferPicks.size > 0 ? 1 : 0.3
              }}
            >
              <span style={{ ...T.header, fontSize: "12px" }}>+ NEW SEAT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
