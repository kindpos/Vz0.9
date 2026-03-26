import { renderTabBar } from '../../components/tab-bar.js';
import { renderDataTable } from '../../components/data-table.js';
import { ApiClient } from '../../modules/api-client.js';

export function createReportingWorkspace() {
  let activeTab = 'dashboard';
  let container = null;

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    const tabs = [
      { id: 'dashboard', label: 'Dashboard', hasPending: false },
      { id: 'reports', label: 'Reports', hasPending: false },
      { id: 'bookkeeper', label: 'Bookkeeper Export', hasPending: false }
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

    if (activeTab === 'dashboard') {
      renderDashboard(contentArea);
    } else if (activeTab === 'reports') {
      renderReportsTab(contentArea);
    } else {
      contentArea.innerHTML = `<div class="group-box"><div class="group-box-label">${activeTab.toUpperCase()}</div><p style="color:#777">Build in progress...</p></div>`;
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderDashboard(mount) {
    const kpiRow = document.createElement('div');
    kpiRow.style.display = 'grid';
    kpiRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    kpiRow.style.gap = '15px';
    kpiRow.style.marginBottom = '30px';

    const kpis = [
      { label: 'NET SALES', value: '$4,250.50', color: 'var(--accent-yellow)' },
      { label: 'CHECKS', value: '142', color: 'var(--accent-mint)' },
      { label: 'AVG CHECK', value: '$29.93', color: 'var(--accent-mint)' },
      { label: 'LABOR %', value: '18.4%', color: 'var(--accent-orange)' }
    ];

    kpis.forEach(kpi => {
      const card = document.createElement('div');
      card.className = 'group-box raised';
      card.style.textAlign = 'center';
      card.innerHTML = `
        <div class="group-box-label">${kpi.label}</div>
        <div style="font-size: 24px; color: ${kpi.color}; font-family: 'Alien Encounters Solid Bold'">${kpi.value}</div>
      `;
      kpiRow.appendChild(card);
    });

    mount.appendChild(kpiRow);

    const mainGrid = document.createElement('div');
    mainGrid.style.display = 'grid';
    mainGrid.style.gridTemplateColumns = '1fr 1fr';
    mainGrid.style.gap = '20px';

    const charts = ['SALES BY HOUR', 'PAYMENT BREAKDOWN'];
    charts.forEach(title => {
      const box = document.createElement('div');
      box.className = 'group-box sunken';
      box.style.minHeight = '200px';
      box.innerHTML = `<div class="group-box-label">${title}</div><div style="display:flex; align-items:center; justify-content:center; height:100%; color:#555">[ CHART PLACEHOLDER ]</div>`;
      mainGrid.appendChild(box);
    });

    mount.appendChild(mainGrid);
  }

  function renderReportsTab(mount) {
    const builder = document.createElement('div');
    builder.className = 'group-box';
    builder.innerHTML = '<div class="group-box-label">BUILD A REPORT</div>';
    
    const sentence = document.createElement('div');
    sentence.style.fontSize = '20px';
    sentence.style.lineHeight = '2';
    sentence.innerHTML = `
      Show me <span class="mint-text">[Revenue]</span> 
      grouped by <span class="mint-text">[Category]</span> 
      filtered to <span class="mint-text">[This Week]</span>
      sorted by <span class="mint-text">[Highest First]</span>
    `;
    builder.appendChild(sentence);

    const runBtn = document.createElement('button');
    runBtn.className = 'btn raised';
    runBtn.textContent = 'RUN REPORT';
    runBtn.style.marginTop = '20px';
    builder.appendChild(runBtn);

    mount.appendChild(builder);
  }

  return {
    render: () => render()
  };
}
