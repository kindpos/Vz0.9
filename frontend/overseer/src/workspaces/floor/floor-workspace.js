import { renderTabBar } from '../../components/tab-bar.js';
import { renderDataTable } from '../../components/data-table.js';
import { renderPropertyForm } from '../../components/property-form.js';
import { renderOverlay } from '../../components/overlay-dialog.js';
import { ApiClient } from '../../modules/api-client.js';
import { ChangeTracker } from '../../modules/change-tracker.js';

export function createFloorPlanWorkspace() {
  let activeTab = 'layout';
  let sections = [];
  let layout = { canvas: { width: 1200, height: 800 }, tables: [], structures: [], fixtures: [] };
  let container = null;
  let selectedElement = null;

  async function loadData() {
    try {
      sections = await ApiClient.get('/config/floorplan/sections');
      layout = await ApiClient.get('/config/floorplan');
      render();
    } catch (e) {
      console.error('Failed to load floor plan data', e);
    }
  }

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    const tabs = [
      { id: 'layout', label: 'Table Layout', hasPending: ChangeTracker.hasPending('floor_plan') },
      { id: 'sections', label: 'Sections', hasPending: ChangeTracker.hasPending('floor_plan') }
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
    contentArea.style.height = 'calc(100vh - 100px)';

    if (activeTab === 'layout') {
      renderLayoutTab(contentArea);
    } else {
      renderSectionsTab(contentArea);
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderSectionsTab(mount) {
    const box = document.createElement('div');
    box.className = 'group-box';
    box.innerHTML = '<div class="group-box-label">DINING SECTIONS</div>';
    
    box.appendChild(renderDataTable({
      columns: [
        { key: 'name', label: 'Section Name' },
        { key: 'color', label: 'Color', render: (v) => `<div style="width:20px; height:20px; background:${v}; border:1px solid #555"></div>` },
        { key: 'active', label: 'Status', render: (v) => v ? 'ACTIVE' : 'INACTIVE' }
      ],
      rows: sections.map(s => ({ ...s, id: s.section_id })),
      onEdit: (id) => console.log(`Edit section ${id}`)
    }));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Add Section';
    addBtn.style.marginTop = '20px';
    box.appendChild(addBtn);
    
    mount.appendChild(box);
  }

  function renderLayoutTab(mount) {
    const layoutWrapper = document.createElement('div');
    layoutWrapper.style.display = 'flex';
    layoutWrapper.style.height = '100%';
    layoutWrapper.style.gap = '20px';

    // Toolbox (Left)
    const toolbox = document.createElement('div');
    toolbox.className = 'group-box sunken';
    toolbox.style.width = '200px';
    toolbox.innerHTML = '<div class="group-box-label">TOOLBOX</div>';
    toolbox.innerHTML += `
      <div style="padding:10px; display:flex; flex-direction:column; gap:10px">
        <div class="btn raised" draggable="true" data-type="table" data-shape="rect">Rect Table</div>
        <div class="btn raised" draggable="true" data-type="table" data-shape="circle">Round Table</div>
        <div class="btn raised" draggable="true" data-type="structure" data-shape="wall">Wall</div>
        <div class="btn raised" draggable="true" data-type="fixture" data-shape="pos">POS Station</div>
      </div>
    `;
    layoutWrapper.appendChild(toolbox);

    // Canvas (Center)
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'group-box sunken';
    canvasContainer.style.flex = '1';
    canvasContainer.style.position = 'relative';
    canvasContainer.style.overflow = 'hidden';
    canvasContainer.style.background = '#222 url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAH0lEQVQ4T2M8f/78fwYKAOOoG0YNo24YNYy6YdQw6AAAr7Y99f/ghbwAAAAASUVORK5CYII=") repeat';
    canvasContainer.innerHTML = '<div class="group-box-label">CANVAS</div>';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cursor = 'crosshair';
    
    // Render existing tables
    layout.tables.forEach(t => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", t.x);
      rect.setAttribute("y", t.y);
      rect.setAttribute("width", t.width);
      rect.setAttribute("height", t.height);
      rect.setAttribute("fill", "#333");
      rect.setAttribute("stroke", "#C6FFBB");
      rect.setAttribute("stroke-width", "2");
      rect.onclick = () => { selectedElement = t; render(); };
      svg.appendChild(rect);
    });

    canvasContainer.appendChild(svg);
    layoutWrapper.appendChild(canvasContainer);

    // Details (Right)
    const details = document.createElement('div');
    details.className = 'group-box';
    details.style.width = '250px';
    details.innerHTML = '<div class="group-box-label">DETAILS</div>';
    if (selectedElement) {
      details.appendChild(renderPropertyForm({
        fields: [
          { key: 'name', label: 'Label', type: 'text', value: selectedElement.name },
          { key: 'seats', label: 'Seats', type: 'number', value: selectedElement.seats }
        ],
        onChange: (k, v) => { selectedElement[k] = v; render(); }
      }));
    } else {
      details.innerHTML += '<p style="color:#777; padding:10px">Select an element</p>';
    }
    layoutWrapper.appendChild(details);

    mount.appendChild(layoutWrapper);
  }

  return {
    render: () => {
      loadData();
      return render();
    }
  };
}
