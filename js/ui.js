// js/ui.js
// Модуль управления интерфейсом игры "Проклятие Алатар"
const UI = {
    // === ЭЛЕМЕНТЫ DOM ===
    elements: {
        log: null,
        locationName: null,
        healthBar: null,
        healthText: null,
        manaBar: null,
        manaText: null,
        levelText: null,
        resonanceText: null,
        controlText: null,
        actionButtons: null,
        inventoryList: null,
        modal: null,
        modalTitle: null,
        modalMessage: null,
        modalClose: null,
        gameContainer: null
    },

    // === ПОЛУЧЕНИЕ ИГРОКА (Безопасный доступ к global window.player) ===
    getPlayer() {
        if (typeof window.player !== 'undefined') return window.player;
        return null;
    },

    // === ИНИЦИАЛИЗАЦИЯ ===
    init() {
        // Получаем ссылки на элементы HTML
        this.elements = {
            log: document.getElementById('game-log'),
            locationName: document.getElementById('location-name'),
            healthBar: document.getElementById('health-bar'),
            healthText: document.getElementById('health-text'),
            manaBar: document.getElementById('mana-bar'),
            manaText: document.getElementById('mana-text'),
            levelText: document.getElementById('level-text'),
            resonanceText: document.getElementById('corruption-text'),
            controlText: document.getElementById('control-text'),
            actionButtons: document.getElementById('action-buttons'),
            inventoryList: document.getElementById('inventory-list'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalClose: document.getElementById('modal-close'),
            gameContainer: document.querySelector('.game-container')
        };

        // Проверка критических элементов
        if (!this.elements.log || !this.elements.actionButtons) {
            console.error('❌ Критические элементы интерфейса не найдены!');
            return false;
        }

        // Обработчик закрытия модального окна
        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => this.hideModal());
        }
        
        // Закрытие по клику на фон
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.hideModal();
                }
            });
        }

        console.log('✅ UI модуль инициализирован');
        return true;
    },

    // === ВЫВОД СООБЩЕНИЙ В ЛОГ ===
    log(message, type = 'system') {
        if (!this.elements.log) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<p>${message}</p>`;
        
        // Анимация появления
        entry.style.opacity = '0';
        this.elements.log.appendChild(entry);
        
        setTimeout(() => {
            entry.style.transition = 'opacity 0.5s ease';
            entry.style.opacity = '1';
        }, 50);

        // Автопрокрутка вниз
        this.elements.log.scrollTop = this.elements.log.scrollHeight;
    },

    // === ОБНОВЛЕНИЕ СТАТУСОВ ПЕРСОНАЖА ===
    updateStatus() {
        const p = this.getPlayer();
        if (!p) return;

        // 1. Здоровье (Health)
        if (this.elements.healthBar && this.elements.healthText) {
            const hpPercent = Math.max(0, Math.min(100, (p.health / p.maxHealth) * 100));
            this.elements.healthBar.style.width = `${hpPercent}%`;
            this.elements.healthText.textContent = `${p.health}/${p.maxHealth}`;
            
            // Цвет меняется при низком HP
            if (hpPercent < 30) {
                this.elements.healthBar.style.background = 'linear-gradient(90deg, #8b0000, #ff0000)';
            } else {
                this.elements.healthBar.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
            }
        }

        // 2. Мана (Mana)
        if (this.elements.manaBar && this.elements.manaText) {
            const mpPercent = Math.max(0, Math.min(100, (p.mana / p.maxMana) * 100));
            this.elements.manaBar.style.width = `${mpPercent}%`;
            this.elements.manaText.textContent = `${p.mana}/${p.maxMana}`;
        }

        // 3. Уровень (Level)
        if (this.elements.levelText) {
            this.elements.levelText.textContent = p.level;
        }

        // 4. РЕЗОНАНС (Ранее Коррупция) - Шкала силы Алатар
        if (this.elements.resonanceText) {
            this.elements.resonanceText.textContent = `🌀 ${p.resonance}%`;
             
            // Цвет зависит от уровня опасности
            if (p.resonance >= 90) {
                this.elements.resonanceText.style.color = '#ff0000'; // Критично (плохая концовка)
                this.elements.resonanceText.title = "⚠️ КРИТИЧЕСКИЙ РЕЗОНАНС! Риск плохой концовки!";
            } else if (p.resonance > 60) {
                this.elements.resonanceText.style.color = '#ffa500'; // Средне
            } else {
                this.elements.resonanceText.style.color = '#00ff00'; // Безопасно
            }
        }

        // 5. КОНТРОЛЬ - Способность управлять силой
        if (this.elements.controlText) {
            this.elements.controlText.textContent = `⚡ ${p.control}%`;
            this.elements.controlText.style.color = p.control > 70 ? '#00ff00' : (p.control < 30 ? '#ff0000' : '#ffa500');
        }
    },

    // === ОБНОВЛЕНИЕ НАЗВАНИЯ ЛОКАЦИИ ===
    updateLocation(location) {
        if (!this.elements.locationName) return;
        
        // Принимаем и строку, и объект
        const name = (typeof location === 'object' && location.name) ? location.name : location;
        
        if (name) {
            this.elements.locationName.textContent = name;
            this.elements.locationName.style.opacity = '0';
            setTimeout(() => {
                this.elements.locationName.style.transition = 'opacity 0.5s ease';
                this.elements.locationName.style.opacity = '1';
            }, 50);
        }
    },

    // === ОТРИСОВКА КНОПОК ДЕЙСТВИЙ ===
    renderButtons(actions) {
        if (!this.elements.actionButtons) return;

        // Очистка старых кнопок
        this.elements.actionButtons.innerHTML = '';

        if (!Array.isArray(actions) || actions.length === 0) return;

        actions.forEach((action, index) => {
            if (!action || !action.label || !action.handler) return;

            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = action.label;
            btn.onclick = action.handler;

            if (action.disabled) {
                btn.disabled = true;
                btn.classList.add('disabled');
            }

            // Анимация появления
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(10px)';
            this.elements.actionButtons.appendChild(btn);

            setTimeout(() => {
                btn.style.transition = 'all 0.3s ease';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, index * 50);
        });
    },

    // === ОТРИСОВКА ИНВЕНТАРЯ ===
    renderInventory() {
        if (!this.elements.inventoryList) return;
        this.elements.inventoryList.innerHTML = '';

        const p = this.getPlayer();
        if (!p || p.inventory.length === 0) {
            this.elements.inventoryList.innerHTML = '<p class="empty-message">Пусто...</p>';
            return;
        }

        p.inventory.forEach((itemId, index) => {
            // Ищем предмет в базе данных
            const item = gameData.items[itemId];
            if (!item) return;

            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `<strong>${item.name}</strong><br><small>${item.description || item.effect}</small>`;
            
            // При клике пытаемся использовать предмет
            div.onclick = () => {
                if (typeof Game !== 'undefined' && Game.useItem) {
                    Game.useItem(itemId);
                }
            };

            div.style.opacity = '0';
            this.elements.inventoryList.appendChild(div);

            setTimeout(() => {
                div.style.transition = 'all 0.3s ease';
                div.style.opacity = '1';
            }, index * 50);
        });
    },

    // === МОДАЛЬНЫЕ ОКНА ===
    showModal(title, message) {
        if (!this.elements.modal) return;
        if (this.elements.modalTitle) this.elements.modalTitle.textContent = title;
        if (this.elements.modalMessage) this.elements.modalMessage.textContent = message;
        
        this.elements.modal.classList.remove('hidden');
        this.elements.modal.style.opacity = '0';
        setTimeout(() => {
            this.elements.modal.style.transition = 'opacity 0.3s ease';
            this.elements.modal.style.opacity = '1';
        }, 10);
    },

    hideModal() {
        if (!this.elements.modal) return;
        this.elements.modal.style.opacity = '0';
        setTimeout(() => {
            this.elements.modal.classList.add('hidden');
        }, 300);
    },

    // === ЭФФЕКТЫ (Вспышка, Затемнение) ===
    flashScreen() {
        if (!this.elements.gameContainer) return;
        this.elements.gameContainer.style.animation = 'flash 0.5s ease';
        setTimeout(() => { this.elements.gameContainer.style.animation = ''; }, 500);
    },

    fadeScreen(direction) {
        if (!this.elements.gameContainer) return;
        if (direction === 'out') {
            this.elements.gameContainer.style.opacity = '0';
            this.elements.gameContainer.style.transition = 'opacity 2s ease';
            this.elements.gameContainer.style.pointerEvents = 'none';
        } else {
            this.elements.gameContainer.style.opacity = '1';
            this.elements.gameContainer.style.transition = 'opacity 2s ease';
            this.elements.gameContainer.style.pointerEvents = 'all';
        }
    },

    clearLog() {
        if (this.elements.log) this.elements.log.innerHTML = '';
    },

    scrollToBottom() {
        if (this.elements.log) this.elements.log.scrollTop = this.elements.log.scrollHeight;
    },

    // === МИНИ-ИГРА: ЛОВЛЯ ЧАСТИЦ СВЕТА (Обучение с Вальденом) ===
    showParticleGame(onComplete) {
        console.log('🎮 Запуск мини-игры с частицами...');
        
        // Создаём контейнер, если нет
        let gameArea = document.getElementById('particle-game-area');
        if (!gameArea) {
            gameArea = document.createElement('div');
            gameArea.id = 'particle-game-area';
            gameArea.style.cssText = 'margin:20px 0; text-align:center; padding:20px; background:rgba(20,20,40,0.95); border-radius:15px; border:2px solid #9d4edd; position:relative; min-height:350px;';
            
            const actionsPanel = document.querySelector('.actions-panel');
            if (actionsPanel && actionsPanel.parentNode) {
                actionsPanel.parentNode.insertBefore(gameArea, actionsPanel);
            } else {
                const log = document.getElementById('game-log');
                if (log && log.parentNode) {
                    log.parentNode.insertBefore(gameArea, log.nextSibling);
                }
            }
        }
        
        gameArea.style.display = 'block';
        gameArea.innerHTML = `
            <h3 style="color:#ffd700; margin:0 0 15px 0; font-family:'Cormorant Garamond',serif; font-size:1.5em;">✨ Гармония Стихий ✨</h3>
            <p style="color:#b0b0b0; margin:0 0 20px 0; font-size:0.95em;">Лови частицы чистого Света (Белые/Золотые).<br>Избегай Тьмы (Фиолетовые).<br>Набери 100% гармонии!</p>
            <div id="particle-container" style="position:relative; height:250px; background:rgba(0,0,0,0.8); border-radius:12px; overflow:hidden; border:2px solid #4a4a6a; margin-bottom:20px; box-shadow:inset 0 0 20px rgba(157,78,221,0.3);"></div>
            <div style="display:flex; justify-content:space-around; flex-wrap:wrap; gap:15px; color:#e0e0e0; font-size:1.1em; font-weight:bold;">
                <span style="color:#ffd700;">⚖️ Гармония: <span id="pg-harmony">0</span>%</span>
                <span style="color:#4b0082;">🌑 Хаос: <span id="pg-chaos">0</span>%</span>
            </div>
            <button id="particle-game-close" style="margin-top:15px; padding:10px 25px; background:#4a4a6a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1em;">Закрыть</button>
        `;

        const container = document.getElementById('particle-container');
        const harmonyEl = document.getElementById('pg-harmony');
        const chaosEl = document.getElementById('pg-chaos');
        const closeBtn = document.getElementById('particle-game-close');

        // Кнопка закрытия
        if (closeBtn) {
            closeBtn.onclick = () => {
                gameArea.style.display = 'none';
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            };
        }

        // Настройки частиц
        const elements = {
            light: { name: "Свет", color: "#ffd700", glow: "0 0 15px #ffd700", type: "good", bonus: 12, message: "✨ Чистый свет! Посох отзывается теплом." },
            water: { name: "Вода", color: "#1E90FF", glow: "0 0 15px #1E90FF", type: "good", bonus: 10, message: "💧 Глубина и покой." },
            dark:  { name: "Тьма", color: "#4b0082", glow: "0 0 15px #4b0082", type: "bad", penalty: 18, message: "🌑 Тёмная энергия! Хаос растёт." }
        };

        let harmony = 0;
        let chaos = 0;
        let particles = [];
        let spawnInterval;
        let gameActive = true;
        let animationId;

        function createParticle() {
            if (!gameActive || !container) return;
            
            // Вероятности: Свет чаще, Тьма реже
            const rand = Math.random();
            let key;
            if (rand < 0.45) key = 'light';      // 45% Свет
            else if (rand < 0.75) key = 'water'; // 30% Вода
            else key = 'dark';                   // 25% Тьма

            const cfg = elements[key];
            const size = 20 + Math.random() * 15; 
            const particle = document.createElement('div');
            
            particle.style.cssText = `
                position:absolute; width:${size}px; height:${size}px; 
                background:radial-gradient(circle, ${cfg.color} 30%, transparent 70%); 
                border-radius:50%; left:${Math.random() * (container.offsetWidth - size)}px; top:-${size}px;
                cursor:pointer; box-shadow:${cfg.glow}; transition:transform 0.15s; z-index:10;
            `;
            particle.dataset.type = key;
            
            particle.onmouseenter = () => {
                if (!gameActive) return;
                particle.style.transform = 'scale(1.5)';
            };
            
            particle.onmouseleave = () => {
                if (!gameActive) return;
                particle.style.transform = 'scale(1)';
            };
            
            particle.onclick = () => {
                if (!gameActive) return;
                
                particle.style.transform = 'scale(2)';
                particle.style.opacity = '0';
                setTimeout(() => {
                    if (particle.parentNode) particle.remove();
                }, 150);
                
                if (cfg.type === 'good') {
                    harmony = Math.min(100, harmony + cfg.bonus);
                    UI.log(cfg.message, 'item');
                } else {
                    chaos = Math.min(100, chaos + cfg.penalty);
                    UI.log(cfg.message, 'combat');
                }
                
                if (harmonyEl) harmonyEl.textContent = harmony;
                if (chaosEl) chaosEl.textContent = chaos;
                checkEndGame();
            };
            
            container.appendChild(particle);
            particles.push({ el: particle, speed: 1.5 + Math.random() * 2, drift: (Math.random() - 0.5) * 0.8 });
        }

        function animate() {
            if (!gameActive || !container) return;
            
            particles.forEach((p, index) => {
                if (!p.el || !p.el.parentNode) {
                    particles.splice(index, 1);
                    return;
                }
                
                const top = parseFloat(p.el.style.top) || 0;
                const left = parseFloat(p.el.style.left) || 0;
                
                p.el.style.top = (top + p.speed) + 'px';
                p.el.style.left = (left + p.drift) + 'px';
                
                if (top > container.offsetHeight) {
                    if (p.el.parentNode) p.el.remove();
                    particles.splice(index, 1);
                }
            });
            
            animationId = requestAnimationFrame(animate);
        }

        function checkEndGame() {
            if (harmony >= 100) endGame(true);
            else if (chaos >= 60) endGame(false);
        }

        function endGame(success) {
            gameActive = false;
            clearInterval(spawnInterval);
            if (animationId) cancelAnimationFrame(animationId);
            
            if (success) {
                UI.log('🏆 Гармония достигнута! Ты научилась чувствовать Свет!', 'system');
                setTimeout(() => {
                    gameArea.style.display = 'none';
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }, 1500);
            } else {
                UI.log('💫 Слишком много хаоса. Стихии вышли из-под контроля. Попробуй снова!', 'combat');
                setTimeout(() => {
                    gameArea.style.display = 'none';
                    if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }, 2000);
            }
        }

        // Запуск игры
        spawnInterval = setInterval(createParticle, 700);
        animate();
        
        console.log('✅ Мини-игра запущена');
    },

    hideParticleGame() {
        const gameArea = document.getElementById('particle-game-area');
        if (gameArea) gameArea.style.display = 'none';
    },

    // === ПЛОХАЯ КОНЦОВКА (Broken Light) ===
    showBadEnding(text) {
        this.clearLog();
        this.log('════════════════════════════════', 'system');
        this.log(text, 'combat');
        this.log('════════════════════════════════', 'system');
        this.renderButtons([{
            label: '🔄 Начать заново (Сбросить мир)',
            handler: () => location.reload()
        }]);
    }
};

// Экспорт модуля (для совместимости)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}