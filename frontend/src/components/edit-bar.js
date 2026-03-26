export function renderEditBar(count, onExpandAction, customActions = []) {
    const bar = document.createElement('div');
    bar.className = 'edit-bar';
    bar.style.cssText = `
        background: #C6FFBB;
        color: #333333;
        font-family: 'Alien Encounters Solid Bold', sans-serif;
        height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 50;
        box-sizing: border-box;
    `;

    const info = document.createElement('div');
    info.textContent = `EDIT: ${count} SELECTED`;
    info.style.fontSize = 'var(--font-size-card-header)';
    bar.appendChild(info);

    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.gap = '8px';
    actionsContainer.style.alignItems = 'center';

    customActions.forEach(action => {
        const btn = document.createElement('div');
        btn.textContent = action.label;
        btn.style.cssText = `
            cursor: pointer;
            padding: 2px 10px;
            background: #333333;
            color: #C6FFBB;
            font-size: var(--font-size-body);
            border-radius: 4px;
            font-family: 'Sevastopol Interface', sans-serif;
        `;
        btn.onclick = (e) => {
            e.stopPropagation();
            action.onClick();
        };
        actionsContainer.appendChild(btn);
    });

    const expandBtn = document.createElement('div');
    expandBtn.textContent = '+';
    expandBtn.style.cssText = `
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid #333333;
        border-radius: 4px;
        font-size: 20px;
    `;
    expandBtn.onclick = (e) => {
        e.stopPropagation();
        onExpandAction();
    };
    actionsContainer.appendChild(expandBtn);
    bar.appendChild(actionsContainer);

    return bar;
}
