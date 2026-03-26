export function renderDataTable(options = {}) {
  const {
    columns = [], // [{ key, label, width, sortable, render }]
    rows = [],
    onEdit = () => {},
    onDelete = () => {}
  } = options;

  const container = document.createElement('div');
  container.className = 'data-table-container';

  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = 'Search...';
  search.className = 'table-search';
  container.appendChild(search);

  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      ${columns.map(col => `<th style="width: ${col.width || 'auto'}">${col.label}</th>`).join('')}
      <th style="width: 80px"></th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const renderRows = (data) => {
    tbody.innerHTML = data.map(row => `
      <tr data-id="${row.id}">
        ${columns.map(col => `<td>${col.render ? col.render(row[col.key], row) : row[col.key]}</td>`).join('')}
        <td>
          <div class="row-actions">
            <button class="action-btn edit-btn" title="Edit">✏️</button>
            <button class="action-btn delete-btn delete" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

  tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        onEdit(btn.closest('tr').dataset.id);
      };
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        onDelete(btn.closest('tr').dataset.id);
      };
    });
  };

  renderRows(rows);
  table.appendChild(tbody);
  container.appendChild(table);

  search.oninput = () => {
    const term = search.value.toLowerCase();
    const filtered = rows.filter(row => 
      Object.values(row).some(val => String(val).toLowerCase().includes(term))
    );
    renderRows(filtered);
  };

  return container;
}
