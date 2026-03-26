/**
 * KINDpos — Table Tile Component
 */

import { MOCK_TIME_THRESHOLDS } from '../stores/snapshot-store.js';

export function createTableTile(table, onClick, onDoubleClick) {
    const tile = document.createElement('div');
    tile.className = 'table-tile';
    tile.dataset.tableId = table.id;
    
    const updateTile = () => {
        const elapsedMs = Date.now() - table.openedAt;
        const mins = Math.floor(elapsedMs / 60000);
        
        let borderColor = '#4CAF50'; // Green
        if (mins >= MOCK_TIME_THRESHOLDS.red) {
            borderColor = '#FF3333'; // Red
        } else if (mins >= MOCK_TIME_THRESHOLDS.orange) {
            borderColor = '#FF8C00'; // Orange
        }
        
        tile.style.borderColor = borderColor;

        // Content based on size (handled by CSS, but we can provide placeholders)
        tile.innerHTML = `
            <div class="tile-number">${table.number}</div>
            <div class="tile-info">
                <span class="tile-guests">👤 ${table.guests}</span>
                <span class="tile-time">${mins}m</span>
            </div>
            <div class="tile-status">${table.status}</div>
        `;
    };

    updateTile();
    
    let lastTap = 0;
    tile.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            if (onDoubleClick) onDoubleClick(table);
        } else {
            if (onClick) onClick(table, tile);
        }
        lastTap = now;
    });

    return {
        el: tile,
        update: updateTile,
        setSelected(isSelected) {
            tile.classList.toggle('selected', isSelected);
        }
    };
}

export function createNewTableTile(onAction) {
    const tile = document.createElement('div');
    tile.className = 'table-tile table-tile-new';
    tile.innerHTML = '<div class="tile-number">+</div>';
    
    tile.addEventListener('click', () => onAction());
    
    return { el: tile };
}
