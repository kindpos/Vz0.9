import { renderTabBar } from '../../components/tab-bar.js';
import { renderPropertyForm } from '../../components/property-form.js';
import { renderDataTable } from '../../components/data-table.js';
import { renderEmptyState } from '../../components/empty-state.js';
import { ChangeTracker } from '../../modules/change-tracker.js';
import { ApiClient } from '../../modules/api-client.js';
import { renderReceiptPreview } from './receipt-preview.js';

export function createStoreWorkspace() {
  let activeTab = 'info';
  let config = null;
  let container = null;

  async function loadConfig() {
    try {
      config = await ApiClient.get('/config/store');
      render();
    } catch (e) {
      console.error('Failed to load store config', e);
    }
  }

  function render() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'workspace-content';
    }
    container.innerHTML = '';

    if (!config) {
      container.appendChild(renderEmptyState({
        icon: '🏪',
        message: 'Loading store configuration...',
        ctas: []
      }));
      return container;
    }

    const tabs = [
      { id: 'info', label: 'Restaurant Info', hasPending: false },
      { id: 'tax', label: 'Tax & Fees', hasPending: ChangeTracker.hasPending('store') },
      { id: 'ops', label: 'Operations', hasPending: ChangeTracker.hasPending('store') }
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

    if (activeTab === 'info') {
      renderInfoTab(contentArea);
    } else if (activeTab === 'tax') {
      renderTaxTab(contentArea);
    } else if (activeTab === 'ops') {
      renderOpsTab(contentArea);
    }

    container.appendChild(contentArea);
    return container;
  }

  function renderInfoTab(mount) {
    const layout = document.createElement('div');
    layout.style.display = 'flex';
    layout.style.alignItems = 'flex-start';

    const groupBox = document.createElement('div');
    groupBox.className = 'group-box';
    groupBox.style.flex = '1';
    groupBox.innerHTML = '<div class="group-box-label">RESTAURANT DETAILS</div>';

    const formFields = [
      { key: 'restaurant_name', label: 'Restaurant Name', type: 'text', saveBehavior: 'auto', value: config.info.restaurant_name },
      { key: 'legal_entity_name', label: 'Legal Entity Name', type: 'text', saveBehavior: 'auto', value: config.info.legal_entity_name },
      { key: 'address_line_1', label: 'Address Line 1', type: 'text', saveBehavior: 'auto', value: config.info.address_line_1 },
      { key: 'address_line_2', label: 'Address Line 2', type: 'text', saveBehavior: 'auto', value: config.info.address_line_2 },
      { key: 'city', label: 'City', type: 'text', saveBehavior: 'auto', value: config.info.city },
      { key: 'state', label: 'State', type: 'text', saveBehavior: 'auto', value: config.info.state },
      { key: 'zip', label: 'ZIP', type: 'text', saveBehavior: 'auto', value: config.info.zip },
      { key: 'phone', label: 'Phone', type: 'text', saveBehavior: 'auto', value: config.info.phone },
      { key: 'email', label: 'Email', type: 'text', saveBehavior: 'auto', value: config.info.email },
      { key: 'website', label: 'Website', type: 'text', saveBehavior: 'auto', value: config.info.website }
    ];

    const preview = renderReceiptPreview(config.info);
    
    const form = renderPropertyForm({
      fields: formFields,
      onChange: async (key, value) => {
        config.info[key] = value;
        preview.update(config.info);
        // Auto-save call
        await ApiClient.post('/config/store/info', config.info);
      }
    });

    groupBox.appendChild(form);
    layout.appendChild(groupBox);
    layout.appendChild(preview);
    mount.appendChild(layout);
  }

  function renderTaxTab(mount) {
    const taxGroup = document.createElement('div');
    taxGroup.className = 'group-box';
    taxGroup.innerHTML = '<div class="group-box-label">TAX RULES</div>';

    const tableCols = [
      { key: 'name', label: 'Name' },
      { key: 'rate_percent', label: 'Rate %', render: (val) => `${val.toFixed(3)}%` },
      { key: 'applies_to', label: 'Applies To' },
      { key: 'category_id', label: 'Category' }
    ];

    const table = renderDataTable({
      columns: tableCols,
      rows: config.tax_rules,
      onEdit: (id) => console.log(`Edit tax ${id}`),
      onDelete: (id) => console.log(`Delete tax ${id}`)
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ Add Tax Rule';
    addBtn.style.marginTop = '20px';
    addBtn.onclick = () => console.log('Add tax rule overlay placeholder');

    taxGroup.appendChild(table);
    taxGroup.appendChild(addBtn);
    mount.appendChild(taxGroup);

    // CC Rate section
    const ccGroup = document.createElement('div');
    ccGroup.className = 'group-box';
    ccGroup.style.marginTop = '30px';
    ccGroup.innerHTML = '<div class="group-box-label">PROCESSING FEES</div>';

    const ccForm = renderPropertyForm({
      fields: [
        { key: 'rate_percent', label: 'Processing Rate (%)', type: 'number', saveBehavior: 'auto', value: config.cc_processing.rate_percent },
        { key: 'per_transaction_fee', label: 'Per-Transaction Fee ($)', type: 'number', saveBehavior: 'auto', value: config.cc_processing.per_transaction_fee }
      ],
      onChange: (key, value) => {
        config.cc_processing[key] = parseFloat(value);
        ApiClient.post('/config/store/cc-rate', config.cc_processing).catch(console.error);
      }
    });
    ccGroup.appendChild(ccForm);
    mount.appendChild(ccGroup);
  }

  function renderOpsTab(mount) {
    // Operating Hours group
    const hoursGroup = document.createElement('div');
    hoursGroup.className = 'group-box';
    hoursGroup.innerHTML = '<div class="group-box-label">OPERATING HOURS</div>';
    const hoursPlaceholder = document.createElement('p');
    hoursPlaceholder.textContent = 'Operating hours configuration placeholder...';
    hoursPlaceholder.style.color = '#777';
    hoursGroup.appendChild(hoursPlaceholder);
    mount.appendChild(hoursGroup);

    // Order Types group
    const typesGroup = document.createElement('div');
    typesGroup.className = 'group-box';
    typesGroup.style.marginTop = '30px';
    typesGroup.innerHTML = '<div class="group-box-label">ORDER TYPES</div>';
    const typesPlaceholder = document.createElement('p');
    typesPlaceholder.textContent = 'Order types configuration placeholder...';
    typesPlaceholder.style.color = '#777';
    typesGroup.appendChild(typesPlaceholder);
    mount.appendChild(typesGroup);

    // Auto-Gratuity group
    const gratGroup = document.createElement('div');
    gratGroup.className = 'group-box';
    gratGroup.style.marginTop = '30px';
    gratGroup.innerHTML = '<div class="group-box-label">AUTO-GRATUITY</div>';

    const opsForm = renderPropertyForm({
      fields: [
        { key: 'enabled', label: 'Enable Auto-Gratuity', type: 'toggle', saveBehavior: 'push', value: config.auto_gratuity.enabled },
        { key: 'party_size_threshold', label: 'Party Size Threshold', type: 'number', saveBehavior: 'push', value: config.auto_gratuity.party_size_threshold },
        { key: 'rate_percent', label: 'Auto-Gratuity Rate (%)', type: 'number', saveBehavior: 'push', value: config.auto_gratuity.rate_percent }
      ],
      onChange: (key, value) => {
        const oldValue = config.auto_gratuity[key];
        config.auto_gratuity[key] = value;
        ChangeTracker.stage(
          'store.auto_gratuity_updated',
          config.auto_gratuity,
          'store',
          'Operations',
          `Updated ${key}: ${oldValue} -> ${value}`
        );
        render(); // Update tab indicators
      }
    });
    gratGroup.appendChild(opsForm);
    mount.appendChild(gratGroup);
  }

  return {
    render: () => {
      if (!config) loadConfig();
      return render();
    },
    onEnter: () => console.log('Entered Store workspace'),
    onExit: () => console.log('Exited Store workspace')
  };
}
