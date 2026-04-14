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
    intoxication: 0,           // ✅ НОВАЯ МЕХАНИКА: Интоксикация от зелий
    maxIntoxication: 100,
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

    // ✅ ОБНОВЛЁННЫЙ МЕТОД ИСПОЛЬЗОВАНИЯ ПРЕДМЕТОВ
    useItem(id) {
        const idx = this.inventory.indexOf(id);
        if (idx === -1) return "Предмет не найден в инвентаре.";
        
        const item = gameData.items[id];
        if (!item) return "Ошибка: предмет не найден в базе данных.";
        
        // Если это зелье
        if (item.type === "potion") {
            // Применяем эффекты
            if (item.effects) {
                if (item.effects.health) this.heal(item.effects.health);
                if (item.effects.mana) this.restoreMana(item.effects.mana);
                if (item.effects.control) this.addControl(item.effects.control);
                if (item.effects.resonance) this.addResonance(item.effects.resonance);
            }
            // ✅ Добавляем интоксикацию
            if (item.intoxication) this.addIntoxication(item.intoxication);
            
            // Удаляем предмет после использования
            this.inventory.splice(idx, 1);
            return `💧 Вы выпили ${item.name}. ${item.description}`;
        }
        
        // Квестовые предметы и травы пока нельзя использовать напрямую
        return `📜 ${item.name} — важный предмет. Его нельзя использовать напрямую.`;
    },

    // ✅ НОВАЯ МЕХАНИКА: Интоксикация
    addIntoxication(amount) {
        this.intoxication = Math.min(this.maxIntoxication, this.intoxication + amount);
        
        // Негативные эффекты при высокой интоксикации
        if (this.intoxication >= 70 && this.intoxication < 90) {
            this.control = Math.max(0, this.control - 3);
            if (typeof UI !== 'undefined' && UI.log) {
                UI.log('🍷 Голова тяжелеет... Контроль снижен (-3).', 'combat');
            }
        } else if (this.intoxication >= 90) {
            this.control = Math.max(0, this.control - 5);
            this.resonance = Math.min(100, this.resonance + 2); // Риск пробуждения силы
            if (typeof UI !== 'undefined' && UI.log) {
                UI.log('⚠️ ИНТОКСИКАЦИЯ КРИТИЧЕСКАЯ! Контроль падает, Резонанс нестабилен!', 'combat');
            }
        }
        
        // Постепенное снижение интоксикации со временем
        setTimeout(() => {
            if (this.intoxication > 0) {
                this.intoxication = Math.max(0, this.intoxication - 1);
                if (typeof UI !== 'undefined') UI.updateStatus();
            }
        }, 30000); // -1 каждые 30 секунд
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
        // Плохая концовка наступает при высоком резонансе ИЛИ критической интоксикации
        return this.resonance >= 90 || this.intoxication >= 95;
    },

    getStatus() {
        return { ...this };
    }
};

window.player = player;    