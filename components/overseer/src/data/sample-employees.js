/* ============================================
   KINDpos Overseer - Sample Employee Data
   Based on "The Honeycomb Bistro" demo restaurant

   This module will be replaced with live API
   fetch() calls when the backend is connected.

   Endpoints this replaces:
     GET  /api/v1/servers          → employee list
     GET  /api/v1/servers/{id}     → individual record
     GET  /api/v1/shifts/active    → currently clocked in
     GET  /api/v1/shifts           → time cards
     GET  /api/v1/payroll          → payroll summary
     GET  /api/v1/config/tip-pooling → tip pool config
     GET  /api/v1/shifts/templates → shift templates
     GET  /api/v1/shifts/swaps     → swap requests
   ============================================ */

// ── Employee Records ──────────────────────────
export const EMPLOYEES = [
    {
        id: 'emp_tyler_001',
        firstName: 'Tyler',
        lastName: 'Johnson',
        role: 'manager',
        pinHash: '••••',
        payRate: 22.00,
        isTipped: false,
        hireDate: '2022-05-12',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'General Manager. Opens most days.',
    },
    {
        id: 'emp_maria_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'server',
        pinHash: '••••',
        payRate: 15.00,
        isTipped: true,
        hireDate: '2024-01-15',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'Experienced server, previously at Olive Garden. Top seller.',
    },
    {
        id: 'emp_james_001',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'bartender',
        pinHash: '••••',
        payRate: 16.50,
        isTipped: true,
        hireDate: '2023-03-22',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'Craft cocktail specialist. Handles bar inventory.',
    },
    {
        id: 'emp_sofia_001',
        firstName: 'Sofia',
        lastName: 'Martinez',
        role: 'server',
        pinHash: '••••',
        payRate: 15.00,
        isTipped: true,
        hireDate: '2025-11-08',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'New hire. Training with Maria.',
    },
    {
        id: 'emp_alex_001',
        firstName: 'Alex',
        lastName: 'Chen',
        role: 'host',
        pinHash: '••••',
        payRate: 14.00,
        isTipped: true,
        hireDate: '2025-09-30',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'Part-time. College student — flexible availability.',
    },
    {
        id: 'emp_devon_001',
        firstName: 'Devon',
        lastName: 'Brooks',
        role: 'busser',
        pinHash: '••••',
        payRate: 13.00,
        isTipped: true,
        hireDate: '2025-06-14',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'Fast worker. Covers host shifts when needed.',
    },
    {
        id: 'emp_rachel_001',
        firstName: 'Rachel',
        lastName: 'Kim',
        role: 'server',
        pinHash: '••••',
        payRate: 15.50,
        isTipped: true,
        hireDate: '2024-07-20',
        status: 'active',
        termDate: null,
        termReason: null,
        notes: 'Strong upseller. Wine knowledge.',
    },
    // ── Inactive Employees ────────────────────
    {
        id: 'emp_marcus_001',
        firstName: 'Marcus',
        lastName: 'Rivera',
        role: 'server',
        pinHash: '••••',
        payRate: 15.00,
        isTipped: true,
        hireDate: '2023-08-10',
        status: 'inactive',
        termDate: '2025-12-15',
        termReason: 'Voluntary resignation — relocated to another city',
        notes: 'Good employee. Eligible for rehire.',
    },
    {
        id: 'emp_ashley_001',
        firstName: 'Ashley',
        lastName: 'Torres',
        role: 'bartender',
        pinHash: '••••',
        payRate: 16.00,
        isTipped: true,
        hireDate: '2024-02-01',
        status: 'do_not_rehire',
        termDate: '2025-10-03',
        termReason: 'No-call no-show three consecutive shifts',
        notes: 'DNR — documented attendance violations.',
    },
];

// ── Role Definitions ──────────────────────────
export const ROLES = [
    { id: 'server',    label: 'Server' },
    { id: 'bartender', label: 'Bartender' },
    { id: 'host',      label: 'Host' },
    { id: 'busser',    label: 'Busser' },
    { id: 'manager',   label: 'Manager' },
    { id: 'admin',     label: 'Admin' },
];

// ── Status Definitions ────────────────────────
export const STATUSES = [
    { id: 'active',         label: 'Active',        color: '#00FF00' },
    { id: 'inactive',       label: 'Inactive',      color: '#888888' },
    { id: 'do_not_rehire',  label: 'Do Not Rehire', color: '#FF3333' },
];

// ── Helper: Get role label ────────────────────
export function getRoleLabel(roleId) {
    const role = ROLES.find(r => r.id === roleId);
    return role ? role.label : roleId;
}

// ── Helper: Get status info ───────────────────
export function getStatusInfo(statusId) {
    const status = STATUSES.find(s => s.id === statusId);
    return status || { id: statusId, label: statusId, color: '#888888' };
}

// ── Helper: Format date for display ───────────
export function fmtDate(isoDate) {
    if (!isoDate) return '—';
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
    });
}

// ── Helper: Generate random 4-digit PIN ───────
export function generatePIN() {
    return String(Math.floor(1000 + Math.random() * 9000));
}

// ── Helper: Generate employee ID ──────────────
export function generateEmployeeId(firstName) {
    const ts = Date.now().toString(36);
    return `emp_${firstName.toLowerCase()}_${ts}`;
}