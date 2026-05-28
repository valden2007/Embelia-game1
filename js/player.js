const player = {
    name: "Ниниэль",
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    strength: 8,
    resonance: 10,
    control: 50,
    trust: 50,                    //  Доверие Вальдену
    intoxication: 0,
    maxIntoxication: 100,
    inventory: ["burnt_drawing"],
    currentLocation: "canyon_ambush",
    isAlive: true,
    isDefending: false,
    hutVisited: false,
    trainingComplete: false,
    ch1Complete: false,
    ointmentGiven: false,         //  Флаг для квеста с мазью
    drawingBurned: false,         //  Флаг для рисунка
    spatialAttacksUsed: 0,        //  Счётчик пространственных атак (для отладки/будущего)

    takeDamage(amount) {
        let dmg = this.isDefending ? Math.floor(amount / 2) : amount;
        this.isDefending = false;
        this.health = Math.max(0, this.health - dmg);
        return this.health <= 0;
    },

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    },

    

    addItem(id) {
        if (!this.inventory.includes(id)) {
            this.inventory.push(id);
            return true;
        }
        return false;
    },

    removeItem(id) {
        const idx = this.inventory.indexOf(id);
        if (idx !== -1) {
            this.inventory.splice(idx, 1);
            return true;
        }
        return false;
    },

    useItem(id) {
        const idx = this.inventory.indexOf(id);
        if (idx === -1) return "Предмет не найден в инвентаре.";
        
        const item = gameData.items[id];
        if (!item) return "Ошибка: предмет не найден в базе данных.";
        
        if (item.type === "potion") {
            if (item.effects) {
                if (item.effects.health) this.heal(item.effects.health);
                if (item.effects.control) this.addControl(item.effects.control);
                if (item.effects.resonance) this.addResonance(item.effects.resonance);
            }
            if (item.intoxication) this.addIntoxication(item.intoxication);
            this.inventory.splice(idx, 1);
            return `💧 Вы выпили ${item.name}. ${item.description}`;
        }
        
        return `📜 ${item.name} — важный предмет. Его нельзя использовать напрямую.`;
    },

    addIntoxication(amount) {
        this.intoxication = Math.min(this.maxIntoxication, this.intoxication + amount);
        if (this.intoxication >= 70 && this.intoxication < 90) {
            this.control = Math.max(0, this.control - 3);
            if (typeof UI !== 'undefined' && UI.log) {
                UI.log('🍷 Голова тяжелеет... Контроль снижен (-3).', 'combat');
            }
        } else if (this.intoxication >= 90) {
            this.control = Math.max(0, this.control - 5);
            this.resonance = Math.min(100, this.resonance + 2);
            if (typeof UI !== 'undefined' && UI.log) {
                UI.log('⚠️ ИНТОКСИКАЦИЯ КРИТИЧЕСКАЯ! Контроль падает, Резонанс нестабилен!', 'combat');
            }
        }
        setTimeout(() => {
            if (this.intoxication > 0) {
                this.intoxication = Math.max(0, this.intoxication - 1);
                if (typeof UI !== 'undefined') UI.updateStatus();
            }
        }, 30000);
    },

    addResonance(amount) {
        this.resonance = Math.max(0, Math.min(100, this.resonance + amount));
        
        //  ЛОГИКА: если резонанс > 70, контроль начинает падать
        if (this.resonance > 70) {
            this.control = Math.max(0, this.control - Math.abs(amount));
        }
        
        //  ОТЛАДКА: считаем пространственные атаки (если нужно)
        if (amount === 15) {
            this.spatialAttacksUsed++;
        }
    },

    addControl(amount) {
        this.control = Math.max(0, Math.min(100, this.control + amount));
        if (this.control > 70) {
            this.resonance = Math.max(0, this.resonance - Math.floor(amount / 2));
        }
    },

    addTrust(amount) {
        this.trust = Math.max(0, Math.min(100, this.trust + amount));
        return this.trust;
    },

    getTrust() {
        return this.trust;
    },

    isDead() {
        return this.health <= 0;
    },

    //  ПРОВЕРКА ПЛОХОЙ КОНЦОВКИ: 90% резонанса = потеря контроля
    checkBadEnding() {
        return this.resonance >= 90 || this.intoxication >= 95 || this.health <= 0;
    },

    //  ВСПОМОГАТЕЛЬНЫЙ МЕТОД: получить текущий уровень резонанса
    getResonance() {
        return this.resonance;
    },

    //  ВСПОМОГАТЕЛЬНЫЙ МЕТОД: получить текущий уровень контроля
    getControl() {
        return this.control;
    },

    getStatus() {
        return { ...this };
    }
};

window.player = player;
