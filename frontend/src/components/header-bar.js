export function renderHeader(title, rightAction = null) {
    const header = document.createElement('div');
    header.className = 'header-bar';
    header.style.cssText = `
        width: 1024px;
        height: 30px;
        background: #C6FFBB;
        color: #333333;
        font-family: 'Alien Encounters Solid Bold', sans-serif;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 15px;
        box-sizing: border-box;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
    `;

    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.fontSize = 'var(--font-size-header)';
    header.appendChild(titleEl);

    if (rightAction) {
        const actionBtn = document.createElement('div');
        actionBtn.className = 'header-action';
        actionBtn.style.cssText = `
            cursor: pointer;
            padding: 2px 8px;
            border: 1px solid #333333;
            font-size: var(--font-size-body);
        `;
        
        if (typeof rightAction === 'string') {
            actionBtn.textContent = rightAction;
            if (rightAction === 'X') {
                actionBtn.onclick = () => window.app.sceneManager.navigateTo('login');
            }
        } else if (rightAction.label) {
            actionBtn.textContent = rightAction.label;
            actionBtn.onclick = rightAction.onClick;
        }
        
        header.appendChild(actionBtn);
    }

    return header;
}
