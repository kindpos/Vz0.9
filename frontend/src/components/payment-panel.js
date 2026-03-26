/**
 * KINDpos — Payment Panel
 * Full payment flow: split → method → tender/card → confirm.
 * MIGRATED from kindpos-order-screen-v2.html
 */

import S from '../stores/state.js';

let onPaymentRecorded = null; // () => void — triggers renderCheck

export function init(callbacks = {}) {
    onPaymentRecorded = callbacks.onPaymentRecorded || null;
}

export function updatePayButton() {
    const btn = document.getElementById('pay-trigger');
    const shouldShow = S.hasSentItems() && S.getRemainingBalance() > 0 && !S.payState.active && !S.modState.active;
    btn.classList.toggle('hidden', !shouldShow);
}

export function openPayment() {
    S.payState.active = true;
    S.payState.step = 'split_select';
    S.payState.splitType = null;
    S.payState.selectedSeat = null;
    S.payState.evenCount = null;
    S.payState.selectedItemIds = [];
    S.payState.currentAmount = 0;

    document.getElementById('pay-trigger').classList.add('hidden');
    document.getElementById('pay-panel').classList.add('open');
    updatePayFooter();
    renderPayStep();
}

export function closePayment() {
    S.payState.active = false;
    document.getElementById('pay-panel').classList.remove('open');
    setTimeout(() => updatePayButton(), 400);
    if (onPaymentRecorded) onPaymentRecorded();
}

function updatePayFooter() {
    const remaining = S.getRemainingBalance();
    document.getElementById('pay-footer-label').textContent = remaining <= 0 ? 'BALANCE' : 'REMAINING';
    document.getElementById('pay-footer-value').textContent = '$' + Math.max(0, remaining).toFixed(2);
}

function renderPayStep() {
    const body = document.getElementById('pay-body');
    const remaining = S.getRemainingBalance();
    const ps = S.payState;

    switch (ps.step) {
        case 'split_select':
            body.innerHTML = `
                <div class="pay-amount-display">$${remaining.toFixed(2)}</div>
                <div class="pay-amount-label">BALANCE DUE</div>
                <hr class="pay-divider">
                <div class="pay-grid">
                    <button class="pay-btn wide yellow" data-action="split-full">FULL</button>
                    <button class="pay-btn wide orange" data-action="split-seat">BY SEAT</button>
                    <button class="pay-btn wide blue" data-action="split-even">EVEN SPLIT</button>
                    <button class="pay-btn wide" data-action="split-item">BY ITEM</button>
                </div>`;
            body.querySelector('[data-action="split-full"]').addEventListener('click', () => selectSplit('full'));
            body.querySelector('[data-action="split-seat"]').addEventListener('click', () => selectSplit('seat'));
            body.querySelector('[data-action="split-even"]').addEventListener('click', () => selectSplit('even'));
            body.querySelector('[data-action="split-item"]').addEventListener('click', () => selectSplit('item'));
            break;

        case 'seat_select': {
            const seatNums = [...new Set(S.getUnpaidItems().map(i => i.seat))].sort();
            let seatBtns = seatNums.map(s => {
                const total = S.getSeatTotal(s);
                return `<button class="pay-btn" data-seat="${s}">SEAT ${s}<br><span style="font-size:11px;opacity:0.7">$${total.toFixed(2)}</span></button>`;
            }).join('');
            body.innerHTML = `
                <div class="pay-amount-display">$${remaining.toFixed(2)}</div>
                <div class="pay-amount-label">SELECT SEAT</div>
                <hr class="pay-divider">
                <div class="pay-grid">${seatBtns}</div>
                <hr class="pay-divider">
                <button class="pay-btn small red" data-action="back">BACK</button>`;
            seatNums.forEach(s => {
                body.querySelector(`[data-seat="${s}"]`).addEventListener('click', () => selectPaySeat(s));
            });
            body.querySelector('[data-action="back"]').addEventListener('click', payStepBack);
            break;
        }

        case 'even_select': {
            let evenBtns = '';
            for (let n = 2; n <= 6; n++) {
                const amt = remaining / n;
                evenBtns += `<button class="pay-btn" data-even="${n}">÷ ${n}<br><span style="font-size:11px;opacity:0.7">$${amt.toFixed(2)} ea</span></button>`;
            }
            body.innerHTML = `
                <div class="pay-amount-display">$${remaining.toFixed(2)}</div>
                <div class="pay-amount-label">SPLIT EVENLY</div>
                <hr class="pay-divider">
                <div class="pay-grid">${evenBtns}</div>
                <hr class="pay-divider">
                <button class="pay-btn small red" data-action="back">BACK</button>`;
            for (let n = 2; n <= 6; n++) {
                body.querySelector(`[data-even="${n}"]`).addEventListener('click', () => selectEvenCount(n));
            }
            body.querySelector('[data-action="back"]').addEventListener('click', payStepBack);
            break;
        }

        case 'item_select': {
            let itemRows = '';
            S.checkItems.forEach(item => {
                const total = S.getItemTotal(item);
                const isPaid = item.paid;
                const isChecked = ps.selectedItemIds.includes(item.id);
                const cls = isPaid ? 'already-paid' : (isChecked ? 'checked' : '');
                itemRows += `<div class="pay-item-row ${cls}" data-pay-item="${item.id}">
                    <div class="pay-item-check">${isChecked ? '✓' : ''}</div>
                    <span class="pay-item-name">S${item.seat} · ${item.name}</span>
                    <span class="pay-item-price">$${total.toFixed(2)}</span>
                </div>`;
            });
            const selectedTotal = ps.selectedItemIds.reduce((sum, id) => {
                const item = S.checkItems.find(i => i.id === id);
                return sum + (item ? S.getItemTotal(item) : 0);
            }, 0);
            const canProceed = ps.selectedItemIds.length > 0;
            body.innerHTML = `
                <div class="pay-amount-display">$${selectedTotal.toFixed(2)}</div>
                <div class="pay-amount-label">${ps.selectedItemIds.length} ITEM${ps.selectedItemIds.length !== 1 ? 'S' : ''} SELECTED</div>
                <hr class="pay-divider">
                <div style="width:100%;max-width:400px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
                    ${itemRows}
                </div>
                <hr class="pay-divider">
                <div class="pay-grid">
                    ${canProceed ? '<button class="pay-btn wide green" data-action="confirm-items">CONTINUE</button>' : ''}
                    <button class="pay-btn small red" data-action="back">BACK</button>
                </div>`;
            S.checkItems.forEach(item => {
                const row = body.querySelector(`[data-pay-item="${item.id}"]`);
                if (row) row.addEventListener('click', () => togglePayItem(item.id));
            });
            if (canProceed) body.querySelector('[data-action="confirm-items"]').addEventListener('click', confirmItemSelection);
            body.querySelector('[data-action="back"]').addEventListener('click', payStepBack);
            break;
        }

        case 'method_select':
            body.innerHTML = `
                <div class="pay-amount-display">$${ps.currentAmount.toFixed(2)}</div>
                <div class="pay-amount-label">PAYMENT METHOD</div>
                <hr class="pay-divider">
                <div class="pay-grid">
                    <button class="pay-btn wide blue" data-action="card">CARD</button>
                    <button class="pay-btn wide green" data-action="cash">CASH</button>
                </div>
                <hr class="pay-divider">
                <button class="pay-btn small red" data-action="back">BACK</button>`;
            body.querySelector('[data-action="card"]').addEventListener('click', () => selectMethod('card'));
            body.querySelector('[data-action="cash"]').addEventListener('click', () => selectMethod('cash'));
            body.querySelector('[data-action="back"]').addEventListener('click', payStepBack);
            break;

        case 'cash_tender': {
            const amt = ps.currentAmount;
            const tenders = new Set();
            tenders.add(amt);
            const r5 = Math.ceil(amt / 5) * 5;
            const r10 = Math.ceil(amt / 10) * 10;
            const r20 = Math.ceil(amt / 20) * 20;
            if (r5 > amt) tenders.add(r5);
            if (r10 > amt) tenders.add(r10);
            if (r20 > amt) tenders.add(r20);
            [50, 100].forEach(v => { if (v >= amt) tenders.add(v); });
            const uniqueTenders = [...tenders].sort((a, b) => a - b).slice(0, 6);

            let tenderBtns = uniqueTenders.map((t, i) => {
                const label = t === amt ? 'EXACT' : '$' + t.toFixed(2);
                const cls = i === 0 ? 'green' : '';
                return `<button class="pay-btn ${cls}" data-tender="${t}">${label}</button>`;
            }).join('');

            body.innerHTML = `
                <div class="pay-amount-display">$${amt.toFixed(2)}</div>
                <div class="pay-amount-label">CASH TENDERED</div>
                <hr class="pay-divider">
                <div class="pay-grid">${tenderBtns}</div>
                <hr class="pay-divider">
                <button class="pay-btn small red" data-action="back">BACK</button>`;
            uniqueTenders.forEach(t => {
                body.querySelector(`[data-tender="${t}"]`).addEventListener('click', () => selectTender(t));
            });
            body.querySelector('[data-action="back"]').addEventListener('click', payStepBack);
            break;
        }

        case 'cash_change': {
            const change = ps.tenderAmount - ps.currentAmount;
            body.innerHTML = `
                <div class="pay-amount-display">$${ps.tenderAmount.toFixed(2)}</div>
                <div class="pay-amount-label">TENDERED</div>
                <hr class="pay-divider">
                <div class="pay-change-display">CHANGE: $${change.toFixed(2)}</div>
                <hr class="pay-divider">
                <button class="pay-btn wide yellow" data-action="confirm-cash">CONFIRM</button>`;
            body.querySelector('[data-action="confirm-cash"]').addEventListener('click', () => confirmCashPayment(change));
            break;
        }

        case 'card_processing':
            body.innerHTML = `
                <div class="pay-amount-display pay-processing">$${ps.currentAmount.toFixed(2)}</div>
                <div class="pay-amount-label">SENDING TO TERMINAL...</div>
                <div class="pay-info" style="margin-top:20px;">Waiting for card tap/insert</div>`;
            setTimeout(() => {
                ps.step = 'card_approved';
                ps.authCode = 'A' + String(Math.floor(Math.random() * 90000) + 10000);
                ps.lastFour = String(Math.floor(Math.random() * 9000) + 1000);
                renderPayStep();
            }, 2200);
            break;

        case 'card_approved':
            body.innerHTML = `
                <div class="pay-stamp">APPROVED</div>
                <hr class="pay-divider">
                <div class="pay-info">Card ····${ps.lastFour}</div>
                <div class="pay-info">Auth: ${ps.authCode}</div>
                <div class="pay-info">Amount: $${ps.currentAmount.toFixed(2)}</div>
                <hr class="pay-divider">
                <button class="pay-btn wide yellow" data-action="confirm-card">DONE</button>`;
            body.querySelector('[data-action="confirm-card"]').addEventListener('click', confirmCardPayment);
            break;

        case 'fully_paid':
            body.innerHTML = `
                <div class="pay-stamp">PAID</div>
                <div class="pay-amount-display" style="font-size:28px;">$${S.getCheckTotal().toFixed(2)}</div>
                <div class="pay-amount-label">${ps.payments.length} PAYMENT${ps.payments.length !== 1 ? 'S' : ''}</div>
                <hr class="pay-divider">
                ${ps.payments.map(p => `
                    <div class="pay-info">${p.method.toUpperCase()} — $${p.amount.toFixed(2)}${p.lastFour ? ' (····' + p.lastFour + ')' : ' (CASH)'}</div>
                `).join('')}
                <hr class="pay-divider">
                <button class="pay-btn wide yellow" data-action="close">CLOSE</button>`;
            body.querySelector('[data-action="close"]').addEventListener('click', closePayment);
            break;
    }
}

// ── Split Selection ──

function selectSplit(type) {
    const ps = S.payState;
    ps.splitType = type;
    if (type === 'full') {
        ps.currentAmount = S.getRemainingBalance();
        ps.payingItemIds = S.getUnpaidItems().map(i => i.id);
        ps.step = 'method_select';
    } else if (type === 'seat') {
        ps.step = 'seat_select';
    } else if (type === 'even') {
        ps.step = 'even_select';
    } else if (type === 'item') {
        ps.selectedItemIds = [];
        ps.step = 'item_select';
    }
    renderPayStep();
}

function selectPaySeat(seatNum) {
    const ps = S.payState;
    ps.selectedSeat = seatNum;
    const seatItems = S.checkItems.filter(i => i.seat == seatNum && !i.paid);
    ps.currentAmount = seatItems.reduce((sum, i) => sum + S.getItemTotal(i), 0);
    ps.payingItemIds = seatItems.map(i => i.id);
    ps.step = 'method_select';
    renderPayStep();
}

function selectEvenCount(n) {
    const ps = S.payState;
    ps.evenCount = n;
    ps.currentAmount = Math.ceil(S.getRemainingBalance() / n * 100) / 100;
    ps.payingItemIds = [];
    ps.step = 'method_select';
    renderPayStep();
}

function togglePayItem(itemId) {
    const item = S.checkItems.find(i => i.id === itemId);
    if (!item || item.paid) return;
    const idx = S.payState.selectedItemIds.indexOf(itemId);
    if (idx >= 0) S.payState.selectedItemIds.splice(idx, 1);
    else S.payState.selectedItemIds.push(itemId);
    renderPayStep();
}

function confirmItemSelection() {
    const ps = S.payState;
    const total = ps.selectedItemIds.reduce((sum, id) => {
        const item = S.checkItems.find(i => i.id === id);
        return sum + (item ? S.getItemTotal(item) : 0);
    }, 0);
    ps.currentAmount = total;
    ps.payingItemIds = [...ps.selectedItemIds];
    ps.step = 'method_select';
    renderPayStep();
}

// ── Method + Processing ──

function selectMethod(method) {
    S.payState.step = method === 'card' ? 'card_processing' : 'cash_tender';
    renderPayStep();
}

function selectTender(amount) {
    S.payState.tenderAmount = amount;
    if (amount === S.payState.currentAmount) {
        confirmCashPayment(0);
    } else {
        S.payState.step = 'cash_change';
        renderPayStep();
    }
}

function confirmCashPayment(change) {
    recordPayment('cash', S.payState.currentAmount, null, null, change);
}

function confirmCardPayment() {
    recordPayment('card', S.payState.currentAmount, S.payState.authCode, S.payState.lastFour, 0);
}

function recordPayment(method, amount, authCode, lastFour, change) {
    const ps = S.payState;
    ps.payments.push({ method, amount, authCode, lastFour, change });
    ps.totalPaid += amount;

    // Mark items as paid
    if (ps.payingItemIds && ps.payingItemIds.length > 0) {
        ps.payingItemIds.forEach(id => {
            const item = S.checkItems.find(i => i.id === id);
            if (item) item.paid = true;
        });
    } else if (ps.splitType === 'even') {
        let covered = 0;
        for (const item of S.checkItems) {
            if (item.paid) continue;
            const itemTotal = S.getItemTotal(item);
            if (covered + itemTotal <= amount + 0.01) {
                item.paid = true;
                covered += itemTotal;
            }
        }
    }

    if (onPaymentRecorded) onPaymentRecorded();
    updatePayFooter();

    if (S.getRemainingBalance() <= 0.005) {
        ps.step = 'fully_paid';
    } else {
        ps.step = 'split_select';
        ps.splitType = null;
        ps.selectedItemIds = [];
        ps.payingItemIds = [];
    }
    renderPayStep();
}

function payStepBack() {
    const ps = S.payState;
    if (ps.step === 'method_select') {
        if (ps.splitType === 'full') ps.step = 'split_select';
        else if (ps.splitType === 'seat') ps.step = 'seat_select';
        else if (ps.splitType === 'even') ps.step = 'even_select';
        else if (ps.splitType === 'item') ps.step = 'item_select';
    } else if (ps.step === 'cash_tender' || ps.step === 'card_processing') {
        ps.step = 'method_select';
    } else if (ps.step === 'cash_change') {
        ps.step = 'cash_tender';
    } else {
        ps.step = 'split_select';
    }
    renderPayStep();
}
