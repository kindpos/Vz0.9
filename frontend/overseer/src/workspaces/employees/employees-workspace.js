import { renderTabBar } from '../../components/tab-bar.js';
import { renderDataTable } from '../../components/data-table.js';
import { renderPropertyForm } from '../../components/property-form.js';
import { renderOverlay } from '../../components/overlay-dialog.js';
import { ApiClient } from '../../modules/api-client.js';
import { ChangeTracker } from '../../modules/change-tracker.js';

export function createEmployeesWorkspace() {
  let activeTab = 'roles';
  let roles = [];
  let employees = [];
  let tipoutRules = [];
  let container = null;

  async function loadData() {
    try {
      roles = await ApiClient.get('/config/roles');
      employees = await ApiClient.get('/config/employees');
      tipoutRules = await ApiClient.get('/config/tipout');
      render();
    } catch (e) {
      console.error('Failed to load employee data', e);
    }
  }

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    const tabs = [
      { id: 'roles', label: 'Roles & Permissions', hasPending: false },
      { id: 'mgmt', label: 'Employee Management', hasPending: false },
      { id: 'time', label: 'Time & Attendance', hasPending: false },
      { id: 'payroll', label: 'Payroll & Tips', hasPending: false },
      { id: 'shifts', label: 'Shift Configuration', hasPending: false },
      { id: 'tipout', label: 'Tipout Configuration', hasPending: ChangeTracker.hasPending('employees') }
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

    if (activeTab === 'roles') {
      renderRolesTab(contentArea);
    } else if (activeTab === 'mgmt') {
      renderEmployeeTab(contentArea);
    } else if (activeTab === 'tipout') {
      renderTipoutTab(contentArea);
    } else {
      contentArea.innerHTML = `<div class="group-box"><div class="group-box-label">${activeTab.toUpperCase()}</div><p style="color:#777">Reskin in progress...</p></div>`;
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderRolesTab(mount) {
    const groupBox = document.createElement('div');
    groupBox.className = 'group-box';
    groupBox.innerHTML = '<div class="group-box-label">ROLES</div>';

    const cols = [
      { key: 'name', label: 'Role Name' },
      { key: 'permission_level', label: 'Permission Level' },
      { key: 'tipout_eligible', label: 'Tipout Eligible', render: (v) => v ? 'YES' : 'NO' }
    ];

    groupBox.appendChild(renderDataTable({
      columns: cols,
      rows: roles.map(r => ({ ...r, id: r.role_id })),
      onEdit: (id) => showRoleOverlay(roles.find(r => r.role_id === id)),
      onDelete: async (id) => {
        try {
          await ApiClient.request(`/config/roles/${id}`, { method: 'DELETE' });
          loadData();
        } catch (e) {
          console.error(`Delete failed: ${e.message}`);
        }
      }
    }));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Add Role';
    addBtn.style.marginTop = '20px';
    addBtn.onclick = () => showRoleOverlay();
    groupBox.appendChild(addBtn);

    mount.appendChild(groupBox);
  }

  function showRoleOverlay(role = null) {
    const data = role ? JSON.parse(JSON.stringify(role)) : {
      role_id: `role_${Date.now()}`,
      name: '',
      permission_level: 'Standard',
      permissions: {
        can_void: false,
        can_discount: false,
        can_edit_time: false,
        can_close_day: false,
        manager_override: false,
        can_view_reports: false
      },
      tipout_eligible: true,
      can_receive_tips: true,
      can_be_tipped_out_to: true
    };

    const content = document.createElement('div');
    
    // Role Details
    const detailsBox = document.createElement('div');
    detailsBox.className = 'group-box';
    detailsBox.innerHTML = '<div class="group-box-label">ROLE DETAILS</div>';
    detailsBox.appendChild(renderPropertyForm({
      fields: [
        { key: 'name', label: 'Role Name', type: 'text', value: data.name },
        { key: 'permission_level', label: 'Permission Level', type: 'dropdown', value: data.permission_level, options: [
          { label: 'Standard', value: 'Standard' },
          { label: 'Elevated', value: 'Elevated' },
          { label: 'Manager', value: 'Manager' }
        ]}
      ],
      onChange: (key, val) => { data[key] = val; }
    }));
    content.appendChild(detailsBox);

    // Permissions
    const permBox = document.createElement('div');
    permBox.className = 'group-box';
    permBox.innerHTML = '<div class="group-box-label">DEFAULT PERMISSIONS</div>';
    permBox.appendChild(renderPropertyForm({
      fields: [
        { key: 'can_void', label: 'Can Void Items', type: 'toggle', value: data.permissions.can_void },
        { key: 'can_discount', label: 'Can Apply Discounts', type: 'toggle', value: data.permissions.can_discount },
        { key: 'can_edit_time', label: 'Can Edit Time Cards', type: 'toggle', value: data.permissions.can_edit_time },
        { key: 'can_close_day', label: 'Can Close Day', type: 'toggle', value: data.permissions.can_close_day },
        { key: 'manager_override', label: 'Manager Override', type: 'toggle', value: data.permissions.manager_override },
        { key: 'can_view_reports', label: 'Can View Reports', type: 'toggle', value: data.permissions.can_view_reports }
      ],
      onChange: (key, val) => { data.permissions[key] = val; }
    }));
    content.appendChild(permBox);

    // Tipout Participation
    const tipoutBox = document.createElement('div');
    tipoutBox.className = 'group-box';
    tipoutBox.innerHTML = '<div class="group-box-label">TIPOUT PARTICIPATION</div>';
    tipoutBox.appendChild(renderPropertyForm({
      fields: [
        { key: 'tipout_eligible', label: 'Participates in Tipout', type: 'toggle', value: data.tipout_eligible },
        { key: 'can_receive_tips', label: 'Can Receive Tips', type: 'toggle', value: data.can_receive_tips },
        { key: 'can_be_tipped_out_to', label: 'Can Be Tipped Out To', type: 'toggle', value: data.can_be_tipped_out_to }
      ],
      onChange: (key, val) => { data[key] = val; }
    }));
    content.appendChild(tipoutBox);

    renderOverlay({
      title: role ? 'EDIT ROLE' : 'ADD ROLE',
      content,
      actions: [
        { label: 'CANCEL', secondary: true, onClick: () => true },
        { label: 'SAVE ROLE', onClick: async () => {
          if (!data.name) {
            console.error('Role name is required');
            return false;
          }
          const method = role ? 'PUT' : 'POST';
          const url = role ? `/config/roles/${role.role_id}` : '/config/roles';
          try {
            await ApiClient.request(url, { method, body: data });
            loadData();
            return true;
          } catch (e) {
            console.error(`Save failed: ${e.message}`);
            return false;
          }
        }}
      ]
    });
  }

  function renderEmployeeTab(mount) {
    const groupBox = document.createElement('div');
    groupBox.className = 'group-box';
    groupBox.innerHTML = '<div class="group-box-label">EMPLOYEES</div>';

    const cols = [
      { key: 'display_name', label: 'Display Name' },
      { key: 'role_id', label: 'Role', render: (rid) => roles.find(r => r.role_id === rid)?.name || rid },
      { key: 'pin', label: 'PIN', render: () => '****' },
      { key: 'active', label: 'Status', render: (v) => v ? 'ACTIVE' : 'INACTIVE' }
    ];

    groupBox.appendChild(renderDataTable({
      columns: cols,
      rows: employees.map(e => ({ ...e, id: e.employee_id })),
      onEdit: (id) => showEmployeeOverlay(employees.find(e => e.employee_id === id)),
      onDelete: async (id) => {
        try {
          // Assuming DELETE endpoint exists or deactivate logic
          await ApiClient.request(`/config/employees/${id}`, { method: 'DELETE' });
          loadData();
        } catch (e) {
          console.error(`Delete failed: ${e.message}`);
        }
      }
    }));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Add Employee';
    addBtn.style.marginTop = '20px';
    addBtn.onclick = () => showEmployeeOverlay();
    groupBox.appendChild(addBtn);

    mount.appendChild(groupBox);
  }

  function showEmployeeOverlay(emp = null) {
    const data = emp ? JSON.parse(JSON.stringify(emp)) : {
      employee_id: `emp_${Date.now()}`,
      first_name: '',
      last_name: '',
      display_name: '',
      role_id: roles.length > 0 ? roles[0].role_id : 'server',
      pin: '',
      hourly_rate: 15.00,
      permissions_override: {
        can_void: false,
        can_discount: false,
        can_edit_time: false,
        can_close_day: false,
        manager_override: false
      },
      active: true,
      notes: ''
    };

    const content = document.createElement('div');

    // EMPLOYEE DETAILS
    const detailsBox = document.createElement('div');
    detailsBox.className = 'group-box';
    detailsBox.innerHTML = '<div class="group-box-label">EMPLOYEE DETAILS</div>';
    detailsBox.appendChild(renderPropertyForm({
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', value: data.first_name },
        { key: 'last_name', label: 'Last Name', type: 'text', value: data.last_name },
        { key: 'display_name', label: 'Display Name', type: 'text', value: data.display_name },
        {
          key: 'role_id', label: 'Role', type: 'dropdown', value: data.role_id,
          options: roles.length > 0 ? roles.map(r => ({ label: r.name, value: r.role_id })) : [
            { label: 'Server', value: 'server' },
            { label: 'Bartender', value: 'bartender' },
            { label: 'Manager', value: 'manager' },
            { label: 'Host', value: 'host' },
            { label: 'Kitchen', value: 'kitchen' },
            { label: 'Busser', value: 'busser' }
          ]
        },
        { key: 'pin', label: 'PIN (4-digit)', type: 'text', value: data.pin }, 
        { key: 'hourly_rate', label: 'Hourly Rate ($)', type: 'number', value: data.hourly_rate }
      ],
      onChange: (key, val) => { data[key] = val; }
    }));
    content.appendChild(detailsBox);

    // PERMISSIONS
    const permBox = document.createElement('div');
    permBox.className = 'group-box';
    permBox.innerHTML = '<div class="group-box-label">PERMISSIONS</div>';
    
    const roleDef = roles.find(r => r.role_id === data.role_id);
    const permFields = [
      { key: 'can_void', label: 'Can Void Items', type: 'toggle', value: data.permissions_override?.can_void ?? roleDef?.permissions?.can_void ?? false },
      { key: 'can_discount', label: 'Can Apply Discounts', type: 'toggle', value: data.permissions_override?.can_discount ?? roleDef?.permissions?.can_discount ?? false },
      { key: 'can_edit_time', label: 'Can Edit Time Cards', type: 'toggle', value: data.permissions_override?.can_edit_time ?? roleDef?.permissions?.can_edit_time ?? false },
      { key: 'can_close_day', label: 'Can Close Day', type: 'toggle', value: data.permissions_override?.can_close_day ?? roleDef?.permissions?.can_close_day ?? false },
      { key: 'manager_override', label: 'Manager Override', type: 'toggle', value: data.permissions_override?.manager_override ?? roleDef?.permissions?.manager_override ?? false }
    ];

    permBox.appendChild(renderPropertyForm({
      fields: permFields,
      onChange: (key, val) => { 
        if (!data.permissions_override) data.permissions_override = {};
        data.permissions_override[key] = val; 
      }
    }));
    content.appendChild(permBox);

    // STATUS
    const statusBox = document.createElement('div');
    statusBox.className = 'group-box';
    statusBox.innerHTML = '<div class="group-box-label">STATUS</div>';
    statusBox.appendChild(renderPropertyForm({
      fields: [
        { key: 'active', label: 'Active', type: 'toggle', value: data.active },
        { key: 'notes', label: 'Notes', type: 'text', value: data.notes }
      ],
      onChange: (key, val) => { data[key] = val; }
    }));
    content.appendChild(statusBox);

    renderOverlay({
      title: emp ? 'EDIT EMPLOYEE' : 'ADD EMPLOYEE',
      content,
      actions: [
        { label: 'CANCEL', secondary: true, onClick: () => true },
        {
          label: 'SAVE EMPLOYEE', onClick: async () => {
            if (!data.pin || data.pin.length !== 4) {
              console.error('PIN must be 4 digits');
              return false;
            }
            const method = emp ? 'PUT' : 'POST';
            const url = emp ? `/config/employees/${emp.employee_id}` : '/config/employees';
            try {
              await ApiClient.request(url, { method, body: data });
              loadData();
              return true;
            } catch (e) {
              console.error(`Save failed: ${e.message}`);
              return false;
            }
          }
        }
      ]
    });
  }

  function renderTipoutTab(mount) {
    const groupBox = document.createElement('div');
    groupBox.className = 'group-box';
    groupBox.innerHTML = '<div class="group-box-label">TIPOUT RULES</div>';

    const cols = [
      { key: 'role_from', label: 'Role From', render: (rid) => roles.find(r => r.role_id === rid)?.name || rid },
      { key: 'role_to', label: 'Role To', render: (rid) => roles.find(r => r.role_id === rid)?.name || rid },
      { key: 'percentage', label: 'Percentage', render: (v) => `${v}%` },
      { key: 'calculation_base', label: 'Calculation Base' }
    ];

    groupBox.appendChild(renderDataTable({
      columns: cols,
      rows: tipoutRules.map(r => ({ ...r, id: r.rule_id })),
      onEdit: (id) => console.log('Edit rule', id)
    }));

    mount.appendChild(groupBox);
  }

  return {
    render: () => {
      loadData();
      return render();
    }
  };
}
