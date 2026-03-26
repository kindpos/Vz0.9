export function renderEmptyState(options = {}) {
  const {
    icon = "✨",
    message = "Welcome to KINDpos.",
    ctas = [] // { label, onClick, secondary }
  } = options;

  const container = document.createElement('div');
  container.className = 'empty-state';
  container.innerHTML = `
    <div class="icon">${icon}</div>
    <div class="message">${message}</div>
    <div class="cta-container">
      ${ctas.map((cta, i) => `
        <button class="cta-btn ${cta.secondary ? 'secondary' : ''}" data-index="${i}">
          ${cta.label}
        </button>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.cta-btn').forEach(btn => {
    btn.onclick = () => {
      const index = btn.dataset.index;
      if (ctas[index] && ctas[index].onClick) {
        ctas[index].onClick();
      }
    };
  });

  return container;
}
