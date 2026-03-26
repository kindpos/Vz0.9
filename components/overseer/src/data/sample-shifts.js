/* ============================================
   KINDpos Overseer - Sample Shift Config Data
   Based on "The Honeycomb Bistro" demo restaurant

   This module will be replaced with live API
   fetch() calls when the backend is connected.

   Endpoints this replaces:
     GET  /api/v1/shifts/templates     → shift templates
     GET  /api/v1/shifts/schedule      → daily/weekly schedule
     GET  /api/v1/shifts/swaps         → swap requests
     POST /api/v1/shifts/swaps/approve → approve swap
     POST /api/v1/shifts/swaps/deny    → deny swap
   ============================================ */

/* ------------------------------------------
   HELPERS
------------------------------------------ */
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

function today() {
    return new Date().toISOString().split('T')[0];
}

/* ------------------------------------------
   SHIFT TEMPLATES (reusable patterns)
------------------------------------------ */
export const SHIFT_TEMPLATES = [
    {
        id: 'tmpl_morning',
        name: 'Morning Open',
        startTime: '07:00',
        endTime: '15:30',
        duration: 8.5,
        roles: ['manager'],
        color: '#FBDE42',
        description: 'Opening manager shift — prep, setup, morning service',
    },
    {
        id: 'tmpl_lunch',
        name: 'Lunch Service',
        startTime: '10:30',
        endTime: '17:00',
        duration: 6.5,
        roles: ['server', 'host', 'busser'],
        color: '#C6FFBB',
        description: 'Core lunch service — 11am rush through afternoon',
    },
    {
        id: 'tmpl_dinner',
        name: 'Dinner Service',
        startTime: '15:30',
        endTime: '23:00',
        duration: 7.5,
        roles: ['server', 'bartender', 'host', 'busser'],
        color: '#64B5F6',
        description: 'Dinner service — handoff from lunch through close',
    },
    {
        id: 'tmpl_bar_close',
        name: 'Bar Close',
        startTime: '17:00',
        endTime: '01:00',
        duration: 8.0,
        roles: ['bartender'],
        color: '#CE93D8',
        description: 'Full bar shift — happy hour through last call',
    },
    {
        id: 'tmpl_double',
        name: 'Double',
        startTime: '10:30',
        endTime: '23:00',
        duration: 12.5,
        roles: ['server', 'bartender'],
        color: '#FF8A65',
        description: 'Double shift — lunch through dinner close (2 breaks required)',
    },
    {
        id: 'tmpl_busser_pm',
        name: 'PM Busser',
        startTime: '16:00',
        endTime: '22:00',
        duration: 6.0,
        roles: ['busser'],
        color: '#4DB6AC',
        description: 'Evening bussing shift — dinner service support',
    },
];

/* ------------------------------------------
   TODAY'S SCHEDULE (Gantt-style data)
   Maps employees → their assigned shifts for today
------------------------------------------ */
export const TODAYS_SCHEDULE = [
    {
        employee_id: 'emp_tyler_001',
        firstName: 'Tyler',
        lastName: 'Johnson',
        role: 'manager',
        template_id: 'tmpl_morning',
        scheduledStart: '07:00',
        scheduledEnd: '15:30',
        actualStart: '07:45',
        actualEnd: null,      // still working
        status: 'active',     // active | upcoming | completed | no-show | called-out
        color: '#FBDE42',
    },
    {
        employee_id: 'emp_maria_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'server',
        template_id: 'tmpl_lunch',
        scheduledStart: '10:30',
        scheduledEnd: '17:00',
        actualStart: '10:55',
        actualEnd: null,
        status: 'active',
        color: '#C6FFBB',
    },
    {
        employee_id: 'emp_james_001',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'bartender',
        template_id: 'tmpl_bar_close',
        scheduledStart: '17:00',
        scheduledEnd: '01:00',
        actualStart: '11:00',  // came in early
        actualEnd: null,
        status: 'active',
        color: '#CE93D8',
    },
    {
        employee_id: 'emp_sofia_001',
        firstName: 'Sofia',
        lastName: 'Martinez',
        role: 'server',
        template_id: 'tmpl_dinner',
        scheduledStart: '15:30',
        scheduledEnd: '23:00',
        actualStart: '15:30',
        actualEnd: null,
        status: 'active',
        color: '#64B5F6',
    },
    {
        employee_id: 'emp_alex_001',
        firstName: 'Alex',
        lastName: 'Chen',
        role: 'host',
        template_id: 'tmpl_dinner',
        scheduledStart: '15:30',
        scheduledEnd: '21:00',
        actualStart: null,
        actualEnd: null,
        status: 'upcoming',
        color: '#64B5F6',
    },
    {
        employee_id: 'emp_devon_001',
        firstName: 'Devon',
        lastName: 'Brooks',
        role: 'busser',
        template_id: 'tmpl_busser_pm',
        scheduledStart: '16:00',
        scheduledEnd: '22:00',
        actualStart: '16:00',
        actualEnd: null,
        status: 'active',
        color: '#4DB6AC',
    },
    {
        employee_id: 'emp_rachel_001',
        firstName: 'Rachel',
        lastName: 'Kim',
        role: 'server',
        template_id: 'tmpl_dinner',
        scheduledStart: '15:30',
        scheduledEnd: '23:00',
        actualStart: null,
        actualEnd: null,
        status: 'upcoming',
        color: '#64B5F6',
    },
];

/* ------------------------------------------
   SWAP REQUESTS
   Pending, approved, denied
------------------------------------------ */
export const SWAP_REQUESTS = [
    {
        id: 'swap_001',
        requestedBy: { id: 'emp_sofia_001', name: 'Sofia Martinez' },
        swapWith:    { id: 'emp_rachel_001', name: 'Rachel Kim' },
        originalShift: { date: daysFromNow(2), start: '15:30', end: '23:00', template: 'Dinner Service' },
        swapShift:     { date: daysFromNow(2), start: '10:30', end: '17:00', template: 'Lunch Service' },
        reason: 'Have a dentist appointment that afternoon',
        status: 'pending',
        requestedAt: `${daysAgo(1)}T14:30:00`,
        swapPartnerApproved: true,
    },
    {
        id: 'swap_002',
        requestedBy: { id: 'emp_devon_001', name: 'Devon Brooks' },
        swapWith:    null,  // looking for anyone
        originalShift: { date: daysFromNow(3), start: '16:00', end: '22:00', template: 'PM Busser' },
        swapShift:     null,
        reason: 'Family obligation — need this day off',
        status: 'pending',
        requestedAt: `${daysAgo(0)}T09:15:00`,
        swapPartnerApproved: false,
    },
    {
        id: 'swap_003',
        requestedBy: { id: 'emp_maria_001', name: 'Maria Garcia' },
        swapWith:    { id: 'emp_james_001', name: 'James Wilson' },
        originalShift: { date: daysAgo(2), start: '10:30', end: '17:00', template: 'Lunch Service' },
        swapShift:     { date: daysAgo(2), start: '17:00', end: '01:00', template: 'Bar Close' },
        reason: 'Needed morning free for car repair',
        status: 'approved',
        requestedAt: `${daysAgo(4)}T11:00:00`,
        resolvedAt: `${daysAgo(3)}T08:30:00`,
        resolvedBy: 'Tyler Johnson',
        swapPartnerApproved: true,
    },
    {
        id: 'swap_004',
        requestedBy: { id: 'emp_alex_001', name: 'Alex Chen' },
        swapWith:    { id: 'emp_sofia_001', name: 'Sofia Martinez' },
        originalShift: { date: daysAgo(5), start: '15:30', end: '21:00', template: 'Dinner Service' },
        swapShift:     { date: daysAgo(5), start: '10:30', end: '17:00', template: 'Lunch Service' },
        reason: 'Study group meets Thursday evenings',
        status: 'denied',
        requestedAt: `${daysAgo(7)}T16:00:00`,
        resolvedAt: `${daysAgo(6)}T09:00:00`,
        resolvedBy: 'Tyler Johnson',
        denyReason: 'Not enough dinner coverage — need minimum 2 servers',
        swapPartnerApproved: true,
    },
];

/* ------------------------------------------
   COVERAGE ANALYSIS
   Minimum staffing requirements vs scheduled
------------------------------------------ */
export const COVERAGE_REQUIREMENTS = {
    dayparts: [
        {
            name: 'Morning',
            startHour: 7, endHour: 11,
            minimum: { manager: 1, server: 0, bartender: 0, host: 0, busser: 0 },
        },
        {
            name: 'Lunch',
            startHour: 11, endHour: 15,
            minimum: { manager: 1, server: 2, bartender: 0, host: 1, busser: 1 },
        },
        {
            name: 'Dinner',
            startHour: 15, endHour: 22,
            minimum: { manager: 1, server: 3, bartender: 1, host: 1, busser: 1 },
        },
        {
            name: 'Late Night',
            startHour: 22, endHour: 1,
            minimum: { manager: 0, server: 1, bartender: 1, host: 0, busser: 0 },
        },
    ],
};

/* ------------------------------------------
   GANTT HELPERS
   Convert time to pixel position on 24h timeline
------------------------------------------ */
export const GANTT_CONFIG = {
    startHour: 6,    // timeline starts at 6 AM
    endHour: 26,     // timeline ends at 2 AM (next day = 26)
    totalHours: 20,  // 6 AM to 2 AM
};

export function timeToPercent(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    let hour = h + m / 60;
    if (hour < GANTT_CONFIG.startHour) hour += 24; // wrap past midnight
    const offset = hour - GANTT_CONFIG.startHour;
    return Math.max(0, Math.min(100, (offset / GANTT_CONFIG.totalHours) * 100));
}

export function barWidth(startStr, endStr) {
    const startPct = timeToPercent(startStr);
    const endPct = timeToPercent(endStr);
    return Math.max(2, endPct - startPct);
}

/* ------------------------------------------
   STATUS HELPERS
------------------------------------------ */
export const SHIFT_STATUSES = {
    active:    { label: 'Active',    color: '#00FF00' },
    upcoming:  { label: 'Upcoming',  color: '#64B5F6' },
    completed: { label: 'Completed', color: '#888888' },
    'no-show': { label: 'No Show',   color: '#FF3333' },
    'called-out': { label: 'Called Out', color: '#FFA500' },
};

export const SWAP_STATUSES = {
    pending:  { label: 'Pending',  color: '#FBDE42' },
    approved: { label: 'Approved', color: '#00FF00' },
    denied:   { label: 'Denied',   color: '#FF3333' },
};