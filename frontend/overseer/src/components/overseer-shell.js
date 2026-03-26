export function renderShell() {
  const shell = document.createElement('div');
  shell.className = 'overseer-shell';
  shell.innerHTML = `
    <aside id="sidebar-mount"></aside>
    <main id="workspace-mount"></main>
    <div class="mobile-warning">
      KINDpos Overseer is designed for desktop and tablet. Please use a larger screen.
    </div>
  `;
  return shell;
}

export function initTheme(isTrainingMode) {
  if (isTrainingMode) {
    document.body.classList.add('training-mode');
  } else {
    document.body.classList.remove('training-mode');
  }
}
