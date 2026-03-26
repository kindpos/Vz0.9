import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';
import { renderNumpad } from '../components/numpad.js';
import { renderHexCluster } from '../components/hex-cluster.js';

export const LoginScreen = {
    PIN: [],
    
    async onEnter(container) {
        this.PIN = [];
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
            color: #C6FFBB;
        `;

        // Header
        const header = renderHeader('KINDPOS');
        header.style.justifyContent = 'center';
        container.appendChild(header);

        // Left Panel (PIN Frame)
        const leftPanel = document.createElement('div');
        leftPanel.style.cssText = `
            position: absolute;
            left: 138px;
            top: 161px;
            width: 287px;
            height: 353px;
            border: 6px solid #C6FFBB;
            background: #333333;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
        `;
        this.pinContainer = document.createElement('div');
        this.pinContainer.style.width = '100%';
        this.pinContainer.style.height = '100%';
        leftPanel.appendChild(this.pinContainer);
        container.appendChild(leftPanel);

        // Center (Numpad)
        const numpadContainer = document.createElement('div');
        numpadContainer.style.cssText = `
            position: absolute;
            left: 357px;
            top: 127px;
            width: 310px;
            height: 431px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        const numpad = renderNumpad((val) => this.handleNumpad(val));
        numpadContainer.appendChild(numpad);
        container.appendChild(numpadContainer);

        // Right Action Hexes
        this.renderActionHexes(container);

        // Footer
        container.appendChild(renderFooter());
        
        this.updatePINDisplay();
    },

    handleNumpad(val) {
        if (val === 'clear') {
            this.PIN = [];
        } else if (val === 'action') {
            this.attemptLogin();
        } else if (this.PIN.length < 9) {
            this.PIN.push(val);
        }
        this.updatePINDisplay();
    },

    updatePINDisplay() {
        if (!this.pinContainer) return;
        this.pinContainer.innerHTML = '';
        if (this.PIN.length > 0) {
            this.pinContainer.appendChild(renderHexCluster(this.PIN));
        }
    },

    async attemptLogin() {
        const pinStr = this.PIN.join('');
        if (pinStr === '1234' || pinStr === '1111') {
            window.app.state.user = { name: 'Alex', role: pinStr === '1111' ? 'manager' : 'server' };
            window.app.sceneManager.navigateTo('snapshot');
        } else {
            this.shakeAndClear();
        }
    },

    shakeAndClear() {
        const frame = this.pinContainer.parentElement;
        frame.animate([
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 300 });
        
        setTimeout(() => {
            this.PIN = [];
            this.updatePINDisplay();
        }, 500);
    },

    renderActionHexes(container) {
        const hexes = [
            { label: 'Clock in/out', x: 748, y: 91, w: 145, h: 163 },
            { label: 'Settings', x: 834, y: 236, w: 142, h: 165 },
            { label: 'Quick Order', x: 748, y: 380, w: 145, h: 166 }
        ];

        hexes.forEach(h => {
            const btn = document.createElement('div');
            btn.textContent = h.label;
            btn.style.cssText = `
                position: absolute;
                left: ${h.x}px;
                top: ${h.y}px;
                width: ${h.w}px;
                height: ${h.h}px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-family: 'Sevastopol Interface', sans-serif;
                font-size: 14px;
                cursor: pointer;
                padding: 20px;
                box-sizing: border-box;
                color: #C6FFBB;
            `;

            // Pseudo-border for action hexes
            const border = document.createElement('div');
            border.style.cssText = `
                position: absolute;
                inset: 0;
                background: #C6FFBB;
                clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
                z-index: -1;
            `;
            const inner = document.createElement('div');
            inner.style.cssText = `
                position: absolute;
                inset: 3px;
                background: #444444;
                clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
                z-index: -1;
            `;
            btn.appendChild(border);
            btn.appendChild(inner);
            btn.onclick = () => {
                if (h.label === 'Quick Order') {
                    window.app.sceneManager.navigateTo('check-overview', { type: 'quick_service' });
                }
            };
            container.appendChild(btn);
        });
    }
};

export const registerLogin = (sm) => {
    sm.register('login', LoginScreen);
};
