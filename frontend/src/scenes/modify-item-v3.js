import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';
import { renderHexGrid } from '../components/hex.js';

export const ModifyItemScreen = {
    async onEnter(container, params) {
        this.tableId = params.tableId || 'C-001';
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
        container.appendChild(renderHeader(`${this.tableId} // MODIFY`, 'X'));

        // Left Panel (Running List)
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
            <div style="background: #C6FFBB; color: #333333; padding: 4px 10px; font-family: 'Alien Encounters Solid Bold';">MODIFICATION</div>
            <div style="padding: 10px; flex: 1; overflow: auto; font-family: 'Sevastopol Interface'; color: #C6FFBB;">
                <div>Selected Item</div>
                <div id="mod-list"></div>
            </div>
        `;
        container.appendChild(leftPanel);

        // Option Group Strip
        const strip = document.createElement('div');
        strip.style.cssText = `
            position: absolute;
            left: 437px;
            top: 50px;
            width: 567px;
            height: 86px;
            display: flex;
            gap: 10px;
            align-items: center;
            background: #333333;
            padding: 0 10px;
            box-sizing: border-box;
            border: 1px solid #C6FFBB;
            border-radius: 12px;
        `;
        ['ADD', 'NO', 'On Side', 'LITE'].forEach(opt => {
            const btn = document.createElement('div');
            btn.textContent = opt;
            btn.style.cssText = `padding: 10px 20px; border: 1px solid #C6FFBB; color: #C6FFBB; font-family: 'Sevastopol Interface'; cursor: pointer; border-radius: 8px;`;
            btn.onclick = () => {
                this.activeOption = opt;
                Array.from(strip.children).forEach(c => c.style.background = 'transparent');
                btn.style.background = '#C6FFBB33';
            };
            strip.appendChild(btn);
        });
        container.appendChild(strip);

        // Hex Nav Area (Modifiers)
        const rightPanel = document.createElement('div');
        rightPanel.style.cssText = `
            position: absolute;
            left: 437px;
            top: 146px;
            width: 567px;
            height: 306px;
        `;
        
        const modifiers = [
            { text: 'Onion', onClick: () => this.applyMod('Onion') },
            { text: 'Tomato', onClick: () => this.applyMod('Tomato') },
            { text: 'Cheese', onClick: () => this.applyMod('Cheese') },
            { text: 'Bacon', onClick: () => this.applyMod('Bacon') },
            { text: 'Pickle', onClick: () => this.applyMod('Pickle') },
            { text: 'Mayo', onClick: () => this.applyMod('Mayo') }
        ];
        rightPanel.appendChild(renderHexGrid(modifiers, 90, 5));
        container.appendChild(rightPanel);

        // Bottom Action Buttons
        const bottomActions = document.createElement('div');
        bottomActions.style.cssText = `
            position: absolute;
            left: 655px;
            bottom: 40px;
            display: flex;
            gap: 20px;
        `;
        const cancelBtn = document.createElement('div');
        cancelBtn.textContent = 'CANCEL';
        cancelBtn.style.cssText = `width: 162px; height: 77px; background: #E84040; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Alien Encounters Solid Bold'; border-radius: 12px;`;
        cancelBtn.onclick = () => window.app.sceneManager.navigateTo('add-item', { tableId: this.tableId });
        
        const confirmBtn = document.createElement('div');
        confirmBtn.textContent = 'CONFIRM';
        confirmBtn.style.cssText = `width: 162px; height: 77px; background: #C6FFBB; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Alien Encounters Solid Bold'; border-radius: 12px;`;
        confirmBtn.onclick = () => window.app.sceneManager.navigateTo('add-item', { tableId: this.tableId });

        bottomActions.appendChild(cancelBtn);
        bottomActions.appendChild(confirmBtn);
        container.appendChild(bottomActions);

        // Footer
        container.appendChild(renderFooter());
    },

    applyMod(name) {
        const list = document.getElementById('mod-list');
        if (list) {
            const prefix = this.activeOption || 'MOD';
            const item = document.createElement('div');
            item.textContent = `${prefix} ${name}`;
            item.style.padding = '5px';
            item.style.color = '#FBDE42';
            list.appendChild(item);
        }
    }
};

export const registerModifyItem = (sm) => {
    sm.register('modify-item', ModifyItemScreen);
};
