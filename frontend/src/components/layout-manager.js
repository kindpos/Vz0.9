/**
 * KINDpos — Layout Manager Component
 */

export function initLayoutManager(container, cards) {
    const totalHeight = 728; // 800 - 36 - 36

    const cardPriority = {
        'shiftOverview': 1,
        'messenger': 2,
        'reporting': 1,
        'hardware': 2
    };

    const maxExpandedHeights = {
        'shiftOverview': 0.7 * totalHeight,
        'messenger': 0.7 * totalHeight,
        'reporting': 0.7 * totalHeight,
        'hardware': 0.5 * totalHeight
    };

    const minFloors = {
        'shiftOverview': 36,
        'messenger': 86, // 36 title + pinned space
        'reporting': 36,
        'hardware': 36
    };

    const manageColumn = (topCard, bottomCard) => {
        if (!topCard || !bottomCard) return;

        const topState = topCard.getState();
        const bottomState = bottomCard.getState();

        // Reset floors
        topCard.setFloor(false);
        bottomCard.setFloor(false);

        if (topState === 'expanded' && bottomState === 'expanded') {
            // Both expanded: split 55/45 based on priority
            const topPriority = cardPriority[topCard.id];
            const bottomPriority = cardPriority[bottomCard.id];
            
            let topH, bottomH;
            if (topPriority <= bottomPriority) {
                topH = (totalHeight - 8) * 0.55;
                bottomH = (totalHeight - 8) * 0.45;
            } else {
                topH = (totalHeight - 8) * 0.45;
                bottomH = (totalHeight - 8) * 0.55;
            }
            topCard.setHeight(topH);
            bottomCard.setHeight(bottomH);
        } else if (topState === 'expanded') {
            const bottomH = bottomCard.collapsedHeight || 60;
            topCard.setHeight(totalHeight - 8 - bottomH);
            bottomCard.setHeight(bottomH);
        } else if (bottomState === 'expanded') {
            const topH = topCard.collapsedHeight || 60;
            bottomCard.setHeight(totalHeight - 8 - topH);
            topCard.setHeight(topH);
        } else {
            // Both collapsed
            topCard.setHeight(topCard.collapsedHeight || 60);
            bottomCard.setHeight(bottomCard.collapsedHeight || 60);
        }
    };

    const redistribute = () => {
        console.log('[LayoutManager] Redistributing...');
        // Tables is special (full height in center)
        if (cards.tables) {
            cards.tables.setHeight(totalHeight);
            cards.tables.expand(); // Always expanded
        }

        // Left Column
        console.log('[LayoutManager] Left Column:', cards.shiftOverview.getState(), cards.messenger.getState());
        manageColumn(cards.shiftOverview, cards.messenger);

        // Right Column
        console.log('[LayoutManager] Right Column:', cards.reporting.getState(), cards.hardware.getState());
        manageColumn(cards.reporting, cards.hardware);
    };

    // Initial run
    redistribute();

    return {
        update() {
            redistribute();
        }
    };
}
