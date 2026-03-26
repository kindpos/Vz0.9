import { renderHex } from './hex.js';

export function renderHexCluster(digits = []) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const W = 75; // Hex width
    const H = W * 0.866; // Hex height
    const colStep = W * 0.75;
    const rowStep = H;

    // Grid positions (col, row)
    const positions = [
        [0, 0], [1, 0], [0, 1], [1, 1],
        [2, 0], [2, 1], [0, 2], [1, 2], [2, 2]
    ];

    digits.forEach((digit, i) => {
        if (i >= positions.length) return;
        
        const [col, row] = positions[i];
        const x = col * colStep;
        const y = row * rowStep + (col % 2 === 1 ? H * 0.5 : 0);

        // Calculate offsets to center the cluster within the container
        // Cluster for 3x3 is roughly 187x227
        const offsetX = -75; // Adjust based on cluster width
        const offsetY = -100; // Adjust based on cluster height

        const hex = renderHex({
            text: digit,
            width: W,
            fill: '#444444',
            border: '#C6FFBB',
            textColor: '#C6FFBB'
        });

        hex.style.position = 'absolute';
        hex.style.left = `calc(50% + ${x + offsetX}px)`;
        hex.style.top = `calc(50% + ${y + offsetY}px)`;

        container.appendChild(hex);
    });

    return container;
}
