/**
 * KINDpos — Scene Manager
 * Simple full-screen scene swapper.
 */

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.registry = new Map();
        this.currentScene = null;
        this.history = [];
    }

    register(id, definition) {
        this.registry.set(id, definition);
    }

    async navigateTo(sceneId, params = {}) {
        if (!this.registry.has(sceneId)) {
            console.error(`[SceneManager] Unknown scene: ${sceneId}`);
            return;
        }

        const nextScene = this.registry.get(sceneId);

        // Exit current scene
        if (this.currentScene) {
            const prevSceneId = this.currentScene;
            const prevScene = this.registry.get(prevSceneId);
            if (prevScene.onExit) {
                await prevScene.onExit(this.container);
            }
        }

        // Clear container and mount new scene
        this.container.innerHTML = '';
        this.currentScene = sceneId;

        // Add to history unless it's a back navigation
        if (!params._isBack) {
            if (sceneId === 'login') {
                this.history = ['login'];
            } else {
                this.history.push(sceneId);
            }
        }

        await nextScene.onEnter(this.container, params);
        if (nextScene.onRender) {
            await nextScene.onRender(this.container, params);
        }

        console.log(`[SceneManager] Navigated to: ${sceneId}`);
        console.log(`[SceneManager] History: [${this.history.join(' → ')}]`);
    }

    async goBack() {
        if (this.history.length <= 1) {
            console.log('[SceneManager] Already at root — nowhere to go back to');
            return false;
        }

        this.history.pop();
        const targetId = this.history[this.history.length - 1];
        return this.navigateTo(targetId, { _isBack: true });
    }
}
