import { renderHeader } from '../components/header-bar.js';
import { renderFooter } from '../components/footer-bar.js';

export const CloseDayScreen = {
    async onEnter(container) {
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
            align-items: center;
        `;

        // Header
        container.appendChild(renderHeader('Close Day', 'X'));

        // Server Cards
        const cardsRow = document.createElement('div');
        cardsRow.style.cssText = `
            display: flex;
            gap: 45px;
            margin-top: 72px;
        `;
        
        // One completed card
        const completedCard = document.createElement('div');
        completedCard.style.cssText = `width: 185px; height: 185px; background: #333333; color: #C6FFBB; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Sevastopol Interface';`;
        completedCard.innerHTML = '<div>ALEX</div><div style="font-size: 10px; margin-top: 10px;">CHECKOUT COMPLETE</div>';
        cardsRow.appendChild(completedCard);

        // Three active cards
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.style.cssText = `width: 170px; height: 171px; border: 2px solid #C6FFBB; background: #333333; color: #C6FFBB; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Sevastopol Interface';`;
            card.innerHTML = `<div>SERVER ${i+2}</div><div style="font-size: 10px; margin-top: 10px;">OPEN CHECKS: ${i+1}</div>`;
            cardsRow.appendChild(card);
        }
        container.appendChild(cardsRow);

        // Progress Bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            margin-top: 57px;
            width: 580px;
            height: 51px;
            border: 2px solid #C6FFBB;
            position: relative;
            overflow: hidden;
        `;
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            width: 25%;
            height: 100%;
            background: #C6FFBB;
            transition: width 0.5s ease;
        `;
        progressContainer.appendChild(progressFill);
        container.appendChild(progressContainer);

        // Action Buttons
        const actionRow = document.createElement('div');
        actionRow.style.cssText = `
            margin-top: 73px;
            display: flex;
            gap: 104px;
        `;
        
        const submitBtn = document.createElement('div');
        submitBtn.textContent = 'SUBMIT BATCH';
        submitBtn.style.cssText = `width: 319px; height: 85px; background: #333333; color: #C6FFBB; border: 1px solid #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: not-allowed; opacity: 0.5; font-family: 'Alien Encounters Solid Bold'; font-size: 20px;`;
        
        const closeBtn = document.createElement('div');
        closeBtn.textContent = 'CLOSE DAY';
        closeBtn.style.cssText = `width: 319px; height: 85px; background: #333333; color: #C6FFBB; border: 1px solid #C6FFBB; display: flex; align-items: center; justify-content: center; cursor: not-allowed; opacity: 0.5; font-family: 'Alien Encounters Solid Bold'; font-size: 20px;`;

        actionRow.appendChild(submitBtn);
        actionRow.appendChild(closeBtn);
        container.appendChild(actionRow);

        // Footer
        container.appendChild(renderFooter());
    }
};

export const registerCloseDay = (sm) => {
    sm.register('close-day', CloseDayScreen);
};
