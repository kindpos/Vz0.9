/**
 * KINDpos — Shared State Object
 * Single source of truth. All components import `S` and read/write directly.
 * Phase 2: Replace with event-driven stores.
 */

const S = {
    // ── Identity ──
    server: null,
    activeOrders: [],
    offlineMode: false,

    // ── Config ──
    TAX_RATE: 0.07,

    // ── Check ──
    activeSeats: [1],
    viewAllSeats: false,
    checkItems: [],
    nextItemId: 1,

    // ── Modifier Zone ──
    modState: {
        active: false,
        itemName: null,
        itemPrice: 0,
        itemColor: 'orange',
        requiredMods: [],
        optionalMods: [],
        selectedMods: {},
        editingItemId: null,
        activeCat: null,
        itemCenter: null,
        modCatPositions: {}
    },

    // ── Payment ──
    payState: {
        active: false,
        step: 'split_select',
        splitType: null,
        selectedSeat: null,
        evenCount: null,
        selectedItemIds: [],
        payingItemIds: [],
        currentAmount: 0,
        tenderAmount: 0,
        authCode: null,
        lastFour: null,
        payments: [],
        totalPaid: 0
    },

    // ── Price Helpers ──
    getItemTotal(item) {
        return item.price + item.modifiers.reduce((s, m) => s + m.price, 0);
    },
    getCheckTotal() {
        return S.checkItems.reduce((sum, item) => sum + S.getItemTotal(item), 0);
    },
    getRemainingBalance() {
        return S.getCheckTotal() - S.payState.totalPaid;
    },
    getUnpaidItems() {
        return S.checkItems.filter(i => !i.paid);
    },
    getSeatTotal(seatNum) {
        return S.checkItems.filter(i => i.seat == seatNum && !i.paid)
            .reduce((sum, i) => sum + S.getItemTotal(i), 0);
    },
    getSelectedSeatsTotal() {
        if (S.viewAllSeats) return S.getCheckTotal();
        return S.activeSeats.reduce((sum, seatNum) => sum + S.getSeatTotal(seatNum), 0);
    },
    hasSentItems() {
        return S.checkItems.some(i => i.sent);
    },

    // ── Mod Helpers ──
    resetModState() {
        Object.assign(S.modState, {
            active: false, itemName: null, itemPrice: 0, itemColor: 'orange',
            requiredMods: [], optionalMods: [], selectedMods: {},
            editingItemId: null, activeCat: null, itemCenter: null, modCatPositions: {}
        });
    }
};

export default S;
