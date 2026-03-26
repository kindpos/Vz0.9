const STORAGE_KEY = 'kindpos_overseer_pending_changes';

export const ChangeTracker = {
  state: {
    pending: {}
  },

  loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.state.pending = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored changes', e);
        this.state.pending = {};
      }
    }
  },

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.pending));
  },

  stage(eventType, payload, section, tab, description) {
    // Unique key: entity_id is extracted from payload if present
    const entityId = payload.id || payload.tax_rule_id || 'global';
    const key = `${eventType}:${entityId}`;

    this.state.pending[key] = {
      event_type: eventType,
      payload,
      section,
      tab,
      description,
      timestamp: new Date().toISOString()
    };

    this.saveToStorage();
    this.broadcastChange();
  },

  unstage(key) {
    delete this.state.pending[key];
    this.saveToStorage();
    this.broadcastChange();
  },

  getPending() {
    return Object.values(this.state.pending);
  },

  getPendingBySection(section) {
    return this.getPending().filter(c => c.section === section);
  },

  hasPending(section = null) {
    if (section) {
      return this.getPending().some(c => c.section === section);
    }
    return Object.keys(this.state.pending).length > 0;
  },

  getPendingCount() {
    return Object.keys(this.state.pending).length;
  },

  clear() {
    this.state.pending = {};
    localStorage.removeItem(STORAGE_KEY);
    this.broadcastChange();
  },

  broadcastChange() {
    window.dispatchEvent(new CustomEvent('overseer:changes-updated', {
      detail: {
        count: this.getPendingCount(),
        pending: this.state.pending
      }
    }));
  }
};

// Auto-load on module import
ChangeTracker.loadFromStorage();
