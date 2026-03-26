/**
 * KINDpos — API Bridge
 * Handles communication with the unified FastAPI backend.
 */

import S from '../stores/state.js';
import { getMockOrders } from '../data/mock-orders.js';

const API_BASE = 'http://localhost:8000/api/v1';

export async function fetchActiveOrders() {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE}/orders/active`, { signal: controller.signal });
        if (!res.ok) throw new Error(res.statusText);
        const orders = await res.json();
        S.offlineMode = false;
        return orders;
    } catch (e) {
        console.warn('API Error, falling back to mock orders:', e);
        S.offlineMode = true;
        return getMockOrders();
    }
}

export async function createOrder({ table_number, seat_count, server_id }) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_number, seat_count, server_id }),
            signal: controller.signal
        });
        if (!res.ok) throw new Error(res.statusText);
        S.offlineMode = false;
        return await res.json();
    } catch (e) {
        console.warn('API Error creating order, using local mock:', e);
        // Do NOT set S.offlineMode = true here per spec? 
        // Spec says "On failure (offline), generates a local order... and returns it."
        // Spec for fetchActiveOrders explicitly says to set S.offlineMode.
        // It's safer to keep offlineMode state in sync if POST fails too.
        S.offlineMode = true; 
        return {
            order_id: 'local_' + Date.now(),
            table_number,
            seat_count,
            server_id,
            server_name: S.server?.name || 'Local',
            status: 'open',
            created_at: new Date().toISOString(),
            items: []
        };
    }
}

export async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error('Failed to fetch menu');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

export async function sendOrder(order) {
    // Phase 3 implementation: send order events to backend
    console.log('Sending order to backend:', order);
}
