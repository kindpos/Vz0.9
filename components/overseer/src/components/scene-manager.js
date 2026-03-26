/* ============================================
   KINDpos Overseer - Scene Manager
   Orchestrates navigation between hex-scenes
   and detail-scenes across two DOM zones.

   "Events are truth, state is projection."
   The scene manager is the projection layer.
   ============================================ */

export class SceneManager {

    /**
     * @param {Object} zones - DOM zone references
     * @param {HTMLElement} zones.hexGrid - #hex-container
     * @param {HTMLElement} zones.detailScreen - #detail-screen-container
     */
    constructor(zones) {
        this.zones = zones;

        // Scene registry: Map of sceneId → scene definition
        this.registry = new Map();

        // Navigation state
        this.currentScene = null;     // Currently active scene ID
        this.history = [];            // Navigation breadcrumb stack
        this.isTransitioning = false; // Lock to prevent double-navigation

        // Cache detail screen elements for slide transitions
        this.detailTitle = zones.detailScreen.querySelector('.detail-title');
        this.detailContent = zones.detailScreen.querySelector('.detail-content');
        this.detailBackBtn = zones.detailScreen.querySelector('.detail-back-button');

        // Create the opaque overlay
        this._createOverlay();

        // Wire up the back button
        if (this.detailBackBtn) {
            this.detailBackBtn.addEventListener('click', () => this.goBack());
        }

        console.log('[SceneManager] Initialized with zones:', Object.keys(zones).join(', '));
    }

    /* ------------------------------------------
       OVERLAY
    ------------------------------------------ */

    /**
     * Create a full-screen opaque overlay that sits behind
     * the detail screen but above the hex container.
     * Clicking it triggers goBack().
     */
    _createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'scene-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 25;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        this.overlay.addEventListener('click', () => this.goBack());
        document.body.appendChild(this.overlay);
    }

    _showOverlay() {
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
    }

    _hideOverlay() {
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
    }

    /* ------------------------------------------
       REGISTRATION
    ------------------------------------------ */

    /**
     * Register a scene with the manager.
     *
     * @param {string} id - Unique scene identifier
     * @param {Object} definition - Scene definition
     * @param {string} definition.type - 'hex' (mounts in hex-container) or 'detail' (slides in overlay)
     * @param {string} [definition.title] - Display title (used in detail header and back button)
     * @param {string} [definition.parent] - Parent scene ID (for back navigation context)
     * @param {Function} definition.onEnter - Called with (container) when scene becomes active
     * @param {Function} [definition.onRender] - Called after onEnter for post-mount work
     * @param {Function} definition.onExit - Called with (container) when scene is leaving
     */
    register(id, definition) {
        if (this.registry.has(id)) {
            console.warn(`[SceneManager] Overwriting existing scene: ${id}`);
        }

        if (!definition.type || !['hex', 'detail'].includes(definition.type)) {
            console.error(`[SceneManager] Scene "${id}" must have type 'hex' or 'detail'`);
            return;
        }
        if (!definition.onEnter || !definition.onExit) {
            console.error(`[SceneManager] Scene "${id}" must provide onEnter and onExit`);
            return;
        }

        this.registry.set(id, definition);
        console.log(`[SceneManager] Registered: ${id} (${definition.type})`);
    }

    /* ------------------------------------------
       NAVIGATION
    ------------------------------------------ */

    /**
     * Navigate to a scene by ID.
     * Handles exit of current scene, zone targeting,
     * transitions, and history management.
     */
    async navigateTo(sceneId, params = {}) {
        if (!this.registry.has(sceneId)) {
            console.error(`[SceneManager] Unknown scene: ${sceneId}`);
            return false;
        }

        if (this.isTransitioning) {
            console.warn(`[SceneManager] Navigation blocked — transition in progress`);
            return false;
        }

        this.isTransitioning = true;

        const nextScene = this.registry.get(sceneId);
        const prevSceneId = this.currentScene;
        const prevScene = prevSceneId ? this.registry.get(prevSceneId) : null;

        try {
            // --- EXIT current scene ---
            if (prevScene) {
                const prevContainer = this._getContainer(prevScene.type);
                await prevScene.onExit(prevContainer);

                if (prevScene.type === 'detail') {
                    this._hideOverlay();
                    await this._hideDetailOverlay();
                }
            }

            // --- ENTER new scene ---
            const nextContainer = this._getContainer(nextScene.type);

            if (nextScene.type === 'detail') {
                this._prepareDetailOverlay(nextScene, sceneId);
            }

            await nextScene.onEnter(nextContainer, params);

            if (nextScene.type === 'detail') {
                this._showOverlay();
                await this._showDetailOverlay();
            }

            if (nextScene.onRender) {
                await nextScene.onRender(nextContainer, params);
            }

            // --- UPDATE STATE ---
            if (!params._isBack) {
                this.history.push(sceneId);
            }

            this.currentScene = sceneId;

            console.log(`[SceneManager] Navigated: ${prevSceneId || '(none)'} → ${sceneId}`);
            console.log(`[SceneManager] History: [${this.history.join(' → ')}]`);

        } catch (err) {
            console.error(`[SceneManager] Navigation error:`, err);
        } finally {
            this.isTransitioning = false;
        }

        return true;
    }

    /**
     * Navigate back to the previous scene.
     */
    async goBack() {
        if (this.history.length <= 1) {
            console.log('[SceneManager] Already at root — nowhere to go back to');
            return false;
        }

        this.history.pop();
        const targetId = this.history[this.history.length - 1];
        return this.navigateTo(targetId, { _isBack: true });
    }

    /* ------------------------------------------
       START
    ------------------------------------------ */

    async start(defaultSceneId) {
        if (!this.registry.has(defaultSceneId)) {
            console.error(`[SceneManager] Cannot start — scene "${defaultSceneId}" not registered`);
            return;
        }

        console.log(`[SceneManager] Starting with: ${defaultSceneId}`);
        await this.navigateTo(defaultSceneId);
    }

    /* ------------------------------------------
       ZONE HELPERS
    ------------------------------------------ */

    _getContainer(type) {
        if (type === 'hex') {
            return this.zones.hexGrid;
        }
        if (type === 'detail') {
            return this.detailContent;
        }
        return null;
    }

    _prepareDetailOverlay(scene, sceneId) {
        if (this.detailTitle) {
            this.detailTitle.textContent = scene.title || sceneId;
        }

        if (this.detailBackBtn && scene.parent) {
            const parentScene = this.registry.get(scene.parent);
            const parentName = parentScene ? (parentScene.title || scene.parent) : 'Back';
            this.detailBackBtn.textContent = `← Back to ${parentName}`;
        }
    }

    _showDetailOverlay() {
        return new Promise(resolve => {
            const el = this.zones.detailScreen;
            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);
            el.classList.add('visible');
        });
    }

    _hideDetailOverlay() {
        return new Promise(resolve => {
            const el = this.zones.detailScreen;
            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);
            el.classList.remove('visible');
        });
    }

    /* ------------------------------------------
       QUERY HELPERS
    ------------------------------------------ */

    getCurrentScene() {
        return this.currentScene ? this.registry.get(this.currentScene) : null;
    }

    getCurrentSceneId() {
        return this.currentScene;
    }

    getHistory() {
        return [...this.history];
    }

    getSceneCount() {
        return this.registry.size;
    }
}

