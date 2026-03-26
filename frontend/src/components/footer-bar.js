export function renderFooter() {
    const footer = document.createElement('div');
    footer.className = 'footer-bar';
    footer.style.cssText = `
        width: 1024px;
        height: 30px;
        background: #333333;
        color: #C6FFBB;
        font-family: 'Sevastopol Interface', sans-serif;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 16px;
        box-sizing: border-box;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1000;
        border-top: 1px solid #C6FFBB;
    `;

    const left = document.createElement('div');
    left.innerHTML = `
        <span style="color: #C6FFBB">TRM-</span><span style="color: #FBDE42">001</span>
        <span style="color: #C6FFBB"> // vz</span><span style="color: #FBDE42">1.0</span>
    `;
    left.style.fontSize = '14px';
    footer.appendChild(left);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    
    const logoContainer = document.createElement('div');
    logoContainer.style.cssText = `
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border: 2px solid #C6FFBB;
        animation: spin 20s linear infinite;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Simple icon representation
    const innerIcon = document.createElement('div');
    innerIcon.style.cssText = `
        width: 10px;
        height: 10px;
        background: #C6FFBB;
    `;
    logoContainer.appendChild(innerIcon);
    
    const logoText = document.createElement('div');
    logoText.textContent = 'KINDpos';
    logoText.style.fontFamily = 'Alien Encounters Solid Bold', 'sans-serif';
    logoText.style.fontSize = '14px';
    
    right.appendChild(logoContainer);
    right.appendChild(logoText);
    footer.appendChild(right);

    // Inject @keyframes if not present
    if (!document.getElementById('footer-spin-styles')) {
        const style = document.createElement('style');
        style.id = 'footer-spin-styles';
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    return footer;
}
