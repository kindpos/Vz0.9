/**
 * KINDpos — House View Charts Component
 */

export function initSalesPulse(container) {
    container.innerHTML = `
        <div class="card-header">
            <span class="card-title">SALES PULSE</span>
            <div class="chart-toggles" style="display:flex; gap:10px;">
                <button class="chart-toggle-btn active" data-period="last-week" style="background:none; border:none; color:var(--kind-mint); font-family:var(--font-body); font-size:10px; cursor:pointer; border-bottom:1px solid var(--kind-mint);">LAST WEEK</button>
                <button class="chart-toggle-btn" data-period="yesterday" style="background:none; border:none; color:rgba(240,240,240,0.4); font-family:var(--font-body); font-size:10px; cursor:pointer;">YESTERDAY</button>
            </div>
        </div>
        <div class="card-content-wrapper" style="padding:15px; flex:1; display:flex; flex-direction:column;">
            <div class="chart-container" style="flex:1; position:relative; border-left:1px solid rgba(255,255,255,0.1); border-bottom:1px solid rgba(255,255,255,0.1);">
                <svg width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible;">
                    <!-- Ghost line (Comparison) -->
                    <path d="M0,80 Q50,70 100,75 T200,60 T300,40 T400,50" fill="none" stroke="rgba(240,240,240,0.15)" stroke-width="2" vector-effect="non-scaling-stroke" />
                    <!-- Today line -->
                    <path d="M0,90 Q50,85 100,80 T200,50 T300,30 T400,20" fill="none" stroke="var(--kind-mint)" stroke-width="3" vector-effect="non-scaling-stroke" />
                    <circle cx="100%" cy="20" r="4" fill="var(--kind-mint)" class="pulse-point" />
                </svg>
            </div>
            <div class="chart-labels" style="display:flex; justify-content:space-between; margin-top:5px; font-family:var(--font-body); font-size:10px; color:rgba(240,240,240,0.3);">
                <span>4 PM</span><span>6 PM</span><span>8 PM</span><span>10 PM</span><span>12 AM</span>
            </div>
        </div>
    `;
}

export function initLaborGauge(container) {
    const pct = 28;
    const angle = (pct / 50) * 180 - 180; // 0-50% range, -180 to 0 degrees

    container.innerHTML = `
        <div class="card-header"><span class="card-title">LABOR GAUGE</span></div>
        <div class="card-content-wrapper" style="padding:15px; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="position:relative; width:160px; height:100px;">
                <svg viewBox="0 0 100 60" style="width:100%; height:100%;">
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8" stroke-linecap="round" />
                    <path d="M10,50 A40,40 0 0,1 35,15" fill="none" stroke="#7ac943" stroke-width="8" />
                    <path d="M35,15 A40,40 0 0,1 65,15" fill="none" stroke="#FBDE42" stroke-width="8" />
                    <path d="M65,15 A40,40 0 0,1 90,50" fill="none" stroke="#FF3333" stroke-width="8" />
                    <line x1="50" y1="50" x2="50" y2="15" stroke="var(--kind-white)" stroke-width="2" transform="rotate(${angle}, 50, 50)" />
                    <circle cx="50" cy="50" r="3" fill="var(--kind-white)" />
                </svg>
                <div style="position:absolute; bottom:0; left:0; right:0; text-align:center;">
                    <div style="font-family:var(--font-heading); font-size:24px; color:var(--kind-white);">${pct}%</div>
                </div>
            </div>
            <div style="display:flex; justify-content:space-around; width:100%; margin-top:10px;">
                <div style="text-align:center;">
                    <div style="font-family:var(--font-heading); font-size:10px; color:rgba(240,240,240,0.4);">ON CLOCK</div>
                    <div style="font-family:var(--font-body); font-size:14px; color:var(--kind-white);">6</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-family:var(--font-heading); font-size:10px; color:rgba(240,240,240,0.4);">LABOR $</div>
                    <div style="font-family:var(--font-body); font-size:14px; color:var(--kind-white);">$842</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-family:var(--font-heading); font-size:10px; color:rgba(240,240,240,0.4);">$/LH</div>
                    <div style="font-family:var(--font-body); font-size:14px; color:var(--kind-white);">$142</div>
                </div>
            </div>
        </div>
    `;
}

export function initServerBalance(container) {
    const servers = [
        { name: 'Maria', sales: 2140 },
        { name: 'Alex', sales: 1847 },
        { name: 'Jordan', sales: 950 },
        { name: 'Taylor', sales: 120 }
    ];
    const maxSales = Math.max(...servers.map(s => s.sales));

    container.innerHTML = `
        <div class="card-header"><span class="card-title">SERVER BALANCE</span></div>
        <div class="card-content-wrapper" style="padding:15px; flex:1; overflow-y:auto;">
            <div style="display:flex; flex-direction:column; gap:12px;">
                ${servers.map(s => `
                    <div class="server-bar-row" style="display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; justify-content:space-between; font-family:var(--font-body); font-size:12px; color:var(--kind-white);">
                            <span>${s.name}</span>
                            <span>$${s.sales.toLocaleString()}</span>
                        </div>
                        <div style="height:14px; background:rgba(255,255,255,0.05); border-radius:7px; overflow:hidden;">
                            <div style="height:100%; width:${(s.sales / maxSales) * 100}%; background:var(--kind-mint); opacity:0.8;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export function initFloorHeat(container) {
    const tables = [
        { n: 'T1', status: 'red' }, { n: 'T2', status: 'mint' }, { n: 'T3', status: 'empty' },
        { n: 'T4', status: 'orange' }, { n: 'T5', status: 'empty' }, { n: 'T6', status: 'mint' },
        { n: 'T7', status: 'red' }, { n: 'T8', status: 'empty' }, { n: 'T10', status: 'orange' },
        { n: 'T11', status: 'mint' }, { n: 'T12', status: 'orange' }, { n: 'T15', status: 'red' }
    ];

    const getColor = (s) => {
        if (s === 'mint') return 'var(--kind-mint)';
        if (s === 'orange') return '#ff931e';
        if (s === 'red') return 'var(--kind-red)';
        return 'rgba(255,255,255,0.05)';
    };

    container.innerHTML = `
        <div class="card-header"><span class="card-title">FLOOR HEAT</span></div>
        <div class="card-content-wrapper" style="padding:15px; flex:1; display:flex; align-items:center; justify-content:center;">
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
                ${tables.map(t => `
                    <div style="width:45px; height:45px; border-radius:8px; background:${getColor(t.status)}; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">
                        <span style="font-family:var(--font-body); font-size:12px; color:${t.status === 'empty' ? 'rgba(240,240,240,0.2)' : 'var(--kind-bg-dark)'}; font-weight:bold;">${t.n}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
