export const WorkspaceContainer = {
  workspaces: new Map(),
  activeId: null,

  registerWorkspace(id, factory) {
    this.workspaces.set(id, { factory, instance: null });
  },

  async showWorkspace(id) {
    const mount = document.getElementById('workspace-mount');
    if (!mount) return;

    // Call onExit on current workspace
    if (this.activeId && this.workspaces.has(this.activeId)) {
      const active = this.workspaces.get(this.activeId);
      if (active.instance && typeof active.instance.onExit === 'function') {
        active.instance.onExit();
      }
    }

    mount.innerHTML = '';
    this.activeId = id;

    if (this.workspaces.has(id)) {
      const workspace = this.workspaces.get(id);
      
      // Create instance if it doesn't exist
      if (!workspace.instance) {
        workspace.instance = workspace.factory();
      }

      const element = workspace.instance.render();
      mount.appendChild(element);

      // Call onEnter
      if (typeof workspace.instance.onEnter === 'function') {
        workspace.instance.onEnter();
      }
    } else {
      console.error(`Workspace ${id} not registered`);
    }
  }
};
