import { renderTabBar } from '../../components/tab-bar.js';
import { renderDataTable } from '../../components/data-table.js';
import { renderPropertyForm } from '../../components/property-form.js';
import { ApiClient } from '../../modules/api-client.js';
import { ChangeTracker } from '../../modules/change-tracker.js';

export function createMenuWorkspace() {
  let activeTab = 'items';
  let categories = [];
  let items = [];
  let container = null;
  let selectedNode = null; // { type: 'category' | 'item', data: object }

  async function loadData() {
    try {
      categories = await ApiClient.get('/config/menu/categories');
      items = await ApiClient.get('/config/menu/items');
      render();
    } catch (e) {
      console.error('Failed to load menu data', e);
    }
  }

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    const tabs = [
      { id: 'items', label: 'Categories & Items', hasPending: ChangeTracker.hasPending('menu') },
      { id: 'mods', label: 'Modifiers', hasPending: ChangeTracker.hasPending('menu') },
      { id: 'pricing', label: 'Pricing & Specials', hasPending: ChangeTracker.hasPending('menu') },
      { id: 'discounts', label: 'Discounts', hasPending: ChangeTracker.hasPending('menu') },
      { id: '86', label: 'Availability & 86 Board', hasPending: false },
      { id: 'import', label: 'Import', hasPending: false }
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
    contentArea.style.display = 'flex';
    contentArea.style.height = 'calc(100vh - 100px)';
    contentArea.style.gap = '20px';

    if (activeTab === 'items') {
      renderItemsTab(contentArea);
    } else {
      contentArea.innerHTML = `<div class="group-box" style="flex:1"><div class="group-box-label">${activeTab.toUpperCase()}</div><p style="color:#777">Phase 2: Build in progress...</p></div>`;
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderItemsTab(mount) {
    // Left Panel: Tree
    const treePanel = document.createElement('div');
    treePanel.className = 'group-box sunken';
    treePanel.style.width = '40%';
    treePanel.style.overflowY = 'auto';
    treePanel.innerHTML = '<div class="group-box-label">MENU STRUCTURE</div>';
    
    const treeRoot = document.createElement('div');
    treeRoot.style.padding = '10px';
    
    categories.sort((a, b) => a.display_order - b.display_order).forEach(cat => {
      const catEl = document.createElement('div');
      catEl.className = 'tree-node category';
      catEl.innerHTML = `<span>▼ ${cat.name}</span>`;
      catEl.style.cursor = 'pointer';
      catEl.style.padding = '4px 8px';
      catEl.onclick = () => {
        selectedNode = { type: 'category', data: cat };
        render();
      };
      if (selectedNode?.type === 'category' && selectedNode.data.category_id === cat.category_id) {
        catEl.classList.add('pressed');
      }
      treeRoot.appendChild(catEl);

      // Items in category
      items.filter(i => i.category_id === cat.category_id).forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'tree-node item';
        itemEl.innerHTML = `<span>&nbsp;&nbsp;&nbsp;📄 ${item.name}</span> <span style="float:right; color:var(--accent-yellow)">$${item.price.toFixed(2)}</span>`;
        itemEl.style.cursor = 'pointer';
        itemEl.style.padding = '2px 8px';
        itemEl.style.fontSize = '14px';
        itemEl.onclick = (e) => {
          e.stopPropagation();
          selectedNode = { type: 'item', data: item };
          render();
        };
        if (selectedNode?.type === 'item' && selectedNode.data.item_id === item.item_id) {
          itemEl.classList.add('pressed');
        }
        treeRoot.appendChild(itemEl);
      });
    });

    const addCatBtn = document.createElement('button');
    addCatBtn.className = 'btn';
    addCatBtn.textContent = '+ Add Category';
    addCatBtn.style.margin = '10px';
    treeRoot.appendChild(addCatBtn);

    treePanel.appendChild(treeRoot);
    mount.appendChild(treePanel);

    // Right Panel: Details
    const detailPanel = document.createElement('div');
    detailPanel.style.flex = '1';
    detailPanel.style.overflowY = 'auto';

    if (selectedNode) {
      if (selectedNode.type === 'category') {
        renderCategoryEditor(detailPanel, selectedNode.data);
      } else {
        renderItemEditor(detailPanel, selectedNode.data);
      }
    } else {
      detailPanel.innerHTML = '<div class="group-box"><p style="color:#777; padding:20px">Select a category or item to edit</p></div>';
    }

    mount.appendChild(detailPanel);
  }

  function renderCategoryEditor(mount, cat) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.innerHTML = '<div class="group-box-label">CATEGORY DETAILS</div>';
    
    box.appendChild(renderPropertyForm({
      fields: [
        { key: 'name', label: 'Category Name', type: 'text', saveBehavior: 'push', value: cat.name },
        { key: 'display_order', label: 'Display Order', type: 'number', saveBehavior: 'push', value: cat.display_order },
        { key: 'hex_color', label: 'Hex Nav Color', type: 'text', saveBehavior: 'push', value: cat.hex_color },
        { key: 'active', label: 'Active', type: 'toggle', saveBehavior: 'push', value: cat.active }
      ],
      onChange: (key, val) => {
        const oldValue = cat[key];
        cat[key] = val;
        ChangeTracker.stage('menu.category_updated', cat, 'menu', 'Items', `Updated ${cat.name} ${key}: ${oldValue} -> ${val}`);
        render();
      }
    }));
    mount.appendChild(box);
  }

  function renderItemEditor(mount, item) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.innerHTML = '<div class="group-box-label">ITEM DETAILS</div>';
    
    box.appendChild(renderPropertyForm({
      fields: [
        { key: 'name', label: 'Item Name', type: 'text', saveBehavior: 'push', value: item.name },
        { key: 'price', label: 'Price ($)', type: 'number', saveBehavior: 'push', value: item.price },
        { key: 'description', label: 'Description', type: 'text', saveBehavior: 'push', value: item.description },
        { key: 'active', label: 'Active', type: 'toggle', saveBehavior: 'push', value: item.active }
      ],
      onChange: (key, val) => {
        const oldValue = item[key];
        item[key] = val;
        ChangeTracker.stage('menu.item_updated', item, 'menu', 'Items', `Updated ${item.name} ${key}: ${oldValue} -> ${val}`);
        render();
      }
    }));
    mount.appendChild(box);
  }

  return {
    render: () => {
      loadData();
      return render();
    }
  };
}
