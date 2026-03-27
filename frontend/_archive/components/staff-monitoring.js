/**
 * KINDpos — Staff Monitoring Component
 */

import snapshotStore from '../stores/snapshot-store.js';

export function initStaffMonitoring(container) {
    const render = () => {
        const servers = [
            { name: 'Alex', role: 'Server', clockIn: Date.now() - 4.2 * 3600000, sales: 1847, checks: 12, tips: 312, tables: 4, scheduledHours: 6 },
            { name: 'Jamie', role: 'Host', clockIn: Date.now() - 1.5 * 3600000, hoursThisWeek: 32, breakStatus: 'None', scheduledHours: 4 },
            { name: 'Maria', role: 'Server', clockIn: Date.now() - 5.5 * 3600000, sales: 2140, checks: 15, tips: 420, tables: 3, scheduledHours: 6 },
            { name: 'Jordan', role: 'Bartender', clockIn: Date.now() - 3.8 * 3600000, sales: 950, checks: 24, tips: 185, tables: 0, scheduledHours: 8 },
            { name: 'Casey', role: 'Busser', clockIn: Date.now() - 2.0 * 3600000, hoursThisWeek: 18, breakStatus: 'On Break', scheduledHours: 5 },
            { name: 'Taylor', role: 'Server', clockIn: Date.now() - 0.5 * 3600000, sales: 120, checks: 2, tips: 22, tables: 5, scheduledHours: 6, isCut: true },
        ];

        // Sort: OT/issues first, then longest shift, then sales desc
        servers.sort((a, b) => {
            const aHours = (Date.now() - a.clockIn) / 3600000;
            const bHours = (Date.now() - b.clockIn) / 3600000;
            const aOT = aHours > a.scheduledHours;
            const bOT = bHours > b.scheduledHours;
            if (aOT && !bOT) return -1;
            if (!aOT && bOT) return 1;
            if (a.isCut && !b.isCut) return 1; // Cut servers lower? or higher? usually issues first.
            return bHours - aHours;
        });

        container.innerHTML = `
            <div class="staff-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; padding: 15px; overflow-y: auto; height: 100%;">
                ${servers.map(s => renderServerCard(s)).join('')}
            </div>
        `;
    };

    const renderServerCard = (s) => {
        const hoursOnClock = (Date.now() - s.clockIn) / 3600000;
        const h = Math.floor(hoursOnClock);
        const m = Math.floor((hoursOnClock % 1) * 60);
        
        const progress = Math.min(100, (hoursOnClock / s.scheduledHours) * 100);
        let progressColor = 'var(--kind-mint)';
        if (progress > 100) progressColor = 'var(--kind-red)';
        else if (progress > 75) progressColor = 'var(--kind-yellow)';

        const isOT = hoursOnClock > s.scheduledHours;
        const statusStripColor = isOT ? 'var(--kind-red)' : (progress > 90 ? 'var(--kind-yellow)' : 'transparent');

        return `
            <div class="server-card" style="background: var(--kind-bg-dark); border: 1px solid var(--kind-button-border); border-radius: 12px; overflow: hidden; position: relative; ${s.isCut ? 'border-color: #ff931e; box-shadow: 0 0 10px rgba(255, 147, 30, 0.2);' : ''}">
                <div class="status-strip" style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${statusStripColor};"></div>
                <div style="padding: 12px 12px 12px 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-family: var(--font-body); font-weight: bold; color: var(--kind-white); font-size: 14px;">${s.name}</span>
                        <span style="font-family: var(--font-body); color: rgba(240, 240, 240, 0.6); font-size: 12px;">${h}h ${m}m</span>
                    </div>
                    
                    <div class="progress-container" style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; margin-bottom: 12px; overflow: hidden;">
                        <div class="progress-bar" style="height: 100%; width: ${progress}%; background: ${progressColor};"></div>
                    </div>

                    ${s.role === 'Server' || s.role === 'Bartender' ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Sales</span>
                                <span style="font-family: var(--font-body); color: var(--kind-mint); font-size: 14px;">$${s.sales.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Checks</span>
                                <span style="font-family: var(--font-body); color: var(--kind-white); font-size: 14px;">${s.checks}</span>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Avg Check</span>
                                <span style="font-family: var(--font-body); color: var(--kind-white); font-size: 14px;">$${(s.sales / s.checks).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Tips</span>
                                <span style="font-family: var(--font-body); color: var(--kind-yellow); font-size: 14px;">$${s.tips}</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Tables</span>
                            <div style="display: flex; gap: 4px;">
                                ${Array(s.tables).fill(0).map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? 'var(--kind-red)' : 'var(--kind-mint)'};"></div>`).join('')}
                            </div>
                        </div>
                    ` : `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Weekly Hrs</span>
                                <span style="font-family: var(--font-body); color: var(--kind-white); font-size: 14px;">${s.hoursThisWeek}h</span>
                            </div>
                            <div style="display: flex; flex-direction: column;">
                                <span style="font-family: var(--font-body); font-size: 10px; color: rgba(240, 240, 240, 0.4); text-transform: uppercase;">Break</span>
                                <span style="font-family: var(--font-body); color: ${s.breakStatus === 'On Break' ? 'var(--kind-yellow)' : 'var(--kind-white)'}; font-size: 14px;">${s.breakStatus}</span>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    };

    render();
}
