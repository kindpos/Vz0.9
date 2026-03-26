import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';
import { Card } from '../components/card.js';
import { CardColumn } from '../components/card-column.js';
import { renderEditBar } from '../components/edit-bar.js';

export const SnapshotScreen = {
    selectedTables: new Set(),
    
    async onEnter(container) {
        this.selectedTables = new Set();
        this.render(container);
    },

    render(container) {
        container.innerHTML = '';
        container.style.cssText = `
            width: 1024px;
            height: 600px;
            background: #333333;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        // Header
        const user = window.app.state.user || { name: 'Alex' };
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const dateStr = now.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' });
        const title = `${dateStr} // ${timeStr} // Good Evening, ${user.name}!`;
        container.appendChild(renderHeader(title, 'X'));

        // Grid Container
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: 278px 408px 278px;
            grid-template-rows: 1fr;
            gap: 15px;
            padding: 45px 15px 45px 15px; /* Offset for header/footer */
            height: 540px;
            box-sizing: border-box;
        `;

        // Left Column
        const shiftCard = new Card('shift', {
            title: 'SHIFT OVERVIEW',
            renderDefault: () => {
                const div = document.createElement('div');
                div.innerHTML = '<div>Personal Stats</div><div>Specials</div><div>86 List</div>';
                return div;
            }
        });
        const messengerCard = new Card('messenger', {
            title: 'MESSENGER',
            renderDefault: () => {
                const div = document.createElement('div');
                div.innerHTML = '<div>No new messages</div>';
                return div;
            }
        });
        const leftCol = new CardColumn(shiftCard, messengerCard);
        grid.appendChild(leftCol.el);

        // Center Column
        const centerCol = document.createElement('div');
        centerCol.style.cssText = `
            border: 2px solid #C6FFBB;
            display: flex;
            flex-direction: column;
            background: #333333;
            position: relative;
        `;
        
        const centerHeader = document.createElement('div');
        centerHeader.style.cssText = `
            background: #C6FFBB;
            color: #333333;
            font-family: 'Alien Encounters Solid Bold', sans-serif;
            padding: 4px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 27px;
        `;
        centerHeader.innerHTML = '<span>CHECK OVERVIEW</span><span></></span>';
        centerCol.appendChild(centerHeader);
        
        const tableGrid = document.createElement('div');
        tableGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 78px);
            grid-template-rows: repeat(3, 77px);
            gap: 11px 36px;
            padding: 20px;
            justify-content: center;
        `;
        
        for (let i = 1; i <= 9; i++) {
            const table = document.createElement('div');
            const tableId = `T${i}`;
            table.textContent = tableId;
            table.style.cssText = `
                border: 2px solid #C6FFBB;
                background: #333333;
                color: #C6FFBB;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-family: 'Sevastopol Interface', sans-serif;
                font-size: var(--font-size-card-header);
                border-radius: 8px;
            `;
            
            table.onclick = () => this.toggleTable(table, tableId);
            table.oncontextmenu = (e) => {
                e.preventDefault();
                window.app.sceneManager.navigateTo('check-overview', { tableId });
            };
            
            tableGrid.appendChild(table);
        }
        centerCol.appendChild(tableGrid);
        
        this.editBarContainer = document.createElement('div');
        centerCol.appendChild(this.editBarContainer);
        
        grid.appendChild(centerCol);

        // Right Column
        const reportingCard = new Card('reporting', {
            title: 'REPORTING',
            renderDefault: () => {
                const div = document.createElement('div');
                div.innerHTML = '<div>Sales Report</div><div>Settle Batch (0/0)</div>';
                const btn = document.createElement('button');
                btn.textContent = user.role === 'manager' ? 'Close Day' : 'Checkout';
                btn.style.cssText = 'background: #333333; color: #C6FFBB; border: 1px solid #C6FFBB; margin-top: 10px; width: 100%; cursor: pointer;';
                btn.onclick = () => {
                    if (user.role === 'manager') window.app.sceneManager.navigateTo('close-day');
                };
                div.appendChild(btn);
                return div;
            }
        });
        const hardwareCard = new Card('hardware', {
            title: 'HARDWARE',
            renderDefault: () => {
                const div = document.createElement('div');
                div.innerHTML = '<div>Printers: OK</div><div>Terminal: Online</div>';
                return div;
            }
        });
        const rightCol = new CardColumn(reportingCard, hardwareCard);
        grid.appendChild(rightCol.el);

        container.appendChild(grid);

        // Footer
        container.appendChild(renderFooter());
    },

    toggleTable(el, id) {
        if (this.selectedTables.has(id)) {
            this.selectedTables.delete(id);
            el.style.background = '#333333';
            el.style.color = '#C6FFBB';
        } else {
            this.selectedTables.add(id);
            el.style.background = '#C6FFBB';
            el.style.color = '#333333';
        }
        this.updateEditBar();
    },

    updateEditBar() {
        this.editBarContainer.innerHTML = '';
        if (this.selectedTables.size > 0) {
            const tableIds = Array.from(this.selectedTables);
            const customActions = [];
            
            // Add "OPEN" action if exactly one table is selected
            if (this.selectedTables.size === 1) {
                customActions.push({
                    label: 'OPEN',
                    onClick: () => {
                        window.app.sceneManager.navigateTo('check-overview', { tableId: tableIds[0] });
                    }
                });
            } else {
                customActions.push({
                    label: 'MERGE',
                    onClick: () => {
                        console.log('MERGE', tableIds);
                    }
                });
            }

            const bar = renderEditBar(this.selectedTables.size, () => {
                console.log('Expand actions for tables:', tableIds);
            }, customActions);
            this.editBarContainer.appendChild(bar);
        }
    }
};

export const registerSnapshot = (sm) => {
    sm.register('snapshot', SnapshotScreen);
};
