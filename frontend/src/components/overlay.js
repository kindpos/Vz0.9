export function showOverlay(options = {}) {
    const backdrop = document.createElement('div');
    backdrop.className = 'overlay-backdrop';
    backdrop.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const panel = document.createElement('div');
    panel.className = 'overlay-panel';
    panel.style.cssText = `
        background: #333333;
        border: 2px solid #C6FFBB;
        width: 600px;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        transform: translateY(20px);
        transition: transform 0.3s ease;
        overflow: hidden;
        border-radius: 12px;
    `;

    // Header
    const header = document.createElement('div');
    header.className = 'overlay-header';
    header.style.cssText = `
        background: #C6FFBB;
        color: #333333;
        font-family: 'Alien Encounters Solid Bold', sans-serif;
        padding: 6px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    `;
    
    const titleEl = document.createElement('div');
    titleEl.textContent = options.title || 'OVERLAY';
    header.appendChild(titleEl);
    
    const closeBtn = document.createElement('div');
    closeBtn.textContent = 'X';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        backdrop.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';
        setTimeout(() => backdrop.remove(), 300);
        if (options.onClose) options.onClose();
    };
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'overlay-content';
    content.style.cssText = `
        padding: 12px;
        flex: 1;
        overflow: auto;
        color: #C6FFBB;
        font-family: 'Sevastopol Interface', sans-serif;
    `;
    if (options.content) {
        if (typeof options.content === 'string') {
            content.innerHTML = options.content;
        } else {
            content.appendChild(options.content);
        }
    }
    panel.appendChild(content);

    // Footer
    if (options.buttons) {
        const footer = document.createElement('div');
        footer.className = 'overlay-footer';
        footer.style.cssText = `
            padding: 8px 12px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            border-top: 1px solid #C6FFBB;
        `;
        
        options.buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.style.cssText = `
                background: ${btn.primary ? '#C6FFBB' : '#333333'};
                color: ${btn.primary ? '#333333' : '#C6FFBB'};
                border: 1px solid #C6FFBB;
                padding: 6px 16px;
                font-family: 'Sevastopol Interface', sans-serif;
                cursor: pointer;
                border-radius: 6px;
            `;
            if (btn.danger) {
                button.style.background = '#E84040';
                button.style.color = '#333333';
                button.style.border = 'none';
            }
            button.onclick = () => {
                btn.onClick();
                if (btn.autoClose !== false) {
                    closeBtn.onclick();
                }
            };
            footer.appendChild(button);
        });
        panel.appendChild(footer);
    }

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);
    
    // Trigger animations
    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
    });

    return backdrop;
}
