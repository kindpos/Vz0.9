import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';
import { renderHexGrid } from '../components/hex.js';

export const AddItemScreen = {
    async onEnter(container, params) {
        this.tableId = params.tableId || 'C-001';
        this.seatId = params.seatId || 1;
        this.category = null;
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
        `;

        // Header
        container.appendChild(renderHeader(`${this.tableId} // Add Item(s)`, 'X'));

        // Left Panel (Item List)
        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = `
            position: absolute;
            left: 28px;
            top: 49px;
            width: 378px;
            height: 512px;
            border: 2px solid #C6FFBB;
            background: #333333;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            border-radius: 12px;
            overflow: hidden;
        `;
        leftPanel.innerHTML = `
            <div style="background: #C6FFBB; color: #333333; padding: 4px 10px; font-family: 'Alien Encounters Solid Bold'; font-size: var(--font-size-card-header);">ITEM LIST</div>
            <div style="padding: 10px; flex: 1; overflow: auto; font-family: 'Sevastopol Interface'; color: #C6FFBB; font-size: var(--font-size-body);">
                <div style="border-bottom: 1px solid #C6FFBB; margin-bottom: 5px;">Seat: ${this.seatId}</div>
                <div id="running-list"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 2px; background: #C6FFBB;">
                <button style="background: #333333; color: #C6FFBB; border: none; padding: 10px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); cursor: pointer;">Repeat</button>
                <button style="background: #333333; color: #C6FFBB; border: none; padding: 10px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); cursor: pointer;">New</button>
                <button style="background: #333333; color: #C6FFBB; border: none; padding: 10px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); cursor: pointer;">Notes</button>
                <button style="background: #333333; color: #C6FFBB; border: none; padding: 10px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); cursor: pointer;">Remove</button>
            </div>
        `;
        container.appendChild(leftPanel);

        // Right Panel (Hex Nav Bloom)
        const rightPanel = document.createElement('div');
        rightPanel.id = 'hex-nav-container';
        rightPanel.style.cssText = `
            position: absolute;
            left: 437px;
            top: 44px;
            width: 567px;
            height: 378px;
        `;
        container.appendChild(rightPanel);
        this.renderHexNav(rightPanel);

        // Bottom Action Buttons
        const bottomActions = document.createElement('div');
        bottomActions.style.cssText = `
            position: absolute;
            left: 462px;
            bottom: 40px;
            display: flex;
            gap: 20px;
        `;
        
        const modifyBtn = document.createElement('div');
        modifyBtn.textContent = 'MODIFY';
        modifyBtn.style.cssText = `width: 170px; height: 87px; background: #333333; color: #C6FFBB; border: 1px solid #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); border-radius: 12px;`;
        modifyBtn.onclick = () => window.app.sceneManager.navigateTo('modify-item', { tableId: this.tableId });
        
        const cancelBtn = document.createElement('div');
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.style.cssText = `width: 162px; height: 77px; background: #E84040; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-top: 5px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); border-radius: 12px;`;
        cancelBtn.onclick = () => window.app.sceneManager.navigateTo('check-overview', { tableId: this.tableId });
        
        const confirmBtn = document.createElement('div');
        confirmBtn.textContent = 'CONFIRM';
        confirmBtn.style.cssText = `width: 162px; height: 77px; background: #C6FFBB; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-top: 5px; font-family: 'Sevastopol Interface'; font-size: var(--font-size-button); border-radius: 12px;`;
        confirmBtn.onclick = () => window.app.sceneManager.navigateTo('check-overview', { tableId: this.tableId });

        bottomActions.appendChild(modifyBtn);
        bottomActions.appendChild(cancelBtn);
        bottomActions.appendChild(confirmBtn);
        container.appendChild(bottomActions);

        // Footer
        container.appendChild(renderFooter());
    },

    renderHexNav(container) {
        container.innerHTML = '';
        if (!this.category) {
            // Render Categories
            const categories = [
                { text: 'Wine', color: '#0000FF', onClick: () => this.selectCategory('Wine') },
                { text: 'Apps', color: '#FFA500', onClick: () => this.selectCategory('Apps') },
                { text: 'Entrees', color: '#FFFF00', onClick: () => this.selectCategory('Entrees') },
                { text: 'Dessert', color: '#FF00FF', onClick: () => this.selectCategory('Dessert') },
                { text: 'Drinks', color: '#00FFFF', onClick: () => this.selectCategory('Drinks') },
                { text: 'Specials', color: '#00FF00', onClick: () => this.selectCategory('Specials') }
            ];
            container.appendChild(renderHexGrid(categories, 110, 4));
        } else {
            // Render Items for selected category
            const items = [
                { text: 'BACK', color: '#C6FFBB', onClick: () => this.selectCategory(null) },
                { text: 'Item 1', color: '#C6FFBB', onClick: () => this.addItem('Item 1') },
                { text: 'Item 2', color: '#C6FFBB', onClick: () => this.addItem('Item 2') },
                { text: 'Item 3', color: '#C6FFBB', onClick: () => this.addItem('Item 3') },
                { text: 'Item 4', color: '#C6FFBB', onClick: () => this.addItem('Item 4') },
                { text: 'Item 5', color: '#C6FFBB', onClick: () => this.addItem('Item 5') }
            ];
            container.appendChild(renderHexGrid(items, 110, 4));
        }
    },

    selectCategory(cat) {
        this.category = cat;
        const container = document.getElementById('hex-nav-container');
        if (container) this.renderHexNav(container);
    },

    addItem(name) {
        const list = document.getElementById('running-list');
        if (list) {
            const item = document.createElement('div');
            item.textContent = name;
            item.style.padding = '5px';
            item.style.borderBottom = '1px solid #444';
            list.appendChild(item);
        }
    }
};

export const registerAddItem = (sm) => {
    sm.register('add-item', AddItemScreen);
};
