/* ============================================
   KINDpos Overseer - Boot Sequence
   Nice. Dependable. Yours.
   ============================================ */

import { SceneManager } from './components/scene-manager.js';
import { registerSalesReports } from './sections/reporting.js';
import { registerMenuImport } from './sections/menu-import.js';
import { registerEmployeeSections } from './sections/employees.js';
import { registerSystemTesting } from './sections/system-testing.js';
import { registerMenuCategories } from './sections/menu-categories.js';
import { registerMenuAvailability } from './sections/menu-availability.js';
import { registerConfigureModifiers } from './sections/configure-modifiers.js';
import { registerPricingSpecials } from './sections/pricing-specials.js';
import { registerDisplayOrder } from './sections/display-order.js';
import { registerPrinterConfig } from './sections/printer-config.js';
import { registerPrinterSetup } from './sections/printer-setup.js';

/* ------------------------------------------
   NAVIGATION DATA
   All 5 sections and their subcategories
   from the Overseer Navigation Spec.
------------------------------------------ */
const NAV_DATA = {
    sections: [
        {
            id: 'reporting',
            title: 'Reporting',
            subtitle: 'Analytics & Data',
            icon: '📊',
            subs: [
                { id: 'sales-reports',      title: 'Sales Reports',      icon: '💰' },
                { id: 'labor-reports',       title: 'Labor Reports',      icon: '👷' },
                { id: 'menu-performance',    title: 'Menu Performance',   icon: '🍕' },
                { id: 'server-leaderboard',  title: 'Server Leaderboard', icon: '🏆' },
                { id: 'export-excel',        title: 'Export to Excel',    icon: '📊' },
            ]
        },
        {
            id: 'employees',
            title: 'Employees',
            subtitle: 'People & Payroll',
            icon: '👥',
            subs: [
                { id: 'employee-management', title: 'Employee Management', icon: '👤' },
                { id: 'time-attendance',     title: 'Time & Attendance',   icon: '⏰' },
                { id: 'payroll-tips',        title: 'Payroll & Tips',      icon: '💵' },
                { id: 'shift-config',        title: 'Shift Configuration', icon: '🕐' },
            ]
        },
        {
            id: 'menu',
            title: 'Menu',
            subtitle: 'Items & Pricing',
            icon: '📋',
            subs: [
                { id: 'menu-categories',     title: 'Categories & Items',  icon: '📂' },
                { id: 'modifier-groups',     title: 'Modifier Groups',     icon: '🔧' },
                { id: 'pricing-rules',       title: 'Pricing & Specials',  icon: '🏷️' },
                { id: 'import-excel',        title: 'Import from Excel',   icon: '📥' },
                { id: 'menu-availability',   title: 'Availability',        icon: '✅' },
                { id: 'menu-display',        title: 'Display Order',       icon: '↕️' },
            ]
        },
        {
            id: 'hardware',
            title: 'Hardware',
            subtitle: 'Terminals & Network',
            icon: '🖥️',
            subs: [
                { id: 'terminal-management', title: 'Terminal Management', icon: '📱' },
                { id: 'printer-config',      title: 'Printer Configuration', icon: '🖨️' },
                { id: 'payment-devices',     title: 'Payment Devices',    icon: '💳' },
                { id: 'network-status',      title: 'Network Status',     icon: '📡' },
                { id: 'kds-config',          title: 'KDS Configuration',  icon: '🍳' },
                { id: 'system-testing', title: 'System Testing', icon: '🧪' },
            ]
        },
        {
            id: 'settings',
            title: 'Settings',
            subtitle: 'Configuration',
            icon: '⚙️',
            subs: [
                { id: 'restaurant-info',     title: 'Restaurant Info',     icon: '🏪' },
                { id: 'tax-config',          title: 'Tax Configuration',   icon: '📑' },
                { id: 'table-layout',        title: 'Table Layout',        icon: '🪑' },
                { id: 'revenue-centers',     title: 'Revenue Centers',     icon: '🏢' },
                { id: 'receipt-config',      title: 'Receipt Templates',   icon: '🧾' },
                { id: 'security-roles',      title: 'Security & Roles',    icon: '🔒' },
                { id: 'backup-restore',      title: 'Backup & Restore',    icon: '💾' },
                { id: 'system-log',          title: 'System Log',          icon: '📜' },
            ]
        }
    ]
};

/* ------------------------------------------
   SHARED STYLES
   Reusable CSS strings for consistency
------------------------------------------ */
const STYLES = {
    sectionBtn: `
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        padding: 20px 24px;
        background: rgba(198, 255, 187, 0.08);
        border: 1px solid rgba(198, 255, 187, 0.2);
        color: #C6FFBB;
        font-family: var(--font-body);
        font-size: 20px;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
        text-align: left;
    `,
    sectionBtnIcon: `
        font-size: 28px;
        width: 40px;
        text-align: center;
    `,
    sectionBtnText: `
        flex: 1;
    `,
    sectionBtnTitle: `
        font-size: 20px;
        color: #C6FFBB;
    `,
    sectionBtnSub: `
        font-size: 13px;
        color: rgba(198, 255, 187, 0.5);
        margin-top: 2px;
    `,
    sectionBtnArrow: `
        font-size: 18px;
        color: rgba(198, 255, 187, 0.4);
    `,
    subBtn: `
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 16px 20px;
        background: rgba(198, 255, 187, 0.06);
        border: 1px solid rgba(198, 255, 187, 0.15);
        color: #C6FFBB;
        font-family: var(--font-body);
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s ease;
        text-align: left;
    `,
    backBtn: `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: transparent;
        border: 1px solid rgba(198, 255, 187, 0.3);
        color: #C6FFBB;
        font-family: var(--font-body);
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s ease;
        margin-bottom: 20px;
    `,
    heading: `
        font-family: var(--font-display);
        color: #FBDE42;
        margin-bottom: 8px;
    `,
    placeholder: `
        background: rgba(198, 255, 187, 0.06);
        border: 1px solid rgba(198, 255, 187, 0.15);
        border-radius: 4px;
        padding: 30px;
        color: #C6FFBB;
        font-family: var(--font-body);
    `,
};

/* ------------------------------------------
   BOOT
------------------------------------------ */
function init() {
    console.log('%c KINDpos Overseer ', 'background: #333; color: #FBDE42; font-size: 16px; padding: 4px 8px;');
    console.log('%c Nice. Dependable. Yours. ', 'background: #333; color: #C6FFBB; font-size: 12px; padding: 2px 8px;');

    const zones = {
        header:        document.getElementById('overseer-header'),
        hexGrid:       document.getElementById('hex-container'),
        detailScreen:  document.getElementById('detail-screen-container'),
    };

    const missing = Object.entries(zones)
        .filter(([, el]) => !el)
        .map(([name]) => name);

    if (missing.length > 0) {
        console.error(`[Overseer] Missing DOM zones: ${missing.join(', ')}`);
        return;
    }

    console.log('[Overseer] All DOM zones verified.');

    const sm = new SceneManager(zones);

    /* --- MAIN DASHBOARD --- */
    sm.register('main-dashboard', {
        type: 'hex',
        title: 'Main Dashboard',
        onEnter(container) {
            const grid = document.createElement('div');
            grid.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 8px;
                width: 100%;
                max-width: 600px;
                padding: 20px;
            `;

            // Section heading
            const h = document.createElement('div');
            h.style.cssText = STYLES.heading;
            h.style.fontSize = '28px';
            h.style.marginBottom = '16px';
            h.style.textAlign = 'center';
            h.textContent = 'System Dashboard';
            grid.appendChild(h);

            // One button per section
            NAV_DATA.sections.forEach(section => {
                const btn = document.createElement('button');
                btn.style.cssText = STYLES.sectionBtn;
                btn.innerHTML = `
                    <span style="${STYLES.sectionBtnIcon}">${section.icon}</span>
                    <span style="${STYLES.sectionBtnText}">
                        <div style="${STYLES.sectionBtnTitle}">${section.title}</div>
                        <div style="${STYLES.sectionBtnSub}">${section.subtitle}</div>
                    </span>
                    <span style="${STYLES.sectionBtnArrow}">▶</span>
                `;
                btn.addEventListener('click', () => {
                    window._sm.navigateTo(`${section.id}-subs`);
                });
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = 'rgba(198, 255, 187, 0.15)';
                    btn.style.borderColor = 'rgba(198, 255, 187, 0.4)';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.background = 'rgba(198, 255, 187, 0.08)';
                    btn.style.borderColor = 'rgba(198, 255, 187, 0.2)';
                });
                grid.appendChild(btn);
            });

            container.appendChild(grid);
        },
        onExit(container) {
            container.innerHTML = '';
        }
    });

    /* --- SUBCATEGORY SCENES (one per section) --- */
    NAV_DATA.sections.forEach(section => {
        sm.register(`${section.id}-subs`, {
            type: 'hex',
            title: section.title,
            parent: 'main-dashboard',
            onEnter(container) {
                const grid = document.createElement('div');
                grid.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    max-width: 600px;
                    padding: 20px;
                `;

                // Back button
                const back = document.createElement('button');
                back.style.cssText = STYLES.backBtn;
                back.textContent = '← Back to Dashboard';
                back.addEventListener('click', () => window._sm.goBack());
                back.addEventListener('mouseenter', () => {
                    back.style.background = 'rgba(198, 255, 187, 0.1)';
                });
                back.addEventListener('mouseleave', () => {
                    back.style.background = 'transparent';
                });
                grid.appendChild(back);

                // Section heading
                const h = document.createElement('div');
                h.style.cssText = STYLES.heading;
                h.style.fontSize = '24px';
                h.style.marginBottom = '12px';
                h.innerHTML = `${section.icon} ${section.title}`;
                grid.appendChild(h);

                const subtitle = document.createElement('div');
                subtitle.style.cssText = 'color: rgba(198, 255, 187, 0.5); font-size: 14px; margin-bottom: 16px;';
                subtitle.textContent = section.subtitle;
                grid.appendChild(subtitle);

                // One button per subcategory
                section.subs.forEach(sub => {
                    const btn = document.createElement('button');
                    btn.style.cssText = STYLES.subBtn;
                    btn.innerHTML = `
                        <span style="font-size: 22px; width: 36px; text-align: center;">${sub.icon}</span>
                        <span style="flex: 1;">${sub.title}</span>
                        <span style="${STYLES.sectionBtnArrow}">▶</span>
                    `;
                    btn.addEventListener('click', () => {
                        window._sm.navigateTo(sub.id);
                    });
                    btn.addEventListener('mouseenter', () => {
                        btn.style.background = 'rgba(198, 255, 187, 0.12)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.background = 'rgba(198, 255, 187, 0.06)';
                    });
                    grid.appendChild(btn);
                });

                container.appendChild(grid);
            },
            onExit(container) {
                container.innerHTML = '';
            }
        });
    });

    /* --- DETAIL SCENES (one per subcategory) --- */
    NAV_DATA.sections.forEach(section => {
        section.subs.forEach(sub => {
            sm.register(sub.id, {
                type: 'detail',
                title: sub.title,
                parent: `${section.id}-subs`,
                onEnter(container) {
                    container.innerHTML = `
                        <div style="${STYLES.placeholder}">
                            <p style="font-size: 22px; margin-bottom: 12px;">
                                ${sub.icon} ${sub.title}
                            </p>
                            <p style="opacity: 0.6; font-size: 16px; line-height: 1.6;">
                                This section is ready for implementation.<br>
                                Navigation structure is complete.
                            </p>
                            <p style="opacity: 0.3; margin-top: 20px; font-size: 13px;">
                                Parent: ${section.title} → ${sub.title}
                            </p>
                        </div>
                    `;
                },
                onExit(container) {
                    container.innerHTML = '';
                }
            });
        });
    });

    /* --- REAL SECTION SCENES (override placeholders) --- */
    registerSalesReports(sm);
    registerMenuImport(sm);
    registerEmployeeSections(sm);
    registerSystemTesting(sm);
    registerMenuCategories(sm);
    registerMenuAvailability(sm);
    registerConfigureModifiers(sm);
    registerPricingSpecials(sm);
    registerDisplayOrder(sm);
    registerPrinterConfig(sm);
    registerPrinterSetup(sm);

    /* --- EXPOSE & START --- */
    window._sm = sm;
    sm.start('main-dashboard');

    console.log(`[Overseer] Registered ${sm.getSceneCount()} scenes. Ready.`);
}

// Boot on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

