export function renderInfoDrawer(options = {}) {
  const {
    alerts = [], // [{ id, type, message, timestamp, action }]
    onClose = () => {}
  } = options;

  const backdrop = document.createElement('div');
  backdrop.className = 'info-drawer-backdrop';
  
  const drawer = document.createElement('div');
  drawer.className = 'info-drawer';

  drawer.innerHTML = `
    <div class="info-drawer-header">
      <div class="title">SYSTEM ALERTS</div>
      <button class="close-x">✕</button>
    </div>
    <div class="info-drawer-content">
      ${alerts.length === 0 ? `
        <div class="alert-empty">
          <div class="icon">✅</div>
          <div>All systems operational</div>
        </div>
      ` : alerts.map(alert => `
        <div class="alert-item ${alert.type}">
          <div class="alert-header">
            <span>${alert.type.toUpperCase()}</span>
            <button class="dismiss-alert" data-id="${alert.id}">✕</button>
          </div>
          <div class="alert-msg">${alert.message}</div>
          <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
        </div>
      `).join('')}
    </div>
  `;

  const close = () => {
    drawer.classList.remove('open');
    setTimeout(() => {
      if (document.body.contains(backdrop)) {
        document.body.removeChild(backdrop);
      }
      onClose();
    }, 300);
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };
  drawer.querySelector('.close-x').onclick = close;

  backdrop.appendChild(drawer);
  document.body.appendChild(backdrop);
  
  // Force reflow and then add open class for slide-in
  drawer.offsetHeight;
  drawer.classList.add('open');
}
