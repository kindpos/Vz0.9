/**
 * Overseer — Printer Test Scene
 * Retro 80s aesthetic, dark background, mint green accents.
 */

export function register(sm) {
    sm.register('printer_test', {
        onEnter(container) {
            container.innerHTML = `
                <div class="overseer-scene printer-test-scene">
                    <header class="scene-header">
                        <h1 class="orbitron">PRINT TEMPLATE TEST</h1>
                        <div class="status-indicator">
                            <span class="dot green"></span>
                            <span class="status-text">ONLINE</span>
                        </div>
                    </header>

                    <div class="test-controls">
                        <div class="control-group">
                            <label class="space-mono">Printer:</label>
                            <select id="printer-select" class="retro-select">
                                <option value="DEFAULT_RECEIPT">Front Receipt (80mm)</option>
                                <option value="DEFAULT_KITCHEN">Hot Line Kitchen (80mm)</option>
                            </select>
                        </div>

                        <div class="test-grid">
                            <button class="retro-btn" data-template="receipt_dine_in">Guest Receipt — Dine In</button>
                            <button class="retro-btn" data-template="receipt_to_go">Guest Receipt — To Go</button>
                            <button class="retro-btn" data-template="receipt_delivery">Guest Receipt — Delivery</button>
                            <button class="retro-btn" data-template="kitchen_ticket_hot">Kitchen Ticket — Hot Line</button>
                            <button class="retro-btn" data-template="kitchen_ticket_bar">Kitchen Ticket — Bar</button>
                            <button class="retro-btn" data-template="delivery_kitchen">Delivery Kitchen Ticket</button>
                            <button class="retro-btn" data-template="driver_receipt">Driver Receipt</button>
                            <button class="retro-btn" data-template="char_test">Character Test</button>
                        </div>

                        <div class="action-footer">
                            <button class="retro-btn primary" id="print-all">Print All Templates</button>
                            <div class="last-printed space-mono" id="last-printed">
                                Last printed: None
                            </div>
                        </div>
                    </div>

                    <div id="inline-error" class="error-alert hidden">
                        <span class="icon">⚠</span>
                        <span class="message">Printer offline. Job queued.</span>
                    </div>
                </div>
            `;

            this.setupListeners(container);
        },

        setupListeners(container) {
            const buttons = container.querySelectorAll('.test-grid .retro-btn');
            const printerSelect = container.querySelector('#printer-select');
            const lastPrinted = container.querySelector('#last-printed');

            buttons.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const template = btn.dataset.template;
                    const printerMac = printerSelect.value;
                    
                    try {
                        const response = await fetch('/api/v1/print/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ template_name: template, printer_mac: printerMac })
                        });
                        
                        if (response.ok) {
                            const now = new Date().toLocaleTimeString();
                            lastPrinted.textContent = `Last printed: ${btn.textContent}   ${now}`;
                        } else {
                            this.showError("Failed to queue print job.");
                        }
                    } catch (err) {
                        this.showError("Network error.");
                    }
                });
            });

            container.querySelector('#print-all').addEventListener('click', async () => {
                const templates = Array.from(buttons).map(b => b.dataset.template);
                for (const t of templates) {
                    container.querySelector(`[data-template="${t}"]`).click();
                    await new Promise(r => setTimeout(r, 1000));
                }
            });
        },

        showError(msg) {
            const err = document.querySelector('#inline-error');
            if (!err) return;
            err.querySelector('.message').textContent = msg;
            err.classList.remove('hidden');
            setTimeout(() => err.classList.add('hidden'), 5000);
        },

        onExit(container) {
            container.innerHTML = '';
        }
    });
}
