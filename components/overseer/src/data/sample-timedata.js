/* ============================================
   KINDpos Overseer - Sample Time & Attendance Data
   Based on "The Honeycomb Bistro" demo restaurant

   This module will be replaced with live API
   fetch() calls when the backend is connected.

   Endpoints this replaces:
     GET  /api/v1/shifts/active       → currently clocked in
     GET  /api/v1/shifts?start&end    → time cards for range
     GET  /api/v1/shifts/{id}         → shift detail with breaks
     POST /api/v1/shifts/{id}/edit    → time edit (manager PIN)
     POST /api/v1/breaks/start        → start break
     POST /api/v1/breaks/end          → end break
   ============================================ */

/* ------------------------------------------
   HELPERS
------------------------------------------ */
function today() {
    return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

function timeStr(hour, min = 0) {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/* ------------------------------------------
   CURRENTLY CLOCKED IN (Live Dashboard)
   Simulates GET /api/v1/shifts/active
------------------------------------------ */
export const ACTIVE_SHIFTS = [
    {
        shift_id: 'shf_001',
        employee_id: 'emp_tyler_001',
        firstName: 'Tyler',
        lastName: 'Johnson',
        role: 'manager',
        clockIn: `${today()}T07:45:00`,
        clockOut: null,
        breaksTaken: [
            { type: 'rest', start: `${today()}T10:15:00`, end: `${today()}T10:30:00`, duration: 15 },
        ],
        onBreak: false,
        tables: 0,
        sales: 0,
        tips: 0,
    },
    {
        shift_id: 'shf_002',
        employee_id: 'emp_maria_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'server',
        clockIn: `${today()}T10:55:00`,
        clockOut: null,
        breaksTaken: [],
        onBreak: false,
        tables: 6,
        sales: 487.50,
        tips: 92.25,
    },
    {
        shift_id: 'shf_003',
        employee_id: 'emp_james_001',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'bartender',
        clockIn: `${today()}T11:00:00`,
        clockOut: null,
        breaksTaken: [],
        onBreak: false,
        tables: 8,
        sales: 612.00,
        tips: 108.50,
    },
    {
        shift_id: 'shf_004',
        employee_id: 'emp_sofia_001',
        firstName: 'Sofia',
        lastName: 'Martinez',
        role: 'server',
        clockIn: `${today()}T15:30:00`,
        clockOut: null,
        breaksTaken: [],
        onBreak: true,
        currentBreak: { type: 'meal', start: `${today()}T16:00:00` },
        tables: 0,
        sales: 0,
        tips: 0,
    },
    {
        shift_id: 'shf_005',
        employee_id: 'emp_devon_001',
        firstName: 'Devon',
        lastName: 'Brooks',
        role: 'busser',
        clockIn: `${today()}T16:00:00`,
        clockOut: null,
        breaksTaken: [],
        onBreak: false,
        tables: 0,
        sales: 0,
        tips: 0,
    },
];

/* ------------------------------------------
   WEEKLY TIME CARDS
   Simulates GET /api/v1/shifts?start_date&end_date

   Week of Feb 3 - Feb 9, 2026 (Mon-Sun)
   plus partial today (Feb 10)
------------------------------------------ */
export const WEEKLY_TIMECARDS = [
    // ── Tyler Johnson (Manager) ──────────────
    {
        employee_id: 'emp_tyler_001',
        firstName: 'Tyler',
        lastName: 'Johnson',
        role: 'manager',
        payRate: 22.00,
        isTipped: false,
        shifts: [
            { shift_id: 'shf_t_mon', date: daysAgo(7), clockIn: '07:30', clockOut: '16:15', hours: 8.75, breaks: 1, sales: 0, tips: 0, edited: false },
            { shift_id: 'shf_t_tue', date: daysAgo(6), clockIn: '07:45', clockOut: '16:30', hours: 8.75, breaks: 1, sales: 0, tips: 0, edited: false },
            { shift_id: 'shf_t_wed', date: daysAgo(5), clockIn: '07:30', clockOut: '17:00', hours: 9.50, breaks: 1, sales: 0, tips: 0, edited: false },
            { shift_id: 'shf_t_thu', date: daysAgo(4), clockIn: '07:45', clockOut: '16:45', hours: 9.00, breaks: 1, sales: 0, tips: 0, edited: false },
            { shift_id: 'shf_t_fri', date: daysAgo(3), clockIn: '07:30', clockOut: '18:00', hours: 10.50, breaks: 2, sales: 0, tips: 0, edited: false },
            { shift_id: 'shf_t_sat', date: daysAgo(2), clockIn: '08:00', clockOut: '16:00', hours: 8.00, breaks: 1, sales: 0, tips: 0, edited: false },
            // Sunday off
        ],
    },
    // ── Maria Garcia (Server) ────────────────
    {
        employee_id: 'emp_maria_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'server',
        payRate: 15.00,
        isTipped: true,
        shifts: [
            { shift_id: 'shf_m_mon', date: daysAgo(7), clockIn: '11:00', clockOut: '19:30', hours: 8.50, breaks: 1, sales: 892.00, tips: 168.40, edited: false },
            { shift_id: 'shf_m_tue', date: daysAgo(6), clockIn: '11:00', clockOut: '19:15', hours: 8.25, breaks: 1, sales: 845.50, tips: 159.00, edited: false },
            // Wednesday off
            { shift_id: 'shf_m_thu', date: daysAgo(4), clockIn: '11:00', clockOut: '20:00', hours: 9.00, breaks: 1, sales: 1024.00, tips: 195.60, edited: false },
            { shift_id: 'shf_m_fri', date: daysAgo(3), clockIn: '11:00', clockOut: '21:15', hours: 10.25, breaks: 2, sales: 1287.50, tips: 248.20, edited: true },
            { shift_id: 'shf_m_sat', date: daysAgo(2), clockIn: '10:00', clockOut: '20:30', hours: 10.50, breaks: 2, sales: 1456.00, tips: 282.00, edited: false },
            { shift_id: 'shf_m_sun', date: daysAgo(1), clockIn: '10:00', clockOut: '18:00', hours: 8.00, breaks: 1, sales: 780.00, tips: 148.20, edited: false },
        ],
    },
    // ── James Wilson (Bartender) ─────────────
    {
        employee_id: 'emp_james_001',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'bartender',
        payRate: 16.50,
        isTipped: true,
        shifts: [
            { shift_id: 'shf_j_mon', date: daysAgo(7), clockIn: '15:00', clockOut: '23:30', hours: 8.50, breaks: 1, sales: 1120.00, tips: 195.00, edited: false },
            { shift_id: 'shf_j_tue', date: daysAgo(6), clockIn: '15:00', clockOut: '23:45', hours: 8.75, breaks: 1, sales: 1085.00, tips: 188.50, edited: false },
            { shift_id: 'shf_j_wed', date: daysAgo(5), clockIn: '15:00', clockOut: '00:15', hours: 9.25, breaks: 1, sales: 1340.00, tips: 232.00, edited: false },
            { shift_id: 'shf_j_thu', date: daysAgo(4), clockIn: '15:00', clockOut: '23:30', hours: 8.50, breaks: 1, sales: 1050.00, tips: 182.00, edited: false },
            { shift_id: 'shf_j_fri', date: daysAgo(3), clockIn: '14:00', clockOut: '01:00', hours: 11.00, breaks: 2, sales: 1890.00, tips: 342.00, edited: false },
            { shift_id: 'shf_j_sat', date: daysAgo(2), clockIn: '14:00', clockOut: '01:30', hours: 11.50, breaks: 2, sales: 2100.00, tips: 378.00, edited: false },
            // Sunday off
        ],
    },
    // ── Sofia Martinez (Server) ──────────────
    {
        employee_id: 'emp_sofia_001',
        firstName: 'Sofia',
        lastName: 'Martinez',
        role: 'server',
        payRate: 15.00,
        isTipped: true,
        shifts: [
            // Monday off (training schedule)
            { shift_id: 'shf_s_tue', date: daysAgo(6), clockIn: '11:00', clockOut: '17:00', hours: 6.00, breaks: 1, sales: 425.00, tips: 72.00, edited: false },
            { shift_id: 'shf_s_wed', date: daysAgo(5), clockIn: '11:00', clockOut: '17:30', hours: 6.50, breaks: 1, sales: 480.00, tips: 84.50, edited: false },
            { shift_id: 'shf_s_thu', date: daysAgo(4), clockIn: '16:00', clockOut: '22:00', hours: 6.00, breaks: 1, sales: 520.00, tips: 95.00, edited: false },
            { shift_id: 'shf_s_fri', date: daysAgo(3), clockIn: '16:00', clockOut: '22:30', hours: 6.50, breaks: 1, sales: 680.00, tips: 124.00, edited: false },
            { shift_id: 'shf_s_sat', date: daysAgo(2), clockIn: '11:00', clockOut: '19:00', hours: 8.00, breaks: 1, sales: 845.00, tips: 156.00, edited: false },
            // Sunday off
        ],
    },
    // ── Alex Chen (Host / Part-time) ─────────
    {
        employee_id: 'emp_alex_001',
        firstName: 'Alex',
        lastName: 'Chen',
        role: 'host',
        payRate: 14.00,
        isTipped: true,
        shifts: [
            // Mon-Wed off (college classes)
            { shift_id: 'shf_a_thu', date: daysAgo(4), clockIn: '16:00', clockOut: '21:00', hours: 5.00, breaks: 0, sales: 0, tips: 18.00, edited: false },
            { shift_id: 'shf_a_fri', date: daysAgo(3), clockIn: '16:00', clockOut: '22:00', hours: 6.00, breaks: 1, sales: 0, tips: 24.00, edited: false },
            { shift_id: 'shf_a_sat', date: daysAgo(2), clockIn: '11:00', clockOut: '19:00', hours: 8.00, breaks: 1, sales: 0, tips: 32.00, edited: false },
            { shift_id: 'shf_a_sun', date: daysAgo(1), clockIn: '10:00', clockOut: '16:00', hours: 6.00, breaks: 1, sales: 0, tips: 22.00, edited: false },
        ],
    },
    // ── Devon Brooks (Busser) ────────────────
    {
        employee_id: 'emp_devon_001',
        firstName: 'Devon',
        lastName: 'Brooks',
        role: 'busser',
        payRate: 13.00,
        isTipped: true,
        shifts: [
            { shift_id: 'shf_d_mon', date: daysAgo(7), clockIn: '11:00', clockOut: '17:00', hours: 6.00, breaks: 0, sales: 0, tips: 28.00, edited: false },
            { shift_id: 'shf_d_tue', date: daysAgo(6), clockIn: '11:00', clockOut: '17:30', hours: 6.50, breaks: 1, sales: 0, tips: 30.00, edited: false },
            { shift_id: 'shf_d_wed', date: daysAgo(5), clockIn: '16:00', clockOut: '22:00', hours: 6.00, breaks: 1, sales: 0, tips: 32.00, edited: false },
            // Thursday off
            { shift_id: 'shf_d_fri', date: daysAgo(3), clockIn: '16:00', clockOut: '23:00', hours: 7.00, breaks: 1, sales: 0, tips: 45.00, edited: false },
            { shift_id: 'shf_d_sat', date: daysAgo(2), clockIn: '11:00', clockOut: '20:00', hours: 9.00, breaks: 1, sales: 0, tips: 52.00, edited: false },
            { shift_id: 'shf_d_sun', date: daysAgo(1), clockIn: '10:00', clockOut: '17:00', hours: 7.00, breaks: 1, sales: 0, tips: 38.00, edited: false },
        ],
    },
    // ── Rachel Kim (Server) ──────────────────
    {
        employee_id: 'emp_rachel_001',
        firstName: 'Rachel',
        lastName: 'Kim',
        role: 'server',
        payRate: 15.50,
        isTipped: true,
        shifts: [
            { shift_id: 'shf_r_mon', date: daysAgo(7), clockIn: '16:00', clockOut: '22:30', hours: 6.50, breaks: 1, sales: 782.00, tips: 152.00, edited: false },
            { shift_id: 'shf_r_tue', date: daysAgo(6), clockIn: '16:00', clockOut: '22:00', hours: 6.00, breaks: 1, sales: 710.00, tips: 138.00, edited: false },
            { shift_id: 'shf_r_wed', date: daysAgo(5), clockIn: '11:00', clockOut: '19:30', hours: 8.50, breaks: 1, sales: 920.00, tips: 178.50, edited: false },
            { shift_id: 'shf_r_thu', date: daysAgo(4), clockIn: '11:00', clockOut: '19:00', hours: 8.00, breaks: 1, sales: 856.00, tips: 165.00, edited: true },
            { shift_id: 'shf_r_fri', date: daysAgo(3), clockIn: '16:00', clockOut: '23:30', hours: 7.50, breaks: 1, sales: 1120.00, tips: 218.00, edited: false },
            // Saturday off
            { shift_id: 'shf_r_sun', date: daysAgo(1), clockIn: '10:00', clockOut: '18:30', hours: 8.50, breaks: 1, sales: 845.00, tips: 164.00, edited: false },
        ],
    },
];

/* ------------------------------------------
   SHIFT DETAIL (for drill-down)
   Simulates GET /api/v1/shifts/{id}
------------------------------------------ */
export const SHIFT_DETAILS = {
    'shf_m_fri': {
        shift_id: 'shf_m_fri',
        employee_id: 'emp_maria_001',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'server',
        date: daysAgo(3),
        clockIn: '11:00',
        clockOut: '21:15',
        originalClockOut: '21:45',
        hours: 10.25,
        edited: true,
        editReason: 'System error — terminal froze during checkout',
        editedBy: 'Tyler Johnson',
        editedAt: `${daysAgo(3)}T22:10:00`,
        breaks: [
            { type: 'rest', start: '14:15', end: '14:30', duration: 15, paid: true },
            { type: 'meal', start: '17:00', end: '17:32', duration: 32, paid: false },
        ],
        tables: 14,
        guests: 38,
        sales: 1287.50,
        tips: 248.20,
        tipPct: 19.27,
        avgCheck: 33.88,
        orders: [
            { time: '11:22', table: 'Table 3', items: 4, amount: 62.50 },
            { time: '11:45', table: 'Table 7', items: 3, amount: 48.00 },
            { time: '12:10', table: 'Table 2', items: 6, amount: 94.00 },
            { time: '12:35', table: 'Table 9', items: 2, amount: 35.50 },
            { time: '13:00', table: 'Table 5', items: 5, amount: 78.00 },
            { time: '14:45', table: 'Table 1', items: 4, amount: 66.50 },
            { time: '15:20', table: 'Table 4', items: 3, amount: 52.00 },
            { time: '16:10', table: 'Table 8', items: 7, amount: 112.00 },
            { time: '17:45', table: 'Table 6', items: 4, amount: 85.00 },
            { time: '18:15', table: 'Table 3', items: 5, amount: 96.00 },
            { time: '18:50', table: 'Table 10', items: 6, amount: 148.00 },
            { time: '19:30', table: 'Table 7', items: 4, amount: 125.00 },
            { time: '20:00', table: 'Table 2', items: 6, amount: 155.00 },
            { time: '20:30', table: 'Table 9', items: 5, amount: 130.00 },
        ],
    },
    'shf_r_thu': {
        shift_id: 'shf_r_thu',
        employee_id: 'emp_rachel_001',
        firstName: 'Rachel',
        lastName: 'Kim',
        role: 'server',
        date: daysAgo(4),
        clockIn: '11:00',
        clockOut: '19:00',
        originalClockOut: '19:20',
        hours: 8.00,
        edited: true,
        editReason: 'Forgot to clock out — left at 7pm per schedule',
        editedBy: 'Tyler Johnson',
        editedAt: `${daysAgo(4)}T20:05:00`,
        breaks: [
            { type: 'meal', start: '14:30', end: '15:02', duration: 32, paid: false },
        ],
        tables: 10,
        guests: 26,
        sales: 856.00,
        tips: 165.00,
        tipPct: 19.28,
        avgCheck: 32.92,
        orders: [
            { time: '11:15', table: 'Table 1', items: 3, amount: 55.00 },
            { time: '11:40', table: 'Table 4', items: 4, amount: 72.00 },
            { time: '12:20', table: 'Table 6', items: 5, amount: 98.00 },
            { time: '13:00', table: 'Table 2', items: 3, amount: 64.00 },
            { time: '13:45', table: 'Table 8', items: 4, amount: 85.00 },
            { time: '15:10', table: 'Table 3', items: 3, amount: 68.00 },
            { time: '16:00', table: 'Table 5', items: 5, amount: 110.00 },
            { time: '16:45', table: 'Table 7', items: 4, amount: 92.00 },
            { time: '17:30', table: 'Table 10', items: 5, amount: 112.00 },
            { time: '18:15', table: 'Table 1', items: 4, amount: 100.00 },
        ],
    },
};

/* ------------------------------------------
   TIME EDIT REASON CODES
------------------------------------------ */
export const EDIT_REASONS = [
    { id: 'forgot_clock',   label: 'Forgot to clock in/out' },
    { id: 'system_error',   label: 'System error / terminal issue' },
    { id: 'wrong_terminal', label: 'Clocked in on wrong terminal' },
    { id: 'schedule_adj',   label: 'Schedule adjustment approved' },
    { id: 'early_release',  label: 'Released early by manager' },
    { id: 'other',          label: 'Other (see notes)' },
];

/* ------------------------------------------
   HELPER: Calculate duration string from ISO timestamps
------------------------------------------ */
export function calcDuration(clockInISO) {
    const now = new Date();
    const start = new Date(clockInISO);
    const diffMs = now - start;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return { hrs, mins, totalHrs: hrs + mins / 60, text: `${hrs}h ${mins}m` };
}

/* ------------------------------------------
   HELPER: Duration color (shift length indicator)
   < 4h = mint (just started)
   4–8h = yellow (standard shift)
   > 8h = orange (long shift / OT watch)
   > 10h = red (overtime territory)
------------------------------------------ */
export function durationColor(totalHrs) {
    if (totalHrs < 4)  return '#C6FFBB';   // mint
    if (totalHrs < 8)  return '#FBDE42';   // yellow
    if (totalHrs < 10) return '#FFA500';   // orange
    return '#FF3333';                       // red — OT territory
}

/* ------------------------------------------
   HELPER: Get weekly totals for an employee
------------------------------------------ */
export function getWeeklyTotals(timecard) {
    const totalHours = timecard.shifts.reduce((sum, s) => sum + s.hours, 0);
    const totalSales = timecard.shifts.reduce((sum, s) => sum + s.sales, 0);
    const totalTips  = timecard.shifts.reduce((sum, s) => sum + s.tips, 0);
    const shiftCount = timecard.shifts.length;
    const hasEdits   = timecard.shifts.some(s => s.edited);
    const overtime   = Math.max(0, totalHours - 40);
    return { totalHours, totalSales, totalTips, shiftCount, hasEdits, overtime };
}

/* ------------------------------------------
   HELPER: Day of week labels
------------------------------------------ */
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getDayIndex(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay();
    return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
}