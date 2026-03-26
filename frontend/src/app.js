/**
 * KINDpos — Boot
 * Nice. Dependable. Yours.
 */

import { SceneManager } from './components/scene-manager.js';
import { registerLogin } from './scenes/login-screen-v3.js';
import { registerSnapshot } from './scenes/snapshot-screen-v3.js';
import { registerCheckOverview } from './scenes/check-overview-v3.js';
import { registerAddItem } from './scenes/add-item-v3.js';
import { registerModifyItem } from './scenes/modify-item-v3.js';
import { registerPayment } from './scenes/payment-v3.js';
import { registerCloseDay } from './scenes/close-day-v3.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  KINDpos — Nice. Dependable. Yours.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const appContainer = document.getElementById('scene-container');
    
    // Global state store access
    window.app = {
        state: { user: null },
        sceneManager: new SceneManager(appContainer)
    };

    const sm = window.app.sceneManager;

    // Register Scenes
    registerLogin(sm);
    registerSnapshot(sm);
    registerCheckOverview(sm);
    registerAddItem(sm);
    registerModifyItem(sm);
    registerPayment(sm);
    registerCloseDay(sm);

    // Start at Login
    sm.navigateTo('login');
});
