/* ============================================
   KINDpos Overseer - Sample Payroll & Tips Data
   Based on "The Honeycomb Bistro" demo restaurant

   This module will be replaced with live API
   fetch() calls when the backend is connected.

   Endpoints this replaces:
     GET  /api/v1/config/tip-pooling   → tip pool config
     PUT  /api/v1/config/tip-pooling   → update tip pool rules
     POST /api/v1/shifts/{id}/checkout → checkout w/ tip enforcement
     GET  /api/v1/export/payroll       → generate payroll export
   ============================================ */

/* ------------------------------------------
   HELPERS
------------------------------------------ */
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
}

/* ------------------------------------------
   PAY PERIOD DEFINITIONS
------------------------------------------ */
export const PAY_PERIODS = [
    {
        id: 'pp_current',
        label: 'Current Period',
        start: daysAgo(13),
        end: daysAgo(0),
        status: 'open',
    },
    {
        id: 'pp_previous',
        label: 'Previous Period',
        start: daysAgo(27),
        end: daysAgo(14),
        status: 'closed',
    },
];

export const PAY_SCHEDULE = {
    type: 'biweekly',    // biweekly | semi-monthly
    dayOfWeek: 'Monday', // pay period starts on
};

/* ------------------------------------------
   PAYROLL SUMMARY (for current pay period)
   Simulates computed from shift events
------------------------------------------ */
export const PAYROLL_SUMMARY = {
    period: PAY_PERIODS[0],
    totalSales: 28450.00,
    laborSummary: {
        totalHours:     398.50,
        regularHours:   371.00,
        overtimeHours:  27.50,
        totalWages:     6284.25,
        overtimeWages:  680.63,
        totalTips:      4218.90,
        totalLabor:     10503.15,   // wages + tips
        laborCostPct:   36.9,       // totalLabor / totalSales × 100
    },
    employees: [
        {
            employee_id: 'emp_tyler_001',
            firstName: 'Tyler',
            lastName: 'Johnson',
            role: 'manager',
            payRate: 22.00,
            isTipped: false,
            regularHours: 80.00,
            overtimeHours: 14.50,
            totalHours: 94.50,
            regularPay: 1760.00,
            overtimePay: 478.50,    // 22 × 1.5 × 14.5
            grossPay: 2238.50,
            tips: 0,
            totalComp: 2238.50,
            shiftsWorked: 12,
        },
        {
            employee_id: 'emp_maria_001',
            firstName: 'Maria',
            lastName: 'Garcia',
            role: 'server',
            payRate: 15.00,
            isTipped: true,
            regularHours: 80.00,
            overtimeHours: 9.50,
            totalHours: 89.50,
            regularPay: 1200.00,
            overtimePay: 213.75,
            grossPay: 1413.75,
            tips: 1652.40,
            totalComp: 3066.15,
            shiftsWorked: 11,
        },
        {
            employee_id: 'emp_james_001',
            firstName: 'James',
            lastName: 'Wilson',
            role: 'bartender',
            payRate: 16.50,
            isTipped: true,
            regularHours: 80.00,
            overtimeHours: 3.50,
            totalHours: 83.50,
            regularPay: 1320.00,
            overtimePay: 86.63,
            grossPay: 1406.63,
            tips: 1518.50,
            totalComp: 2925.13,
            shiftsWorked: 10,
        },
        {
            employee_id: 'emp_sofia_001',
            firstName: 'Sofia',
            lastName: 'Martinez',
            role: 'server',
            payRate: 15.00,
            isTipped: true,
            regularHours: 52.00,
            overtimeHours: 0,
            totalHours: 52.00,
            regularPay: 780.00,
            overtimePay: 0,
            grossPay: 780.00,
            tips: 531.50,
            totalComp: 1311.50,
            shiftsWorked: 8,
        },
        {
            employee_id: 'emp_alex_001',
            firstName: 'Alex',
            lastName: 'Chen',
            role: 'host',
            payRate: 14.00,
            isTipped: true,
            regularHours: 38.00,
            overtimeHours: 0,
            totalHours: 38.00,
            regularPay: 532.00,
            overtimePay: 0,
            grossPay: 532.00,
            tips: 148.00,
            totalComp: 680.00,
            shiftsWorked: 6,
        },
        {
            employee_id: 'emp_devon_001',
            firstName: 'Devon',
            lastName: 'Brooks',
            role: 'busser',
            payRate: 13.00,
            isTipped: true,
            regularHours: 60.50,
            overtimeHours: 0,
            totalHours: 60.50,
            regularPay: 786.50,
            overtimePay: 0,
            grossPay: 786.50,
            tips: 225.00,
            totalComp: 1011.50,
            shiftsWorked: 9,
        },
        {
            employee_id: 'emp_rachel_001',
            firstName: 'Rachel',
            lastName: 'Kim',
            role: 'server',
            payRate: 15.50,
            isTipped: true,
            regularHours: 68.00,
            overtimeHours: 0,
            totalHours: 68.00,
            regularPay: 1054.00,
            overtimePay: 0,
            grossPay: 1054.00,
            tips: 1015.50,
            totalComp: 2069.50,
            shiftsWorked: 9,
        },
    ],
};

/* ------------------------------------------
   TIP POOL CONFIGURATION
------------------------------------------ */
export const TIP_POOL_CONFIG = {
    enabled: true,
    calculationMethod: 'percentage',  // percentage | points | hours
    enforcementMode: 'required',      // required | suggested | off
    rules: [
        { role: 'server',    keepPct: 80, poolPct: 20 },
        { role: 'bartender', keepPct: 85, poolPct: 15 },
        { role: 'host',      keepPct: 100, poolPct: 0, receivesFromPool: true, poolSharePct: 15 },
        { role: 'busser',    keepPct: 100, poolPct: 0, receivesFromPool: true, poolSharePct: 10 },
    ],
    autoCalculateAtCheckout: true,
    requireManagerOverrideForSkip: true,
};

/* ------------------------------------------
   EXPORT FORMATS
------------------------------------------ */
export const EXPORT_FORMATS = [
    { id: 'adp',        label: 'ADP Workforce Now', ext: '.csv', icon: '📊' },
    { id: 'gusto',      label: 'Gusto',             ext: '.csv', icon: '📋' },
    { id: 'paychex',    label: 'Paychex Flex',      ext: '.csv', icon: '📈' },
    { id: 'quickbooks', label: 'QuickBooks',         ext: '.iif', icon: '📒' },
    { id: 'universal',  label: 'Universal CSV',      ext: '.csv', icon: '📄' },
];

/* ------------------------------------------
   LABOR COST BENCHMARKS
------------------------------------------ */
export const LABOR_BENCHMARKS = {
    excellent: 30,   // under 30% = excellent
    good: 35,        // 30-35% = good
    warning: 40,     // 35-40% = watch it
    danger: 45,      // over 40% = danger zone
};