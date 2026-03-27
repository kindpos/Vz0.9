/**
 * Renders a single flat-top hexagon with specified parameters.
 * @param {Object} options - Hexagon configuration.
 * @param {string} options.text - Text inside the hex.
 * @param {number} options.width - Width of the hex (W).
 * @param {string} options.fill - Hexagon interior color.
 * @param {string} options.border - Hexagon border color.
 * @param {string} options.textColor - Text color.
 * @param {Function} options.onClick - Click handler.
 * @param {number} options.borderWidth - Width of the pseudo-border.
 * @returns {HTMLElement} The hexagon element.
 */
export function renderHex({
    text = '',
    width = 75,
    fill = '#333333',
    border = '#C6FFBB',
    textColor = '#C6FFBB',
    onClick = null,
    borderWidth = 2
}) {
    const H = width * 0.866;
    const hex = document.createElement('div');
    
    hex.style.cssText = `
        position: relative;
        width: ${width}px;
        height: ${H}px;
        color: ${textColor};
        font-family: 'Sevastopol Interface', sans-serif;
        font-size: var(--font-size-body);
        display: flex;
        align-items: center;
        justify-content: center;
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        cursor: ${onClick ? 'pointer' : 'default'};
        text-align: center;
        padding: 5px;
        box-sizing: border-box;
        transition: transform 0.1s;
    `;
    
    if (onClick) {
        hex.onclick = (e) => {
            hex.style.transform = 'scale(0.95)';
            setTimeout(() => hex.style.transform = 'scale(1)', 100);
            onClick(e);
        };
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.zIndex = '1';
    hex.appendChild(textSpan);

    // Border layer
    const borderLayer = document.createElement('div');
    borderLayer.style.cssText = `
        position: absolute;
        inset: 0;
        background: ${border};
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        z-index: -2;
    `;
    hex.appendChild(borderLayer);

    // Fill layer
    const fillLayer = document.createElement('div');
    fillLayer.style.cssText = `
        position: absolute;
        inset: ${borderWidth}px;
        background: ${fill};
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        z-index: -1;
    `;
    hex.appendChild(fillLayer);

    return hex;
}

/**
 * Renders a grid of hexagons using honeycomb math.
 * @param {Array} items - Array of item objects { text, onClick, color }.
 * @param {number} hexWidth - Width of each hex.
 * @param {number} cols - Number of columns (optional, default 3).
 * @returns {HTMLElement} The hex grid container.
 */
export function renderHexGrid(items, hexWidth = 100, cols = 3) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
    `;

    const W = hexWidth;
    const H = W * 0.866;
    const colStep = W * 0.75;
    const rowStep = H;

    items.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = col * colStep;
        const y = row * rowStep + (col % 2 === 1 ? H * 0.5 : 0);

        const hex = renderHex({
            text: item.text,
            width: W,
            border: item.color || '#C6FFBB',
            onClick: item.onClick,
            fill: item.fill || '#333333',
            textColor: item.textColor || '#C6FFBB'
        });

        hex.style.position = 'absolute';
        hex.style.left = `${x}px`;
        hex.style.top = `${y}px`;

        container.appendChild(hex);
    });

    return container;
}
