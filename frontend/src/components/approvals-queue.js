/**
 * KINDpos — Approvals Queue Component
 */

import snapshotStore from '../stores/snapshot-store.js';

export function initApprovalsQueue(container) {
    const render = () => {
        const pending = [
            { id: 1, type: 'Discount', category: 'Server-Initiated', priority: 'red', from: 'Alex', context: 'T7: Pasta Primavera', impact: '$22.00 → $17.60', reason: 'Customer complaint', time: '2m ago' },
            { id: 2, type: 'Void', category: 'Server-Initiated', priority: 'red', from: 'Maria', context: 'T12: Wrong order', impact: '$18.50 → $0.00', reason: 'Entry error', time: '5m ago', contextInfo: '1st void tonight' },
            { id: 3, type: 'OT Warning', category: 'System Labor', priority: 'yellow', from: 'System', context: 'Maria: Near 6h limit', impact: 'Projected OT: 0.5h', reason: 'Shift length', time: '10m ago' },
            { id: 4, type: 'Printer Down', category: 'Hardware Health', priority: 'blue', from: 'Terminal 2', context: 'Receipt Printer', impact: 'Offline', reason: 'Connection timeout', time: '15m ago' },
        ];

        container.innerHTML = `
            <div class="approvals-queue" style="display:flex; flex-direction:column; gap:15px; padding:15px; height:100%; overflow-y:auto;">
                <div class="pending-section">
                    <h3 style="font-family:var(--font-heading); color:var(--kind-white); font-size:14px; margin-bottom:12px;">PENDING REQUESTS</h3>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${pending.map(p => renderApprovalCard(p)).join('')}
                    </div>
                </div>

                <div class="history-section" style="margin-top:10px;">
                    <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:15px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="font-family:var(--font-heading); color:rgba(240,240,240,0.3); font-size:12px;">TONIGHT'S HISTORY</h3>
                        <span style="color:rgba(240,240,240,0.3); font-size:10px;">▼</span>
                    </div>
                </div>
            </div>
        `;
    };

    const renderApprovalCard = (p) => {
        const dotColors = { red: '#FF3333', yellow: '#FBDE42', blue: '#3fa9f5' };
        
        return `
            <div class="approval-card" style="background:var(--kind-bg-dark); border:1px solid var(--kind-button-border); border-radius:12px; overflow:hidden;">
                <div style="padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:8px; height:8px; border-radius:50%; background:${dotColors[p.priority]};"></div>
                            <span style="font-family:var(--font-heading); color:rgba(240,240,240,0.6); font-size:10px; letter-spacing:1px;">${p.category.toUpperCase()}</span>
                        </div>
                        <span style="font-family:var(--font-body); color:rgba(240,240,240,0.3); font-size:10px;">${p.time}</span>
                    </div>
                    
                    <div style="font-family:var(--font-body); margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:baseline;">
                            <span style="font-weight:bold; color:var(--kind-white); font-size:14px;">${p.type} — ${p.from}</span>
                            ${p.contextInfo ? `<span style="font-size:10px; color:var(--kind-yellow);">${p.contextInfo}</span>` : ''}
                        </div>
                        <div style="color:rgba(240,240,240,0.6); font-size:12px; margin-top:2px;">${p.context}</div>
                        <div style="color:var(--kind-mint); font-size:12px; margin-top:4px; font-weight:bold;">${p.impact}</div>
                        <div style="color:rgba(240,240,240,0.4); font-size:11px; margin-top:2px; font-style:italic;">Reason: ${p.reason}</div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:rgba(240,240,240,0.4); font-family:var(--font-heading); font-size:12px; padding:10px; border-radius:6px; cursor:pointer;">DENY</button>
                        <button style="background:var(--kind-mint); border:none; color:var(--kind-bg-dark); font-family:var(--font-heading); font-size:12px; padding:10px; border-radius:6px; cursor:pointer;">APPROVE</button>
                    </div>
                </div>
            </div>
        `;
    };

    render();
}
