/**
 * KINDpos — Closing Pipeline Component
 */

import snapshotStore from '../stores/snapshot-store.js';

export function initClosingPipeline(container) {
    const render = () => {
        const servers = [
            { name: 'Maria', openTables: 0, status: 'ready', checkedOut: false },
            { name: 'Alex', openTables: 2, status: 'busy', checkedOut: false },
            { name: 'Jordan', openTables: 0, status: 'ready', checkedOut: false, isCut: true },
            { name: 'Taylor', openTables: 0, status: 'complete', checkedOut: true }
        ];

        container.innerHTML = `
            <div class="closing-pipeline" style="display:flex; flex-direction:column; gap:15px; padding:15px; height:100%; overflow-y:auto;">
                <div class="readiness-section">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="font-family:var(--font-heading); color:var(--kind-white); font-size:14px;">SERVER READINESS</h3>
                        <span style="font-family:var(--font-body); color:rgba(240,240,240,0.4); font-size:11px;">2 of 4 checked out</span>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">
                        ${servers.map(s => renderServerTile(s)).join('')}
                    </div>
                </div>

                <div class="batch-section" style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:15px;">
                    <h3 style="font-family:var(--font-heading); color:rgba(240,240,240,0.3); font-size:14px; margin-bottom:12px;">BATCH SETTLEMENT</h3>
                    <div style="background:rgba(0,0,0,0.2); border:1px solid var(--kind-button-border); border-radius:12px; padding:20px; text-align:center;">
                        <div style="font-family:var(--font-body); color:rgba(240,240,240,0.4); font-size:12px; margin-bottom:15px;">Wait for all servers to complete checkout</div>
                        <button disabled style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:rgba(240,240,240,0.2); font-family:var(--font-heading); font-size:14px; letter-spacing:2px; padding:15px 30px; border-radius:8px; cursor:default;">SETTLE BATCH</button>
                    </div>
                </div>
            </div>
        `;
    };

    const renderServerTile = (s) => {
        let statusText = `${s.openTables} tables`;
        let statusColor = 'rgba(240,240,240,0.4)';
        let borderColor = 'var(--kind-button-border)';

        if (s.checkedOut) {
            statusText = 'COMPLETE';
            statusColor = 'var(--kind-mint)';
            borderColor = 'var(--kind-mint)';
        } else if (s.openTables === 0) {
            statusText = 'READY';
            statusColor = 'var(--kind-mint)';
        }

        if (s.isCut) borderColor = '#ff931e';

        return `
            <div class="server-ready-tile" style="background:var(--kind-bg-dark); border:1px solid ${borderColor}; border-radius:10px; padding:12px; text-align:center; cursor:pointer;">
                <div style="font-family:var(--font-body); font-weight:bold; color:var(--kind-white); font-size:13px; margin-bottom:4px;">${s.name}</div>
                <div style="font-family:var(--font-body); color:${statusColor}; font-size:11px; font-weight:bold;">${statusText}</div>
                ${s.openTables > 0 ? `
                    <div style="display:flex; justify-content:center; gap:4px; margin-top:6px;">
                        <div style="width:6px; height:6px; border-radius:50%; background:var(--kind-red);"></div>
                        <div style="width:6px; height:6px; border-radius:50%; background:var(--kind-yellow);"></div>
                    </div>
                ` : ''}
            </div>
        `;
    };

    render();
}
