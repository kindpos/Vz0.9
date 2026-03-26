/* ============================================
   KINDpos Overseer - Sample Printer Data
   Mock data for Printer Setup scene development.
   Represents a typical small restaurant setup
   (modeled after Limoncello Naples).

   "Nice. Dependable. Yours."
   ============================================ */

export const SAMPLE_PRINTERS = [
    {
        id: 'printer_001',
        model: 'Epson TM-T88VI',
        manufacturer: 'Epson',
        connection_type: 'network',
        ip_address: '192.168.1.50',
        mac_address: 'AA:BB:CC:DD:EE:01',
        port: 9100,
        role: 'receipt',
        location: 'Front Counter',
        status: 'online',
        settings: {
            auto_cut: true,
            paper_width: '80mm',
            print_speed: 'normal'
        },
        capabilities: {
            has_cutter: true,
            has_cash_drawer: true,
            supports_logo: true
        },
        last_test: '2026-02-12T10:45:00Z',
        last_seen: '2026-02-12T11:30:00Z',
        created_at: '2026-02-10T08:00:00Z',
        uptime_days: 2
    },
    {
        id: 'printer_002',
        model: 'Epson TM-U220B',
        manufacturer: 'Epson',
        connection_type: 'network',
        ip_address: '192.168.1.51',
        mac_address: 'AA:BB:CC:DD:EE:02',
        port: 9100,
        role: 'kitchen',
        location: 'Hot Line',
        status: 'online',
        settings: {
            auto_cut: true,
            paper_width: '80mm',
            print_speed: 'fast'
        },
        capabilities: {
            has_cutter: true,
            has_cash_drawer: false,
            supports_logo: false
        },
        last_test: '2026-02-12T10:46:00Z',
        last_seen: '2026-02-12T11:30:00Z',
        created_at: '2026-02-10T08:05:00Z',
        uptime_days: 2
    },
    {
        id: 'printer_003',
        model: 'Volcora WRP-208',
        manufacturer: 'Volcora',
        connection_type: 'network',
        ip_address: '192.168.1.52',
        mac_address: 'AA:BB:CC:DD:EE:03',
        port: 9100,
        role: 'bar',
        location: 'Main Bar',
        status: 'online',
        settings: {
            auto_cut: true,
            paper_width: '80mm',
            print_speed: 'normal'
        },
        capabilities: {
            has_cutter: true,
            has_cash_drawer: false,
            supports_logo: true
        },
        last_test: '2026-02-12T09:30:00Z',
        last_seen: '2026-02-12T11:30:00Z',
        created_at: '2026-02-11T14:00:00Z',
        uptime_days: 1
    },
    {
        id: 'printer_004',
        model: 'Epson TM-T88VI',
        manufacturer: 'Epson',
        connection_type: 'network',
        ip_address: '192.168.1.53',
        mac_address: 'AA:BB:CC:DD:EE:04',
        port: 9100,
        role: 'expo',
        location: 'Expo Window',
        status: 'offline',
        settings: {
            auto_cut: true,
            paper_width: '80mm',
            print_speed: 'normal'
        },
        capabilities: {
            has_cutter: true,
            has_cash_drawer: false,
            supports_logo: true
        },
        last_test: null,
        last_seen: '2026-02-12T08:15:00Z',
        created_at: '2026-02-11T14:30:00Z',
        uptime_days: 0
    }
];

export const SAMPLE_NETWORK = {
    gateway: {
        ip: '192.168.1.1',
        mac: '00:11:22:33:44:55',
        manufacturer: 'Netgear'
    },
    subnet: '192.168.1.0/24',
    dhcp_range: {
        start: '192.168.1.100',
        end: '192.168.1.200'
    }
};

/* Role color definitions - shared across components */
export const ROLE_COLORS = {
    kitchen:    '#FF6B35',
    receipt:    '#4ECDC4',
    bar:        '#A855F7',
    expo:       '#FFD23F',
    dessert:    '#FF85A2',
    unassigned: '#666666'
};

export const ROLE_OPTIONS = [
    { value: 'kitchen',    label: 'Kitchen',    color: '#FF6B35' },
    { value: 'receipt',    label: 'Receipt',    color: '#4ECDC4' },
    { value: 'bar',        label: 'Bar',        color: '#A855F7' },
    { value: 'expo',       label: 'Expo',       color: '#FFD23F' },
    { value: 'dessert',    label: 'Dessert',    color: '#FF85A2' },
    { value: 'unassigned', label: 'Unassigned', color: '#666666' }
];

export const STATUS_COLORS = {
    online:  '#00FF88',
    offline: '#FF4444',
    testing: '#FFA500'
};