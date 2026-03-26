/**
 * KINDpos — Menu Management Component
 */

import snapshotStore from '../stores/snapshot-store.js';

export function initMenuManagement(container) {
    const render = () => {
        container.innerHTML = `
            <div class="menu-management" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; padding:15px; height:100%; overflow:hidden;">
                <!-- Left Column: Specials & 86 -->
                <div class="menu-status-col" style="display:flex; flex-direction:column; gap:15px; overflow-y:auto;">
                    <div class="specials-section">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h3 style="font-family:var(--font-heading); color:var(--kind-mint); font-size:14px;">TONIGHT'S SPECIALS</h3>
                            <button style="background:var(--kind-mint); border:none; color:var(--kind-bg-dark); font-family:var(--font-heading); font-size:10px; padding:4px 8px; border-radius:4px; cursor:pointer;">+ ADD</button>
                        </div>
                        <div class="specials-list" style="display:flex; flex-direction:column; gap:8px;">
                            ${renderSpecialCard('Limoncello Spritz', '$14', 'House-made limoncello')}
                            ${renderSpecialCard('Wagyu Sliders', '$18', 'Truffle aioli, caramelized onions')}
                        </div>
                    </div>

                    <div class="86-section">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h3 style="font-family:var(--font-heading); color:var(--kind-red); font-size:14px;">86 LIST</h3>
                            <button style="background:var(--kind-red); border:none; color:var(--kind-white); font-family:var(--font-heading); font-size:10px; padding:4px 8px; border-radius:4px; cursor:pointer;">+ 86</button>
                        </div>
                        <div class="86-list" style="display:flex; flex-direction:column; gap:8px;">
                            ${render86Card('Branzino', 'Sold out', 'Chef')}
                            ${render86Card('Tiramisu', 'Quality issue', 'Alex')}
                        </div>
                    </div>
                </div>

                <!-- Right Column: Quick Edit & Add -->
                <div class="menu-actions-col" style="display:flex; flex-direction:column; gap:15px; overflow-y:auto;">
                    <div class="quick-edit-section">
                        <h3 style="font-family:var(--font-heading); color:var(--kind-yellow); font-size:14px; margin-bottom:10px;">QUICK EDIT</h3>
                        <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:12px; border:1px solid var(--kind-button-border);">
                            <input type="text" placeholder="Search menu..." style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:var(--kind-white); padding:8px; border-radius:4px; font-family:var(--font-body); font-size:12px; margin-bottom:10px;">
                            <div style="color:rgba(240,240,240,0.3); font-family:var(--font-body); font-size:11px; text-align:center;">Type to search and edit items</div>
                        </div>
                    </div>

                    <div class="quick-add-section">
                        <h3 style="font-family:var(--font-heading); color:var(--kind-mint); font-size:14px; margin-bottom:10px;">QUICK ADD</h3>
                        <div style="background:rgba(0,0,0,0.2); border-radius:8px; padding:15px; border:1px solid var(--kind-button-border); display:flex; flex-direction:column; gap:10px;">
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <label style="font-family:var(--font-body); font-size:10px; color:rgba(240,240,240,0.4); text-transform:uppercase;">Name</label>
                                <input type="text" style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:var(--kind-white); padding:6px; border-radius:4px; font-family:var(--font-body); font-size:12px;">
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:10px;">
                                <div style="display:flex; flex-direction:column; gap:4px;">
                                    <label style="font-family:var(--font-body); font-size:10px; color:rgba(240,240,240,0.4); text-transform:uppercase;">Price</label>
                                    <input type="text" placeholder="0.00" style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:var(--kind-white); padding:6px; border-radius:4px; font-family:var(--font-body); font-size:12px;">
                                </div>
                                <div style="display:flex; flex-direction:column; gap:4px;">
                                    <label style="font-family:var(--font-body); font-size:10px; color:rgba(240,240,240,0.4); text-transform:uppercase;">Category</label>
                                    <select style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:var(--kind-white); padding:6px; border-radius:4px; font-family:var(--font-body); font-size:12px;">
                                        <option>Food</option>
                                        <option>Drinks</option>
                                        <option>Dessert</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" id="add-special">
                                <label for="add-special" style="font-family:var(--font-body); font-size:11px; color:var(--kind-white);">Add as Tonight's Special</label>
                            </div>
                            <button style="margin-top:5px; background:var(--kind-mint); border:none; color:var(--kind-bg-dark); font-family:var(--font-heading); font-size:12px; padding:10px; border-radius:6px; cursor:pointer;">CREATE ITEM</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const renderSpecialCard = (name, price, note) => `
        <div style="background:var(--kind-bg-dark); border:1px solid var(--kind-button-border); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-family:var(--font-body); font-weight:bold; color:var(--kind-white); font-size:13px;">${name} <span style="color:var(--kind-mint); font-weight:normal; margin-left:5px;">${price}</span></div>
                <div style="font-family:var(--font-body); color:rgba(240,240,240,0.4); font-size:11px; margin-top:2px;">${note}</div>
            </div>
            <button style="background:none; border:none; color:rgba(240,240,240,0.3); font-size:16px; cursor:pointer;">✕</button>
        </div>
    `;

    const render86Card = (name, reason, by) => `
        <div style="background:var(--kind-bg-dark); border:1px solid var(--kind-button-border); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-family:var(--font-body); font-weight:bold; color:var(--kind-white); font-size:13px;">${name}</div>
                <div style="font-family:var(--font-body); color:rgba(240,240,240,0.4); font-size:11px; margin-top:2px;">${reason} • 86'd by ${by}</div>
            </div>
            <button style="background:rgba(255,255,255,0.05); border:1px solid var(--kind-button-border); color:var(--kind-mint); font-family:var(--font-body); font-size:10px; padding:4px 8px; border-radius:4px; cursor:pointer;">UN-86</button>
        </div>
    `;

    render();
}
