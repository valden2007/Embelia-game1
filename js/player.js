const player = {
    name: "Ниниэль",
    level: 1,
    experience: 0,
    health: 80,
    maxHealth: 100,
    mana: 40,
    maxMana: 50,
    strength: 8,
    resonance: 10,
    control: 50,
    inventory: ["burnt_drawing"],
    currentLocation: "canyon_ambush",
    isAlive: true,
    isDefending: false,
    hutVisited: false,
    trainingComplete: false,
    ch1Complete: false,

    takeDamage(amount) {
        let dmg = this.isDefending ? Math.floor(amount / 2) : amount;
        this.isDefending = false;
        this.health = Math.max(0, this.health - dmg);
        return this.health <= 0;
    },

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    },

    restoreMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
    },

    addItem(id) {
        if (!this.inventory.includes(id)) {
            this.inventory.push(id);
            return true;
        }
        return false;
    },

    useItem(id) {
        const idx = this.inventory.indexOf(id);
        if (idx === -1) return "Предмет не найден.";
        const item = gameData.items[id];
        if (!item) return "Ошибка: предмет не найден.";
        
        if (item.effect === "health_restore") {
            this.heal(item.value);
            this.inventory.splice(idx, 1);
            return `Вы использовали ${item.name}. Здоровье восстановлено.`;
        }
        if (item.effect === "mana_restore") {
            this.restoreMana(item.value);
            this.inventory.splice(idx, 1);
            return `Вы использовали ${item.name}. Мана восстановлена.`;
        }
        return "Нельзя использовать.";
    },

    addResonance(amount) {
        this.resonance = Math.max(0, Math.min(100, this.resonance + amount));
        if (this.resonance > 70) {
            this.control = Math.max(0, this.control - Math.abs(amount));
        }
    },

    addControl(amount) {
        this.control = Math.max(0, Math.min(100, this.control + amount));
        if (this.control > 70) {
            this.resonance = Math.max(0, this.resonance - Math.floor(amount / 2));
        }
    },

    checkBadEnding() {
        return this.resonance >= 90;
    },

    getStatus() {
        return { ...this };
    }
};

window.player = player;