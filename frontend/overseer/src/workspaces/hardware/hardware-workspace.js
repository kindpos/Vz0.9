import { renderTabBar } from '../../components/tab-bar.js';
import { renderDataTable } from '../../components/data-table.js';
import { renderPropertyForm } from '../../components/property-form.js';
import { renderOverlay } from '../../components/overlay-dialog.js';
import { ApiClient } from '../../modules/api-client.js';
import { ChangeTracker } from '../../modules/change-tracker.js';

export function createHardwareWorkspace() {
  let activeTab = 'terminals';
  let terminals = [];
  let printers = [];
  let routing = { matrix: {} };
  let categories = [];
  let container = null;

  async function loadData() {
    try {
      terminals = await ApiClient.get('/config/terminals');
      printers = await ApiClient.get('/config/printers').catch(() => []); // Fallback if not yet fully integrated
      routing = await ApiClient.get('/config/routing');
      categories = await ApiClient.get('/config/menu/categories');
      render();
    } catch (e) {
      console.error('Failed to load hardware data', e);
    }
  }

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    const tabs = [
      { id: 'terminals', label: 'Terminals', hasPending: false },
      { id: 'printers', label: 'Printers', hasPending: false },
      { id: 'routing', label: 'Printer Routing', hasPending: ChangeTracker.hasPending('hardware') },
      { id: 'payment', label: 'Payment Devices', hasPending: false }
    ];

    container.appendChild(renderTabBar({
      tabs,
      activeId: activeTab,
      onSelect: (id) => {
        activeTab = id;
        render();
      }
    }));

    const contentArea = document.createElement('div');
    contentArea.style.padding = '20px';

    if (activeTab === 'terminals') {
      renderTerminalsTab(contentArea);
    } else if (activeTab === 'routing') {
      renderRoutingTab(contentArea);
    } else {
      contentArea.innerHTML = `<div class="group-box"><div class="group-box-label">${activeTab.toUpperCase()}</div><p style="color:#777">Build in progress...</p></div>`;
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderTerminalsTab(mount) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.innerHTML = '<div class="group-box-label">REGISTERED TERMINALS</div>';
    
    box.appendChild(renderDataTable({
      columns: [
        { key: 'name', label: 'Terminal Name' },
        { key: 'terminal_id', label: 'ID' },
        { key: 'role', label: 'Role' },
        { key: 'training_mode', label: 'Training', render: (v) => v ? '<span style="color:var(--accent-mint)">YES</span>' : 'NO' }
      ],
      rows: terminals.map(t => ({ ...t, id: t.terminal_id })),
      onEdit: (id) => console.log(`Edit terminal ${id}`)
    }));

    mount.appendChild(box);
  }

  function renderRoutingTab(mount) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.innerHTML = '<div class="group-box-label">ROUTING RULES</div>';
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.width = '100%';
    
    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Category</th>${printers.map(p => `<th>${p.name}</th>`).join('')}</tr>`;
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    categories.forEach(cat => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${cat.name}</td>`;
      printers.forEach(p => {
        const td = document.createElement('td');
        td.style.textAlign = 'center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = (routing.matrix[cat.category_id] || []).includes(p.printer_id);
        checkbox.onchange = () => {
          if (checkbox.checked) {
            if (!routing.matrix[cat.category_id]) routing.matrix[cat.category_id] = [];
            routing.matrix[cat.category_id].push(p.printer_id);
          } else {
            routing.matrix[cat.category_id] = routing.matrix[cat.category_id].filter(id => id !== p.printer_id);
          }
          ChangeTracker.stage('routing.matrix_updated', routing, 'hardware', 'Routing', `Updated routing for ${cat.name}`);
          render();
        };
        td.appendChild(checkbox);
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    box.appendChild(table);
    mount.appendChild(box);
  }

  return {
    render: () => {
      loadData();
      return render();
    }
  };
}
