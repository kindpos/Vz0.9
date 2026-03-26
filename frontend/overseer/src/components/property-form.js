export function renderPropertyForm(options = {}) {
  const {
    fields = [], // [{ key, label, type, saveBehavior, value, options, validation }]
    onChange = () => {}
  } = options;

  const form = document.createElement('div');
  form.className = 'property-form';

  fields.forEach(field => {
    const group = document.createElement('div');
    group.className = 'property-form-row';
    group.dataset.key = field.key;

    const labelWrap = document.createElement('div');
    labelWrap.className = 'property-form-label';
    labelWrap.innerHTML = `
      ${field.label}
      <span class="save-status"></span>
      ${field.saveBehavior === 'push' ? '<span class="pending-indicator"></span>' : ''}
    `;
    group.appendChild(labelWrap);

    const inputWrap = document.createElement('div');
    inputWrap.className = 'property-form-input';

    let control;
    if (field.type === 'text' || field.type === 'number') {
      control = document.createElement('input');
      control.type = field.type;
      control.value = field.value || '';
      control.onblur = () => handleSave(field, control.value, group);
    } else if (field.type === 'toggle') {
      control = document.createElement('div');
      control.className = `btn ${field.value ? 'pressed' : 'raised'}`;
      control.innerText = field.value ? 'ON' : 'OFF';
      control.onclick = () => {
        const newValue = !control.classList.contains('pressed');
        control.classList.toggle('pressed');
        control.classList.toggle('raised');
        control.innerText = newValue ? 'ON' : 'OFF';
        handleSave(field, newValue, group);
      };
    } else if (field.type === 'dropdown') {
      control = document.createElement('select');
      (field.options || []).forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === field.value) option.selected = true;
        control.appendChild(option);
      });
      control.onchange = () => handleSave(field, control.value, group);
    }

    if (control) {
      inputWrap.appendChild(control);
      group.appendChild(inputWrap);
      form.appendChild(group);
    }
  });

  async function handleSave(field, value, group) {
    if (field.saveBehavior === 'auto') {
      const status = group.querySelector('.save-status');
      if (status) {
        status.className = 'save-status saving';
        try {
          // The actual API call is handled by the onChange callback in the workspace
          await onChange(field.key, value);
          status.className = 'save-status success';
          setTimeout(() => { status.className = 'save-status'; }, 1000);
        } catch (e) {
          console.error(`Failed to auto-save ${field.key}`, e);
          status.className = 'save-status error';
          // Keep error visible longer or until next change
        }
      }
    } else {
      onChange(field.key, value);
    }
  }

  return form;
}
