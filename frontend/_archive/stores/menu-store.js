/**
 * KINDpos — Menu Store
 * Exact menu data from kindpos-order-screen-v2.html prototype.
 */

export const modLibrary = {
    temp: { label: 'TEMP', options: [
        { name: 'RAR', price: 0 }, { name: 'MR', price: 0 }, { name: 'MED', price: 0 },
        { name: 'MW', price: 0 }, { name: 'WEL', price: 0 }
    ]},
    side: { label: 'SIDE', options: [
        { name: 'FRI', price: 0 }, { name: 'MSH', price: 0 }, { name: 'ASP', price: 3 },
        { name: 'RIC', price: 0 }, { name: 'SAL', price: 0 }, { name: 'BKD', price: 0 }
    ]},
    add: { label: 'ADD', options: [
        { name: 'GBT', price: 2 }, { name: 'CHS', price: 1.50 },
        { name: 'BCN', price: 3 }, { name: 'MSH', price: 2 },
        { name: 'EGG', price: 2 }, { name: 'AVO', price: 3 }
    ]},
    no: { label: 'NO', options: [
        { name: 'ONI', price: 0 }, { name: 'SLT', price: 0 }, { name: 'SAU', price: 0 },
        { name: 'CRT', price: 0 }, { name: 'PKL', price: 0 }, { name: 'TOM', price: 0 }
    ]},
    sub: { label: 'SUB', options: [
        { name: 'ASP', price: 3 }, { name: 'SAL', price: 0 }, { name: 'SLW', price: 0 },
        { name: 'FRI', price: 0 }, { name: 'RIC', price: 0 }, { name: 'FRT', price: 1 }
    ]}
};

export const menu = {
    food: {
        label: 'FOOD', color: 'orange',
        subcats: {
            appetizers: { label: 'APPS', items: [
                { name: 'Wings', price: 14, mods: { optional: ['add','no'] } },
                { name: 'Nachos', price: 12, mods: { optional: ['add','no'] } },
                { name: 'Salad', price: 11, mods: { optional: ['add','no','sub'] } },
                { name: 'Soup', price: 9 },
                { name: 'Calamari', price: 13, mods: { optional: ['no'] } },
                { name: 'Bruschtta', price: 10 },
                { name: 'Sliders', price: 15, mods: { required: ['temp'], optional: ['add','no'] } },
                { name: 'Shrimp', price: 16, mods: { optional: ['no'] } },
                { name: 'Bread', price: 7 }
            ]},
            entrees: { label: 'ENTREE', items: [
                { name: 'Burger', price: 18, mods: { required: ['temp'], optional: ['add','no','sub'] } },
                { name: 'Steak', price: 42, mods: { required: ['temp','side'], optional: ['add','no','sub'] } },
                { name: 'Pasta', price: 22, mods: { optional: ['add','no','sub'] } },
                { name: 'Salmon', price: 28, mods: { required: ['side'], optional: ['add','no'] } },
                { name: 'Tacos', price: 16, mods: { optional: ['add','no'] } },
                { name: 'Chops', price: 38, mods: { required: ['temp','side'], optional: ['add','no'] } },
                { name: 'Chicken', price: 24, mods: { required: ['side'], optional: ['add','no'] } },
                { name: 'Risotto', price: 26, mods: { optional: ['add','no'] } },
                { name: 'Meatloaf', price: 20, mods: { required: ['side'], optional: ['no'] } },
                { name: 'Pork Chop', price: 30, mods: { required: ['temp','side'], optional: ['add','no'] } }
            ]},
            sides: { label: 'SIDES', items: [
                { name: 'Fries', price: 6 }, { name: 'Slaw', price: 5 }, { name: 'Rice', price: 5 },
                { name: 'Greens', price: 7 }, { name: 'Mac n Ch', price: 8 }, { name: 'Potato', price: 6 },
                { name: 'Corn', price: 5 }, { name: 'Beans', price: 5 }
            ]}
        }
    },
    drinks: {
        label: 'DRINKS', color: 'blue',
        subcats: {
            cocktails: { label: 'COCKT', items: [
                { name: 'Margarita', price: 14 }, { name: 'Mojito', price: 13 }, { name: 'Martini', price: 15 },
                { name: 'Old Fash', price: 14 }, { name: 'Negroni', price: 13 }, { name: 'Cosmo', price: 13 },
                { name: 'Daiquiri', price: 12 }
            ]},
            beer: { label: 'BEER', items: [
                { name: 'IPA', price: 8 }, { name: 'Lager', price: 7 }, { name: 'Stout', price: 9 },
                { name: 'Wheat', price: 7 }, { name: 'Pilsner', price: 7 }, { name: 'Porter', price: 8 },
                { name: 'Amber', price: 7 }
            ]},
            wine: { label: 'WINE', items: [
                { name: 'Cab Sav', price: 14 }, { name: 'Pinot N', price: 16 }, { name: 'Chard', price: 13 },
                { name: 'Rosé', price: 12 }, { name: 'Malbec', price: 15 }, { name: 'Riesling', price: 12 }
            ]}
        }
    },
    desserts: {
        label: 'DESSERT', color: 'green',
        subcats: {
            cakes: { label: 'CAKES', items: [
                { name: 'Chocolate', price: 10 }, { name: 'Vanilla', price: 9 }, { name: 'Carrot', price: 10 },
                { name: 'RedVelvet', price: 11 }, { name: 'Tiramisu', price: 12 }, { name: 'Cheesecke', price: 11 }
            ]},
            frozen: { label: 'FROZEN', items: [
                { name: 'Gelato', price: 8 }, { name: 'Sorbet', price: 7 }, { name: 'Sundae', price: 10 },
                { name: 'Milkshake', price: 9 }, { name: 'Affogato', price: 11 }
            ]}
        }
    }
};

/**
 * Find a menu item by name — returns { item, color } or null.
 */
export function findMenuItemByName(name) {
    for (const catKey of Object.keys(menu)) {
        for (const subKey of Object.keys(menu[catKey].subcats)) {
            const found = menu[catKey].subcats[subKey].items.find(i => i.name === name);
            if (found) return { item: found, color: menu[catKey].color };
        }
    }
    return null;
}
