export function renderNumpad(onDigit, clearLabel = 'clr', actionLabel = '>>>', actionColor = '#C6FFBB') {
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 82px);
        grid-template-rows: repeat(4, 74px);
        gap: 12px 6px;
        background: #333333;
    `;

    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    digits.forEach(digit => {
        const btn = document.createElement('div');
        btn.textContent = digit;
        btn.style.cssText = `
            background: #333333;
            color: #C6FFBB;
            font-family: 'Sevastopol Interface', sans-serif;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 1px solid #C6FFBB;
            border-radius: 8px;
        `;
        btn.onclick = () => onDigit(digit);
        grid.appendChild(btn);
    });

    // Row 4
    const clrBtn = document.createElement('div');
    clrBtn.textContent = clearLabel;
    clrBtn.style.cssText = `
        background: #E84040;
        color: #333333;
        font-family: 'Sevastopol Interface', sans-serif;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 8px;
    `;
    clrBtn.onclick = () => onDigit('clear');
    grid.appendChild(clrBtn);

    const zeroBtn = document.createElement('div');
    zeroBtn.textContent = '0';
    zeroBtn.style.cssText = `
        background: #333333;
        color: #C6FFBB;
        font-family: 'Sevastopol Interface', sans-serif;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #C6FFBB;
    `;
    zeroBtn.onclick = () => onDigit('0');
    grid.appendChild(zeroBtn);

    const actionBtn = document.createElement('div');
    actionBtn.textContent = actionLabel;
    actionBtn.style.cssText = `
        background: ${actionColor};
        color: #333333;
        font-family: 'Sevastopol Interface', sans-serif;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 8px;
    `;
    actionBtn.onclick = () => onDigit('action');
    grid.appendChild(actionBtn);

    return grid;
}
