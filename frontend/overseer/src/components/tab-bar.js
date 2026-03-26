export function renderTabBar(options = {}) {
  const {
    tabs = [], // [{ id, label, hasPending }]
    activeId,
    onSelect = () => {}
  } = options;

  const bar = document.createElement('div');
  bar.className = 'tabs-header';
  bar.innerHTML = tabs.map(tab => `
    <div class="tab ${tab.id === activeId ? 'active' : ''}" data-id="${tab.id}">
      ${tab.label}
      ${tab.hasPending ? '<span class="pending-dot"></span>' : ''}
    </div>
  `).join('');

  bar.querySelectorAll('.tab').forEach(el => {
    el.onclick = () => onSelect(el.dataset.id);
  });

  return bar;
}
