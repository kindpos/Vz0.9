/**
 * KINDpos — Action Bridge
 * Vertical button column: MOD | EDT | HLD | FRE | DEL | SND
 * MIGRATED from prototype.
 */

import { bridgeRemove, bridgeSend } from './check-view.js';
import { bridgeModify } from './modifier-zone.js';

export function init() {
    // Buttons are wired by order-screen via data-action attributes
}

export { bridgeRemove, bridgeSend, bridgeModify };
