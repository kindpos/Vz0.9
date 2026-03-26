import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';

export const CheckOverviewScreen = {
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
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const dateStr = now.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' });
        container.appendChild(renderHeader(`${dateStr} // ${timeStr} // ${this.tableId}`, 'X'));

        // Left Panel (Item Summary)
        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = `
            position: absolute;
            left: 20px;
            top: 52px;
            width: 378px;
            height: 513px;
            border: 2px solid #C6FFBB;
            background: #333333;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        `;
        leftPanel.innerHTML = `
            <div style="background: #C6FFBB; color: #333333; padding: 4px 10px; font-family: 'Alien Encounters Solid Bold'; font-size: var(--font-size-card-header);">ITEM SUMMARY</div>
            <div style="padding: 10px; flex: 1; overflow: auto; font-family: 'Sevastopol Interface'; color: #C6FFBB; font-size: var(--font-size-body);">
                <div style="border-bottom: 1px solid #C6FFBB; margin-bottom: 5px;">Seat: 01</div>
                <div>(No items)</div>
            </div>
            <div style="padding: 10px; border-top: 1px solid #C6FFBB; font-family: 'Sevastopol Interface'; color: #FBDE42; font-size: var(--font-size-body);">
                <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>$0.00</span></div>
                <div style="display: flex; justify-content: space-between;"><span>Tax</span><span>$0.00</span></div>
                <div style="display: flex; justify-content: space-between; font-size: var(--font-size-total); margin-top: 5px;"><span>TOTAL</span><span>$0.00</span></div>
            </div>
        `;
        container.appendChild(leftPanel);

        // Right Panel (Seat Grid + Actions)
        const rightPanel = document.createElement('div');
        rightPanel.style.cssText = `
            position: absolute;
            left: 449px;
            top: 49px;
            width: 554px;
            height: 540px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        `;

        // Seat Cards Grid
        const seatGrid = document.createElement('div');
        seatGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            height: 280px;
        `;
        for (let i = 1; i <= 2; i++) {
            const seat = document.createElement('div');
            seat.style.cssText = `
                border: 2px solid #C6FFBB;
                background: #333333;
                color: #C6FFBB;
                display: flex;
                flex-direction: column;
                cursor: pointer;
            `;
            seat.innerHTML = `
                <div style="background: #C6FFBB; color: #333333; padding: 2px 10px; font-size: var(--font-size-body);">SEAT ${i}</div>
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; font-family: 'Sevastopol Interface'; font-size: var(--font-size-card-header);">EMPTY</div>
            `;
            seat.onclick = () => window.app.sceneManager.navigateTo('add-item', { tableId: this.tableId, seatId: i });
            seatGrid.appendChild(seat);
        }
        rightPanel.appendChild(seatGrid);

        // Action Row
        const actionRow = document.createElement('div');
        actionRow.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        `;
        const actions = ['Edit', 'Print', 'Pay', 'Discount', 'Transfer', 'Combine'];
        actions.forEach(act => {
            const btn = document.createElement('div');
            btn.textContent = act;
            btn.style.cssText = `
                background: #333333;
                color: #C6FFBB;
                padding: 10px 15px;
                border: 1px solid #C6FFBB;
                font-family: 'Sevastopol Interface';
                font-size: var(--font-size-button);
                cursor: pointer;
                border-radius: 8px;
            `;
            if (act === 'Pay') {
                btn.onclick = () => window.app.sceneManager.navigateTo('payment', { tableId: this.tableId });
            }
            actionRow.appendChild(btn);
        });
        
        const addItemBtn = document.createElement('div');
        addItemBtn.textContent = 'Add Item';
        addItemBtn.style.cssText = `
            background: #C6FFBB;
            color: #333333;
            padding: 10px 20px;
            font-family: 'Sevastopol Interface';
            font-size: var(--font-size-button);
            cursor: pointer;
            margin-left: auto;
            border-radius: 8px;
        `;
        addItemBtn.onclick = () => window.app.sceneManager.navigateTo('add-item', { tableId: this.tableId });
        actionRow.appendChild(addItemBtn);
        
        rightPanel.appendChild(actionRow);

        // Kitchen Controls
        const kitchenBox = document.createElement('div');
        kitchenBox.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 129px;
        `;
        ['HOLD', 'FIRE', 'RESEND'].forEach(act => {
            const btn = document.createElement('div');
            btn.textContent = act;
            btn.style.cssText = `
                height: 44px;
                border: 1px solid #C6FFBB;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #C6FFBB;
                font-family: 'Sevastopol Interface';
                font-size: var(--font-size-button);
                cursor: pointer;
                border-radius: 6px;
            `;
            kitchenBox.appendChild(btn);
        });
        rightPanel.appendChild(kitchenBox);

        // SEND Button
        const sendBtn = document.createElement('div');
        sendBtn.textContent = 'SEND';
        sendBtn.style.cssText = `
            position: absolute;
            right: 0;
            bottom: 0;
            width: 186px;
            height: 93px;
            background: #C6FFBB;
            color: #333333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Alien Encounters Solid Bold';
            font-size: var(--font-size-total);
            cursor: pointer;
            border-radius: 12px;
        `;
        sendBtn.onclick = () => console.log('ORDER SENT');
        rightPanel.appendChild(sendBtn);

        container.appendChild(rightPanel);

        // Footer
        container.appendChild(renderFooter());
    }
};

export const registerCheckOverview = (sm) => {
    sm.register('check-overview', CheckOverviewScreen);
};
