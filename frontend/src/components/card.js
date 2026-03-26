export class Card {
    constructor(id, options = {}) {
        this.id = id;
        this.title = options.title || '';
        this.state = options.state || 'default'; // 'collapsed', 'default', 'expanded'
        this.onAction = options.onAction || null; // Callback for [+]/[-]
        this.renderDefault = options.renderDefault || (() => document.createElement('div'));
        this.renderExpanded = options.renderExpanded || this.renderDefault;
        this.renderCollapsed = options.renderCollapsed || (() => document.createElement('div'));
        this.actionLabel = options.actionLabel || '+';
        
        this.el = document.createElement('div');
        this.el.className = `card ${this.state}`;
        this.el.dataset.cardId = id;
        this.updateStyles();
    }

    updateStyles() {
        this.el.style.cssText = `
            border: 2px solid #C6FFBB;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #333333;
            transition: all 0.2s ease-in-out;
            border-radius: 8px;
            ${this.state === 'expanded' ? 'flex: 1;' : ''}
            ${this.state === 'collapsed' ? 'min-height: 27px; flex: 0 0 27px;' : ''}
            ${this.state === 'default' ? 'min-height: 165px; flex: 0 0 165px;' : ''}
        `;
    }

    setState(newState) {
        this.state = newState;
        this.el.className = `card ${this.state}`;
        this.updateStyles();
        this.render();
    }

    render() {
        this.el.innerHTML = '';
        
        // Header
        const header = document.createElement('div');
        header.className = 'card-header';
        header.style.cssText = `
            background: #C6FFBB;
            color: #333333;
            font-family: 'Alien Encounters Solid Bold', sans-serif;
            padding: 4px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 27px;
            cursor: pointer;
            box-sizing: border-box;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
        `;
        
        const titleEl = document.createElement('div');
        titleEl.textContent = this.title;
        titleEl.style.fontSize = 'var(--font-size-card-header)';
        header.appendChild(titleEl);
        
        const actionBtn = document.createElement('div');
        actionBtn.className = 'card-action-btn';
        actionBtn.textContent = this.state === 'expanded' ? '-' : '+';
        actionBtn.style.cssText = `
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `;
        
        header.onclick = () => {
            if (this.onAction) {
                this.onAction(this);
            }
        };
        
        header.appendChild(actionBtn);
        this.el.appendChild(header);

        // Content
        if (this.state !== 'collapsed') {
            const content = document.createElement('div');
            content.className = 'card-content';
            content.style.cssText = `
                background: #333333;
                color: #C6FFBB;
                font-family: 'Sevastopol Interface', sans-serif;
                flex: 1;
                padding: 8px;
                overflow: hidden;
                box-sizing: border-box;
            `;
            
            const innerContent = this.state === 'expanded' ? this.renderExpanded() : this.renderDefault();
            content.appendChild(innerContent);
            this.el.appendChild(content);
        }

        return this.el;
    }
}
