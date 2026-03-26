export function renderSidebar(options = {}) {
  const { 
    storeName = "KINDpos", 
    activeId = "store", 
    pendingSections = [], 
    onNavClick = () => {},
    onInfoClick = () => {},
    onPushClick = () => {},
    pushCount = 0,
    infoStatus = "green" // green, yellow, red
  } = options;

  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar-nav';

  const navItems = [
    { id: 'store', label: 'Store', icon: '🏪' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'menu', label: 'Menu', icon: '📜' },
    { id: 'floor', label: 'Floor Plan', icon: '🗺️' },
    { id: 'hardware', label: 'Hardware', icon: '📟' },
    { id: 'reporting', label: 'Reporting', icon: '📊' }
  ];

  sidebar.innerHTML = `
    <div class="sidebar-header" style="display: flex; flex-direction: row; align-items: center; gap: 8px; padding: 12px 16px;">
      <img src="assets/images/palm.jpg" class="palm-logo" height="32" style="height: 32px; width: auto; max-height: 32px; object-fit: contain; flex-shrink: 0;" alt="🌴">
      <span class="overseer-text" style="white-space: nowrap;">OVERSEER</span>
    </div>
    <div class="nav-items">
      ${navItems.map(item => `
        <div class="sidebar-nav-item ${item.id === activeId ? 'active' : ''} ${pendingSections.includes(item.id) ? 'pending' : ''}" data-id="${item.id}">
          <span class="icon">${item.icon}</span>
          <span class="label">${item.label}</span>
        </div>
      `).join('')}
    </div>
    <div class="sidebar-divider"></div>
    <div class="sidebar-footer">
      <button class="footer-btn info-btn ${infoStatus} raised" title="Notifications">
        <span class="dot"></span>
        <span class="label">INFO</span>
      </button>
      <button class="footer-btn push-btn ${pushCount > 0 ? 'pending' : ''} raised" title="Push Changes" ${pushCount === 0 ? 'disabled' : ''}>
        <span class="icon">🚀</span>
        <span class="label">PUSH</span>
        ${pushCount > 0 ? `<span class="badge">${pushCount}</span>` : ''}
      </button>
    </div>
  `;

  // Event Listeners
  sidebar.querySelectorAll('.sidebar-nav-item').forEach(el => {
    el.onclick = () => onNavClick(el.dataset.id);
  });

  sidebar.querySelector('.info-btn').onclick = onInfoClick;
  sidebar.querySelector('.push-btn').onclick = onPushClick;

  return sidebar;
}
