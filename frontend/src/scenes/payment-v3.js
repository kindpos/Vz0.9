import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';
import { renderNumpad } from '../components/numpad.js';
import { showOverlay } from '../components/overlay.js';

export const PaymentScreen = {
    async onEnter(container, params) {
        this.tableId = params.tableId || 'C-001';
        this.amount = '0.00';
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
        container.appendChild(renderHeader(`${this.tableId} // PAYMENT`, 'X'));

        // Left Panel (Preview)
        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = `
            position: absolute;
            left: 33px;
            top: 56px;
            width: 380px;
            height: 521px;
            border: 2px solid #C6FFBB;
            background: #333333;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        `;
        leftPanel.innerHTML = `
            <div style="background: #C6FFBB; color: #333333; padding: 4px 10px; font-family: 'Alien Encounters Solid Bold';">CHECK PREVIEW</div>
            <div style="padding: 10px; flex: 1; font-family: 'Sevastopol Interface'; color: #C6FFBB;">
                <div>Check: ${this.tableId}</div>
                <div>Seat: 001</div>
                <div style="margin-top: 20px; border-top: 1px solid #C6FFBB; padding-top: 10px; color: #FBDE42;">
                    <div style="display: flex; justify-content: space-between;"><span>Total</span><span>$0.00</span></div>
                </div>
            </div>
        `;
        container.appendChild(leftPanel);

        // Center (Payment Controls)
        const center = document.createElement('div');
        center.style.cssText = `
            position: absolute;
            left: 450px;
            top: 56px;
            width: 250px;
            height: 521px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        `;
        
        const exactBtn = document.createElement('div');
        exactBtn.textContent = 'EXACT';
        exactBtn.style.cssText = `width: 109px; height: 46px; background: #C6FFBB; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Sevastopol Interface'; border-radius: 8px;`;
        center.appendChild(exactBtn);

        const cashGrid = document.createElement('div');
        cashGrid.style.cssText = `display: grid; grid-template-columns: repeat(2, 95px); gap: 10px;`;
        ['$5', '$10', '$15', '$20', '$50', '$100'].forEach(val => {
            const btn = document.createElement('div');
            btn.textContent = val;
            btn.style.cssText = `height: 46px; border: 1px solid #C6FFBB; color: #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 8px;`;
            cashGrid.appendChild(btn);
        });
        center.appendChild(cashGrid);

        const cashBtn = document.createElement('div');
        cashBtn.textContent = 'CASH';
        cashBtn.style.cssText = `margin-top: auto; width: 148px; height: 62px; background: #C6FFBB; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Alien Encounters Solid Bold'; font-size: 20px; border-radius: 12px;`;
        cashBtn.onclick = () => this.handleCash();
        center.appendChild(cashBtn);

        const cardBtn = document.createElement('div');
        cardBtn.textContent = 'CARD';
        cardBtn.style.cssText = `width: 148px; height: 62px; background: #C6FFBB; color: #333333; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Alien Encounters Solid Bold'; font-size: 20px; border-radius: 12px;`;
        cardBtn.onclick = () => this.handleCard();
        center.appendChild(cardBtn);

        container.appendChild(center);

        // Right (Numpad + Amount)
        const right = document.createElement('div');
        right.style.cssText = `
            position: absolute;
            left: 719px;
            top: 47px;
            width: 278px;
            height: 530px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        
        const amountDisplay = document.createElement('div');
        amountDisplay.textContent = `$${this.amount}`;
        amountDisplay.style.cssText = `height: 48px; border: 1px solid #C6FFBB; color: #FBDE42; display: flex; align-items: center; justify-content: flex-end; padding: 0 10px; font-family: 'Sevastopol Interface'; font-size: 24px; border-radius: 8px;`;
        right.appendChild(amountDisplay);

        const numpad = renderNumpad((digit) => console.log('Digit:', digit), 'clr', 'Exact');
        right.appendChild(numpad);
        
        const loyaltyRow = document.createElement('div');
        loyaltyRow.style.cssText = `display: flex; gap: 10px; margin-top: auto;`;
        const loyaltyBtn = document.createElement('div');
        loyaltyBtn.textContent = 'Loyalty';
        loyaltyBtn.style.cssText = `width: 148px; height: 63px; border: 1px solid #C6FFBB; color: #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 8px;`;
        const gcBtn = document.createElement('div');
        gcBtn.textContent = 'GC';
        gcBtn.style.cssText = `width: 82px; height: 63px; border: 1px solid #C6FFBB; color: #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 8px;`;
        loyaltyRow.appendChild(loyaltyBtn);
        loyaltyRow.appendChild(gcBtn);
        right.appendChild(loyaltyRow);

        container.appendChild(right);

        // Footer
        container.appendChild(renderFooter());
    },

    handleCash() {
        showOverlay({
            title: 'CASH PAYMENT',
            content: '<div>Total Due: $0.00</div><div>Amount Tendered: $0.00</div>',
            buttons: [
                { label: 'CANCEL', danger: true, onClick: () => {} },
                { label: 'CONFIRM', primary: true, onClick: () => window.app.sceneManager.navigateTo('snapshot') }
            ]
        });
    },

    handleCard() {
        showOverlay({
            title: 'CARD PAYMENT',
            content: '<div>Present Card...</div>',
            buttons: [
                { label: 'CANCEL', danger: true, onClick: () => {} }
            ]
        });
        // Mock success
        setTimeout(() => {
            window.app.sceneManager.navigateTo('snapshot');
        }, 2000);
    }
};

export const registerPayment = (sm) => {
    sm.register('payment', PaymentScreen);
};
