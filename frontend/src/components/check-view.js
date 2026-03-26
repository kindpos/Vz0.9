/**
 * KINDpos — Check View
 * Renders check list, seat dividers, item states, footer totals.
 * MIGRATED from kindpos-order-screen-v2.html
 */

import S from '../stores/state.js';

let onPayButtonUpdate = null;

export function init(callbacks = {}) {
    onPayButtonUpdate = callbacks.onPayButtonUpdate || null;
}

function getModDisplayLabel(mod) {
    const prefixes = { temp: 'Temp', side: 'Side', add: 'EXTRA', no: 'NO', sub: 'SUB' };
    return `${prefixes[mod.type] || mod.type}: ${mod.value}`;
}

export function addItemToCheck(name, price, modifiers = []) {
    // Items are assigned to the FIRST active seat if multiple are selected, or the only active seat.
    const targetSeat = S.activeSeats.length > 0 ? S.activeSeats[0] : 1;
    const item = { name, price, seat: targetSeat, id: S.nextItemId++, modifiers, sent: false, paid: false };
    S.checkItems.push(item);
    renderCheck();
    const cv = document.getElementById('check-view');
    cv.scrollTop = cv.scrollHeight;
}

export function updateItemMods(itemId, modifiers) {
    const item = S.checkItems.find(i => i.id === itemId);
    if (item) {
        item.modifiers = modifiers;
        renderCheck();
    }
}

export function toggleSelectItem(el) {
    if (S.modState.active) return;
    if (S.payState.active) return;
    const itemId = parseInt(el.dataset.id);
    const item = S.checkItems.find(i => i.id === itemId);
    if (item && item.paid) return;
    el.classList.toggle('selected');
    checkBridgeState();
}

export function selectSeatItems(seatNum) {
    if (S.modState.active) return;
    document.querySelectorAll('.order-item.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll(`.order-item[data-seat="${seatNum}"]`).forEach(el => {
        el.classList.add('selected');
    });
    checkBridgeState();
}

export function checkBridgeState() {
    const bridge = document.getElementById('action-bridge');
    if (!bridge) return;
    const any = document.querySelectorAll('.order-item.selected').length > 0;
    bridge.classList.toggle('active', any);
}

export function bridgeRemove() {
    const selected = document.querySelectorAll('.order-item.selected');
    const idsToRemove = [];
    selected.forEach(el => {
        const id = parseInt(el.dataset.id);
        const item = S.checkItems.find(i => i.id === id);
        if (item && !item.sent) idsToRemove.push(id);
    });
    if (idsToRemove.length === 0) return;
    S.checkItems = S.checkItems.filter(i => !idsToRemove.includes(i.id));
    renderCheck();
    checkBridgeState();
}

export function bridgeSend() {
    const selected = document.querySelectorAll('.order-item.selected');
    selected.forEach(el => {
        const id = parseInt(el.dataset.id);
        const item = S.checkItems.find(i => i.id === id);
        if (item) item.sent = true;
    });
    document.querySelectorAll('.order-item.selected').forEach(el => el.classList.remove('selected'));
    renderCheck();
    checkBridgeState();
}

export function renderCheck() {
    const cv = document.getElementById('check-view');

    if (S.checkItems.length === 0) {
        cv.innerHTML = '<div class="empty-check">TAP AN ITEM TO BEGIN</div>';
        updateFooter(0, 0);
        if (onPayButtonUpdate) onPayButtonUpdate();
        return;
    }

    const seats = {};
    S.checkItems.forEach(item => {
        // If not viewing all seats, filter to only show active seats
        if (!S.viewAllSeats && !S.activeSeats.includes(item.seat)) return;
        
        if (!seats[item.seat]) seats[item.seat] = [];
        seats[item.seat].push(item);
    });

    let html = '';
    const seatNums = Object.keys(seats).sort((a, b) => a - b);

    seatNums.forEach(seatNum => {
        html += `<div class="seat-divider" data-seat-div="${seatNum}">
            <div class="seat-divider-line"></div>
            <span class="seat-divider-label">SEAT ${seatNum}</span>
            <div class="seat-divider-line"></div>
        </div>`;

        seats[seatNum].forEach(item => {
            const isPending = S.modState.active && S.modState.editingItemId === item.id;
            const sentClass = item.sent ? 'sent' : '';
            const paidClass = item.paid ? 'paid' : '';
            let modsHtml = '';
            item.modifiers.forEach((mod, mi) => {
                const branch = mi === item.modifiers.length - 1 ? '┗━' : '┣━';
                modsHtml += `<div class="modifier-line">
                    <span class="modifier-branch">${branch}</span>
                    <span class="modifier-text">${getModDisplayLabel(mod)}</span>
                    <span class="modifier-dots"></span>
                    <span class="modifier-price">${mod.price > 0 ? '+$' + mod.price.toFixed(2) : ''}</span>
                </div>`;
            });

            html += `<div class="order-item just-added ${isPending ? 'pending' : ''} ${sentClass} ${paidClass}" data-id="${item.id}" data-seat="${item.seat}">
                <div class="order-item-details">
                    <div class="order-item-name"><span class="order-item-qty">1×</span> ${item.name}</div>
                    ${modsHtml}
                </div>
                <div class="order-item-price">$${item.price.toFixed(2)}</div>
            </div>`;
        });
    });

    cv.innerHTML = html;

    // Attach click handlers (replacing inline onclick)
    cv.querySelectorAll('.order-item').forEach(el => {
        el.addEventListener('click', () => toggleSelectItem(el));
    });
    cv.querySelectorAll('.seat-divider').forEach(el => {
        el.addEventListener('click', () => selectSeatItems(parseInt(el.dataset.seatDiv)));
    });

    setTimeout(() => {
        cv.querySelectorAll('.just-added').forEach(el => el.classList.remove('just-added'));
    }, 600);

    let subtotal = 0;
    let itemCount = 0;
    S.checkItems.forEach(item => {
        if (S.viewAllSeats || S.activeSeats.includes(item.seat)) {
            subtotal += item.price + item.modifiers.reduce((s, m) => s + m.price, 0);
            itemCount++;
        }
    });
    updateFooter(itemCount, subtotal);
    if (onPayButtonUpdate) onPayButtonUpdate();
}

function updateFooter(count, subtotal) {
    const tax = subtotal * S.TAX_RATE;
    const total = subtotal + tax;
    document.getElementById('footer-count').textContent = count + (count === 1 ? ' item' : ' items');
    document.getElementById('footer-subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('footer-tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('footer-total').textContent = '$' + total.toFixed(2);
}
