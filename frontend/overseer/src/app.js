import { renderShell, initTheme } from './components/overseer-shell.js';
import { renderSidebar } from './components/sidebar-nav.js';
import { WorkspaceContainer } from './components/workspace-container.js';
import { renderEmptyState } from './components/empty-state.js';
import { renderOverlay } from './components/overlay-dialog.js';
import { renderInfoDrawer } from './components/info-drawer.js';
import { ChangeTracker } from './modules/change-tracker.js';
import { ApiClient } from './modules/api-client.js';
import { createStoreWorkspace } from './workspaces/store/store-workspace.js';
import { createEmployeesWorkspace } from './workspaces/employees/employees-workspace.js';
import { createMenuWorkspace } from './workspaces/menu/menu-workspace.js';
import { createFloorPlanWorkspace } from './workspaces/floor/floor-workspace.js';
import { createHardwareWorkspace } from './workspaces/hardware/hardware-workspace.js';
import { createReportingWorkspace } from './workspaces/reporting/reporting-workspace.js';

// App State
const state = {
  storeName: 'KINDpos',
  activeWorkspace: 'store',
  pendingCount: 0,
  infoStatus: 'green',
  isTrainingMode: false,
  alerts: []
};

// Workspace Factories
const createEmptyWorkspace = (id, icon, message, ctaLabel) => {
  return () => ({
    render: () => renderEmptyState({
      icon,
      message,
      ctas: [{ label: ctaLabel, onClick: () => console.log(`${id} started!`) }]
    }),
    onEnter: () => console.log(`Entered ${id}`),
    onExit: () => console.log(`Exited ${id}`)
  });
};

function init() {
  // Listen for changes
  window.addEventListener('overseer:changes-updated', (e) => {
    state.pendingCount = e.detail.count;
    updateSidebar();
  });

  // Register Workspaces
  WorkspaceContainer.registerWorkspace('store', createStoreWorkspace);
  WorkspaceContainer.registerWorkspace('employees', createEmployeesWorkspace);
  WorkspaceContainer.registerWorkspace('menu', createMenuWorkspace);
  WorkspaceContainer.registerWorkspace('floor', createFloorPlanWorkspace);
  WorkspaceContainer.registerWorkspace('hardware', createHardwareWorkspace);
  WorkspaceContainer.registerWorkspace('reporting', createReportingWorkspace);

  // Initial Render
  const root = document.getElementById('overseer-root');
  if (!root) return;

  root.appendChild(renderShell());
  initTheme(state.isTrainingMode);

  state.pendingCount = ChangeTracker.getPendingCount();
  updateSidebar();
  WorkspaceContainer.showWorkspace(state.activeWorkspace);
}

function updateSidebar() {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  mount.innerHTML = '';
  mount.appendChild(renderSidebar({
    storeName: state.storeName,
    activeId: state.activeWorkspace,
    pendingSections: ChangeTracker.getPending().map(c => c.section),
    pushCount: state.pendingCount,
    infoStatus: state.infoStatus,
    onNavClick: (id) => {
      state.activeWorkspace = id;
      updateSidebar();
      WorkspaceContainer.showWorkspace(id);
    },
    onInfoClick: () => {
      renderInfoDrawer({
        alerts: state.alerts,
        onClose: () => {}
      });
    },
    onPushClick: () => {
      showPushReview();
    }
  }));
}

function showPushReview() {
  const pending = ChangeTracker.getPending();
  const content = document.createElement('div');
  content.innerHTML = `
    <div style="color: var(--text-secondary); margin-bottom: 20px;">
      Reviewing ${pending.length} pending changes across ${new Set(pending.map(p => p.section)).size} sections.
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${pending.map(p => `
        <div style="padding: 10px; background: var(--bg-secondary); border-radius: 4px; display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; color: var(--accent-mint);">${p.section.toUpperCase()} > ${p.tab}</div>
            <div style="font-size: 14px;">${p.description}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderOverlay({
    title: 'REVIEW PENDING CHANGES',
    content,
    actions: [
      { label: 'DISCARD ALL', secondary: true, destructive: true, onClick: () => {
        ChangeTracker.clear();
        return true;
      }},
      { label: 'CANCEL', secondary: true, onClick: () => true },
      { label: 'PUSH NOW', onClick: async () => {
        try {
          const result = await ApiClient.post('/config/push', { changes: pending });
          console.log(`Push successful! ${result.events_written} events written.`);
          ChangeTracker.clear();
          return true;
        } catch (e) {
          console.error(`Push failed: ${e.message}`);
          return false;
        }
      }}
    ]
  });
}

// Start App
document.addEventListener('DOMContentLoaded', init);
