/**
 * KINDpos — Snapshot Store
 * Mock data for Snapshot Screen implementation.
 */

export const MOCK_TABLES = [
    { id: 1, number: 'T4', guests: 2, openedAt: Date.now() - 45*60000, status: 'ordering', serverId: 1, checkTotal: 67.50 },
    { id: 2, number: 'T7', guests: 3, openedAt: Date.now() - 80*60000, status: 'waiting', serverId: 1, checkTotal: 124.00 },
    { id: 3, number: 'T12', guests: 4, openedAt: Date.now() - 30*60000, status: 'ordering', serverId: 1, checkTotal: 43.25 },
    { id: 4, number: 'T15', guests: 2, openedAt: Date.now() - 130*60000, status: 'check_dropped', serverId: 1, checkTotal: 89.00 },
];

export const MOCK_TIME_THRESHOLDS = {
    green: 0,
    orange: 45,
    red: 90,
};

export const MOCK_SHIFT_STATS = {
    guests: 24,
    sales: 1847.50,
    tips: 312.00,
    categories: [
        { name: 'Food', amount: 1120.00 },
        { name: 'Beverage', amount: 340.50 },
        { name: 'Alcohol', amount: 387.00 },
    ],
    tipPercentage: 18.4,
    tipTrend: 'up',
    tables: [
        { number: 'T4', guests: 2, total: 67.50 },
        { number: 'T7', guests: 3, total: 124.00 },
        { number: 'T12', guests: 4, total: 43.25 },
    ],
    comparison: { change: 14, direction: 'up', dayName: 'Tuesday' },
};

export const MOCK_MESSAGES = [
    { id: 1, type: 'discount', serverName: 'Alex', serverId: 1, table: 'T7', item: 'Pasta Primavera', amount: '20%', status: 'pending', timestamp: Date.now() - 5*60000 },
    { id: 2, type: 'comp', serverName: 'Jamie', serverId: 2, table: 'T3', item: 'Dessert', amount: '$12.00', status: 'approved', timestamp: Date.now() - 25*60000 },
    { id: 3, type: 'void', serverName: 'Alex', serverId: 1, table: 'T12', item: 'Wrong order', amount: '$18.50', status: 'pending', timestamp: Date.now() - 2*60000 },
];

export const MOCK_ANNOUNCEMENTS = [
    { id: 1, type: '86', text: "86'd: Branzino", urgent: true },
    { id: 2, type: 'note', text: 'Happy Hour pricing starts 4pm', urgent: false },
];

export const MOCK_CHECKOUT = {
    hoursWorked: 6.2,
    openTables: 2,
    untippedTransactions: [
        { id: 1, table: 'T4', checkTotal: 67.50, paymentAmount: 67.50, timestamp: Date.now() - 120*60000 },
        { id: 2, table: 'T15', checkTotal: 89.00, paymentAmount: 89.00, timestamp: Date.now() - 45*60000 },
        { id: 3, table: 'T8', checkTotal: 52.25, paymentAmount: 52.25, timestamp: Date.now() - 90*60000 },
    ],
    shiftSummary: {
        totalSales: 1847.50,
        cashTips: 85.00,
        creditTips: 227.00,
        tablesServed: 12,
        guestsServed: 24,
    },
    tipOutRules: [
        { role: 'Busser', percentage: 3 },
        { role: 'Bar', percentage: 2 },
        { role: 'Host', percentage: 1 },
    ],
};

export const MOCK_HARDWARE = {
    printers: [
        { id: 1, name: 'Hot Line', status: 'online', ip: '192.168.1.50', mac: 'AA:BB:CC:DD:EE:01', lastSeen: Date.now() },
        { id: 2, name: 'Bar Printer', status: 'online', ip: '192.168.1.51', mac: 'AA:BB:CC:DD:EE:02', lastSeen: Date.now() },
        { id: 3, name: 'Receipt', status: 'offline', ip: '192.168.1.52', mac: 'AA:BB:CC:DD:EE:03', lastSeen: Date.now() - 300000, error: 'Connection timeout' },
    ],
    ccReader: {
        name: 'Dejavoo Z11', status: 'connected', lastSeen: Date.now()
    },
    network: {
        lanStatus: 'connected', peerTerminals: 4, signalStrength: 'strong'
    },
};

const snapshotStore = {
    tables: MOCK_TABLES,
    stats: MOCK_SHIFT_STATS,
    messages: MOCK_MESSAGES,
    announcements: MOCK_ANNOUNCEMENTS,
    checkout: MOCK_CHECKOUT,
    hardware: MOCK_HARDWARE,
    layout: null
};

export default snapshotStore;
