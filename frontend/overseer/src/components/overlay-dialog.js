export function renderOverlay(options = {}) {
  const {
    title = "",
    content = null, // DOM element
    actions = [], // [{ label, onClick, secondary, destructive }]
    onClose = () => {}
  } = options;

  const backdrop = document.createElement('div');
  backdrop.className = 'overlay-backdrop';

  const panel = document.createElement('div');
  panel.className = 'overlay-panel';

  panel.innerHTML = `
    <div class="overlay-title-bar">
      <div class="title">${title}</div>
      <button class="overlay-close-btn">✕</button>
    </div>
    <div class="overlay-content"></div>
    <div class="overlay-footer"></div>
  `;

  if (content) {
    panel.querySelector('.overlay-content').appendChild(content);
  }

  const footer = panel.querySelector('.overlay-footer');
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = `btn ${action.secondary ? 'secondary' : ''} ${action.destructive ? 'destructive' : ''}`;
    btn.textContent = action.label;
    btn.onclick = () => {
      if (action.onClick() !== false) {
        close();
      }
    };
    footer.appendChild(btn);
  });

  const close = () => {
    document.body.removeChild(backdrop);
    onClose();
  };

  panel.querySelector('.overlay-close-btn').onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  // Focus trap could be added here
}
