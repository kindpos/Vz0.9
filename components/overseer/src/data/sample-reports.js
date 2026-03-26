/* ============================================
   KINDpos Overseer - Sample Report Data
   Based on "A Day at The Honeycomb Bistro"
   
   This module will be replaced with live API 
   fetch() calls when the backend is connected.
   ============================================ */

export const SAMPLE_DATA = {

    /* --- DAILY FLASH --- */
    dailyFlash: {
        date: '2026-02-08',
        today: {
            net_sales:       2461.10,
            tax_collected:    205.11,
            tips:             440.66,
            total_collected: 3106.87,
            orders:           38,
            guests:           94,
            avg_check:        64.77,
            discounts:        48.20,
            comps:            12.50,
            voids:            8.75,
        },
        yesterday: {
            net_sales:       2198.45,
            tax_collected:    183.20,
            tips:             389.10,
            total_collected: 2770.75,
            orders:           34,
            guests:           82,
            avg_check:        64.66,
            discounts:        32.00,
            comps:            0.00,
            voids:            15.50,
        },
    },

    /* --- TOP SELLERS (by quantity) --- */
    topSellers: [
        { name: 'Honeycomb Burger',    qty: 18, revenue: 306.00 },
        { name: 'Truffle Mac & Cheese', qty: 14, revenue: 224.00 },
        { name: 'Caesar Salad',         qty: 12, revenue: 156.00 },
        { name: 'Ribeye Steak',         qty: 9,  revenue: 342.00 },
        { name: 'Fish Tacos',           qty: 8,  revenue: 128.00 },
        { name: 'Grilled Salmon',       qty: 7,  revenue: 196.00 },
        { name: 'Wings Basket',         qty: 7,  revenue: 91.00  },
        { name: 'Margherita Pizza',     qty: 6,  revenue: 96.00  },
    ],

    /* --- PAYMENT BREAKDOWN --- */
    paymentBreakdown: {
        card: {
            amount:  2207.26,
            count:   29,
            pct:     74.5,
            fees:    72.11,
        },
        cash: {
            amount:  851.41,
            count:   9,
            pct:     25.5,
        },
    },

    /* --- DAYPART ANALYSIS --- */
    dayparts: [
        { name: 'Breakfast',    start: '07:00', end: '11:00', net_sales: 285.50,  orders: 6,  guests: 12, pct: 11.6  },
        { name: 'Lunch',        start: '11:00', end: '15:00', net_sales: 742.30,  orders: 12, guests: 28, pct: 30.2  },
        { name: 'Happy Hour',   start: '15:00', end: '18:00', net_sales: 198.60,  orders: 5,  guests: 14, pct: 8.1   },
        { name: 'Dinner',       start: '18:00', end: '22:00', net_sales: 1087.20, orders: 13, guests: 34, pct: 44.2  },
        { name: 'Late Night',   start: '22:00', end: '02:00', net_sales: 147.50,  orders: 2,  guests: 6,  pct: 6.0   },
    ],

    /* --- HOURLY SALES (for line chart) --- */
    hourlySales: {
        today: [
            { hour: '7AM',  sales: 42.50  },
            { hour: '8AM',  sales: 98.00  },
            { hour: '9AM',  sales: 85.00  },
            { hour: '10AM', sales: 60.00  },
            { hour: '11AM', sales: 145.20 },
            { hour: '12PM', sales: 238.50 },
            { hour: '1PM',  sales: 210.10 },
            { hour: '2PM',  sales: 148.50 },
            { hour: '3PM',  sales: 72.30  },
            { hour: '4PM',  sales: 58.10  },
            { hour: '5PM',  sales: 68.20  },
            { hour: '6PM',  sales: 285.40 },
            { hour: '7PM',  sales: 312.80 },
            { hour: '8PM',  sales: 298.00 },
            { hour: '9PM',  sales: 191.00 },
            { hour: '10PM', sales: 98.50  },
            { hour: '11PM', sales: 49.00  },
        ],
        yesterday: [
            { hour: '7AM',  sales: 38.00  },
            { hour: '8AM',  sales: 82.50  },
            { hour: '9AM',  sales: 75.00  },
            { hour: '10AM', sales: 55.00  },
            { hour: '11AM', sales: 125.00 },
            { hour: '12PM', sales: 215.30 },
            { hour: '1PM',  sales: 198.20 },
            { hour: '2PM',  sales: 135.00 },
            { hour: '3PM',  sales: 65.50  },
            { hour: '4PM',  sales: 48.00  },
            { hour: '5PM',  sales: 55.90  },
            { hour: '6PM',  sales: 248.00 },
            { hour: '7PM',  sales: 290.10 },
            { hour: '8PM',  sales: 275.45 },
            { hour: '9PM',  sales: 172.50 },
            { hour: '10PM', sales: 78.00  },
            { hour: '11PM', sales: 41.00  },
        ],
    },

    /* --- SALES BY CATEGORY --- */
    salesByCategory: [
        { category: 'Entrees',    net_sales: 1072.00, pct: 43.6, items_sold: 34 },
        { category: 'Appetizers', net_sales: 445.00,  pct: 18.1, items_sold: 28 },
        { category: 'Beverages',  net_sales: 495.35,  pct: 20.1, items_sold: 52 },
        { category: 'Desserts',   net_sales: 248.75,  pct: 10.1, items_sold: 15 },
        { category: 'Sides',      net_sales: 200.00,  pct: 8.1,  items_sold: 22 },
    ],

    /* --- TIPS BY SERVER --- */
    tipsByServer: [
        { server: 'Maria',  tips: 148.20, orders: 12, avg_tip_pct: 19.2 },
        { server: 'James',  tips: 112.46, orders: 10, avg_tip_pct: 17.8 },
        { server: 'Sofia',  tips: 108.00, orders: 9,  avg_tip_pct: 21.1 },
        { server: 'Tyler',  tips: 72.00,  orders: 7,  avg_tip_pct: 15.5 },
    ],

    /* --- TAX BREAKDOWN --- */
    taxBreakdown: [
        { type: 'State Sales Tax',  rate: 6.0,  amount: 147.67 },
        { type: 'Local Option Tax', rate: 1.0,  amount: 24.61  },
        { type: 'Tourism Tax',      rate: 0.5,  amount: 12.31  },
        { type: 'County Surtax',    rate: 0.5,  amount: 12.31  },
        { type: 'Discretionary',    rate: 0.35, amount: 8.21   },
    ],

    /* --- ADJUSTMENT DETAILS (individual line items) --- */
    adjustmentDetails: {
        discounts: [
            { reason: '10% Loyalty Discount', table: 'Table 4', server: 'Maria', amount: 18.50 },
            { reason: 'Happy Hour 2-for-1',   table: 'Table 7', server: 'James', amount: 14.20 },
            { reason: 'Birthday Special',     table: 'Table 2', server: 'Sofia', amount: 15.50 },
        ],
        comps: [
            { reason: 'Food quality', table: 'Table 9', server: 'Tyler', amount: 12.50 },
        ],
        voids: [
            { reason: 'Wrong item entered', table: 'Table 3', server: 'Maria', amount: 8.75 },
        ],
    },
};

/**
 * Helper: Calculate delta between today and yesterday
 */
export function calcDelta(today, yesterday) {
    const diff = today - yesterday;
    const pct = yesterday !== 0 ? ((diff / yesterday) * 100) : 0;
    return {
        diff: diff,
        pct: pct,
        direction: diff >= 0 ? 'up' : 'down',
    };
}

/**
 * Helper: Format currency
 */
export function fmt$(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Helper: Format percentage
 */
export function fmtPct(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
}