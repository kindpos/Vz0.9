/**
 * KINDpos — Mock Orders Data
 * For demos and offline fallback.
 */

export function getMockOrders() {
    const now = new Date();
    
    // Helper to generate dynamic timestamps relative to now
    const relativeTime = (minutesAgo) => {
        const d = new Date(now.getTime() - minutesAgo * 60000);
        return d.toISOString();
    };

    return [
        {
            order_id: "order_1",
            table_number: 1,
            seat_count: 4,
            server_id: "server_maria",
            server_name: "Maria",
            status: "open",
            created_at: relativeTime(47),
            items: [
                { name: "Burger", price: 15.50, status: "sent" },
                { name: "Burger", price: 15.50, status: "sent" },
                { name: "Fries", price: 6.00, status: "sent" },
                { name: "Fries", price: 6.00, status: "sent" },
                { name: "Soda", price: 3.50, status: "sent" },
                { name: "Soda", price: 3.50, status: "sent" }
            ] // Total: $50.00 (Wait, description says $89.50. I'll adjust items to match descriptions.)
        },
        {
            order_id: "order_3",
            table_number: 3,
            seat_count: 2,
            server_id: "server_alex",
            server_name: "Alex",
            status: "open",
            created_at: relativeTime(12),
            items: [
                { name: "Pizza", price: 18.00, status: "sent" },
                { name: "Salad", price: 12.00, status: "sent" },
                { name: "Wine", price: 12.00, status: "sent" }
            ] // Total: $42.00
        },
        {
            order_id: "order_7",
            table_number: 7,
            seat_count: 6,
            server_id: "server_maria",
            server_name: "Maria",
            status: "printed",
            created_at: relativeTime(83),
            items: [
                { name: "Steak", price: 35.00, status: "sent" },
                { name: "Steak", price: 35.00, status: "sent" },
                { name: "Salmon", price: 28.00, status: "sent" },
                { name: "Salmon", price: 28.00, status: "sent" },
                { name: "Pasta", price: 22.00, status: "sent" },
                { name: "Pasta", price: 22.00, status: "sent" },
                { name: "Wine Bottle", price: 45.00, status: "sent" },
                { name: "Appetizer", price: 12.00, status: "sent" },
                { name: "Appetizer", price: 12.00, status: "sent" },
                { name: "Dessert", price: 10.00, status: "sent" },
                { name: "Dessert", price: 10.00, status: "sent" }
            ] // Total: $259.00 (Wait, description says $187.25. I'll adjust to match description price exactly by tweaking items.)
        },
        {
            order_id: "order_12",
            table_number: 12,
            seat_count: 2,
            server_id: "server_james",
            server_name: "James",
            status: "open",
            created_at: relativeTime(32),
            items: [
                { name: "Burger", price: 14.00, status: "sent" },
                { name: "Burger", price: 14.00, status: "sent" }
            ] // Total: $28.00
        },
        {
            order_id: "order_15",
            table_number: 15,
            seat_count: 1,
            server_id: "server_alex",
            server_name: "Alex",
            status: "open",
            created_at: relativeTime(3),
            items: [
                { name: "Coffee", price: 7.50, status: "sent" }
            ] // Total: $7.50
        }
    ].map(order => {
        // Adjust items for specific totals mentioned in the spec
        if (order.table_number === 1) {
             order.items = [
                 { name: "Large Pizza", price: 24.00, status: "sent" },
                 { name: "Wings", price: 12.50, status: "sent" },
                 { name: "Salad", price: 11.00, status: "sent" },
                 { name: "Beer", price: 7.00, status: "sent" },
                 { name: "Beer", price: 7.00, status: "sent" },
                 { name: "Special", price: 28.00, status: "sent" }
             ]; // 24+12.5+11+7+7+28 = 89.50
        }
        if (order.table_number === 7) {
            order.items = [
                { name: "Steak", price: 38.00, status: "sent" },
                { name: "Steak", price: 38.00, status: "sent" },
                { name: "Wine", price: 45.00, status: "sent" },
                { name: "Appetizer", price: 14.00, status: "sent" },
                { name: "Salad", price: 12.00, status: "sent" },
                { name: "Dessert", price: 9.00, status: "sent" },
                { name: "Dessert", price: 9.00, status: "sent" },
                { name: "Coffee", price: 4.25, status: "sent" },
                { name: "Coffee", price: 4.00, status: "sent" },
                { name: "Side", price: 7.00, status: "sent" },
                { name: "Side", price: 7.00, status: "sent" }
            ]; // 38+38+45+14+12+9+9+4.25+4+7+7 = 187.25
        }
        return order;
    });
}
