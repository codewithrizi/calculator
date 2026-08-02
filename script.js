class LiquidGlassCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.expression = document.getElementById('expression');
        this.historyList = document.getElementById('history-list');
        
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.resetDisplay = false;
        this.history = [];

        this.initEventListeners();
    }

    initEventListeners() {
        // Handle all keypad button clicks
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const number = btn.dataset.number;

                if (number !== undefined) this.appendNumber(number);
                if (action) this.handleAction(action);
                
                this.updateDisplay();
            });
        });

        // Handle physical keyboard typing
        window.addEventListener('keydown', (e) => this.handleKeyboardInput(e));

        // History overlay drawer - open
        document.getElementById('history-toggle').addEventListener('click', () => {
            document.getElementById('history-panel').classList.add('active');
        });

        // History overlay drawer - close (X button)
        document.getElementById('history-close').addEventListener('click', () => {
            document.getElementById('history-panel').classList.remove('active');
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.history = [];
            this.renderHistory();
        });

        // Color theme accent switcher
        const themes = ['default', 'cyan', 'emerald'];
        let currentThemeIdx = 0;
        document.getElementById('theme-toggle').addEventListener('click', () => {
            currentThemeIdx = (currentThemeIdx + 1) % themes.length;
            const theme = themes[currentThemeIdx];
            if (theme === 'default') {
                document.body.removeAttribute('data-theme');
            } else {
                document.body.setAttribute('data-theme', theme);
            }
        });
    }

    appendNumber(number) {
        if (this.currentValue === '0' || this.resetDisplay) {
            this.currentValue = number === '.' ? '0.' : number;
            this.resetDisplay = false;
        } else {
            if (number === '.' && this.currentValue.includes('.')) return;
            if (this.currentValue.length >= 12) return;
            this.currentValue += number;
        }
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.currentValue = '0';
                this.previousValue = '';
                this.operation = null;
                break;
            case 'delete':
                if (this.currentValue.length === 1 || (this.currentValue.length === 2 && this.currentValue.startsWith('-'))) {
                    this.currentValue = '0';
                } else {
                    this.currentValue = this.currentValue.slice(0, -1);
                }
                break;
            case 'percent':
                this.currentValue = (parseFloat(this.currentValue) / 100).toString();
                break;
            case 'negate':
                this.currentValue = (parseFloat(this.currentValue) * -1).toString();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                this.setOperation(action);
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    setOperation(op) {
        if (this.operation && !this.resetDisplay) {
            this.calculate();
        }
        this.previousValue = this.currentValue;
        this.operation = op;
        this.resetDisplay = true;
    }

    getOpSymbol(op) {
        const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
        return symbols[op] || '';
    }

    calculate() {
        if (!this.operation || !this.previousValue) return;

        const prev = parseFloat(this.previousValue);
        const curr = parseFloat(this.currentValue);
        let result = 0;

        switch (this.operation) {
            case 'add': result = prev + curr; break;
            case 'subtract': result = prev - curr; break;
            case 'multiply': result = prev * curr; break;
            case 'divide': 
                if (curr === 0) {
                    alert("Cannot divide by zero");
                    return;
                }
                result = prev / curr; 
                break;
        }

        const exprText = `${this.previousValue} ${this.getOpSymbol(this.operation)} ${this.currentValue}`;
        this.currentValue = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
        
        this.history.unshift({ expr: exprText, res: this.currentValue });
        this.renderHistory();

        this.previousValue = '';
        this.operation = null;
        this.resetDisplay = true;
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
        if (this.operation) {
            this.expression.textContent = `${this.previousValue} ${this.getOpSymbol(this.operation)}`;
        } else {
            this.expression.textContent = '';
        }
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="empty-history">No calculations yet</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.expr}</div>
                <div style="font-size: 1.2rem; font-weight: 600;">= ${item.res}</div>
            </div>
        `).join('');
    }

    handleKeyboardInput(e) {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') this.appendNumber(e.key);
        if (e.key === '+') this.setOperation('add');
        if (e.key === '-') this.setOperation('subtract');
        if (e.key === '*') this.setOperation('multiply');
        if (e.key === '/') this.setOperation('divide');
        if (e.key === 'Enter' || e.key === '=') this.calculate();
        if (e.key === 'Backspace') this.handleAction('delete');
        if (e.key === 'Escape') this.handleAction('clear');
        this.updateDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LiquidGlassCalculator();
});
