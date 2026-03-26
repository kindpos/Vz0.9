export class CardColumn {
    constructor(cardA, cardB) {
        this.cardA = cardA;
        this.cardB = cardB;
        
        this.cardA.onAction = () => this.handleAction('A');
        this.cardB.onAction = () => this.handleAction('B');
        
        this.el = document.createElement('div');
        this.el.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            height: 100%;
        `;
        this.render();
    }

    handleAction(source) {
        if (source === 'A') {
            if (this.cardA.state === 'expanded') {
                this.cardA.setState('default');
                this.cardB.setState('default');
            } else {
                this.cardA.setState('expanded');
                this.cardB.setState('collapsed');
            }
        } else {
            if (this.cardB.state === 'expanded') {
                this.cardB.setState('default');
                this.cardA.setState('default');
            } else {
                this.cardB.setState('expanded');
                this.cardA.setState('collapsed');
            }
        }
    }

    render() {
        this.el.innerHTML = '';
        this.el.appendChild(this.cardA.render());
        this.el.appendChild(this.cardB.render());
        return this.el;
    }
}
