// js/ui.js
// Модуль управления интерфейсом игры "Проклятие Алатар"
const UI = {
    // === ЭЛЕМЕНТЫ DOM ===
    elements: {
        log: null,
        locationName: null,
        healthBar: null,
        healthText: null,
        levelText: null,
        resonanceText: null,
        controlText: null,
        intoxicationText: null,
        actionButtons: null,
        inventoryList: null,
        modal: null,
        modalTitle: null,
        modalMessage: null,
        modalClose: null,
        gameContainer: null,
        resonanceEffect: null
    },

    // === ПОЛУЧЕНИЕ ИГРОКА ===
    getPlayer() {
        if (typeof window.player !== 'undefined') return window.player;
        return null;
    },

    // === ИНИЦИАЛИЗАЦИЯ ===
    init() {
        this.elements = {
            log: document.getElementById('game-log'),
            locationName: document.getElementById('location-name'),
            healthBar: document.getElementById('health-bar'),
            healthText: document.getElementById('health-text'),
            levelText: document.getElementById('level-text'),
            resonanceText: document.getElementById('corruption-text'),
            controlText: document.getElementById('control-text'),
            intoxicationText: document.getElementById('intoxication-text'),
            actionButtons: document.getElementById('action-buttons'),
            inventoryList: document.getElementById('inventory-list'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalClose: document.getElementById('modal-close'),
            gameContainer: document.querySelector('.game-container'),
            resonanceEffect: document.getElementById('resonance-effect')
        };

        if (!this.elements.log || !this.elements.actionButtons) {
            console.error('❌ Критические элементы интерфейса не найдены!');
            return false;
        }

        if (this.elements.modalClose) {
            this.elements.modalClose.addEventListener('click', () => this.hideModal());
        }
        
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.hideModal();
                }
            });
        }

        //  Инициализация эффекта резонанса
        if (this.elements.resonanceEffect) {
            this.elements.resonanceEffect.style.opacity = '0';
            this.elements.resonanceEffect.style.transition = 'opacity 0.5s ease';
        }

        console.log(' UI модуль инициализирован');
        return true;
    },

    // === ВЫВОД СООБЩЕНИЙ ===
    log(message, type = 'system') {
        if (!this.elements.log) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<p>${message}</p>`;
        
        entry.style.opacity = '0';
        this.elements.log.appendChild(entry);
        
        setTimeout(() => {
            entry.style.transition = 'opacity 0.5s ease';
            entry.style.opacity = '1';
        }, 50);

        this.elements.log.scrollTop = this.elements.log.scrollHeight;
    },

    // === ОБНОВЛЕНИЕ СТАТУСОВ ===
    updateStatus() {
        const p = this.getPlayer();
        if (!p) return;

        if (this.elements.healthBar && this.elements.healthText) {
            const hpPercent = Math.max(0, Math.min(100, (p.health / p.maxHealth) * 100));
            this.elements.healthBar.style.width = `${hpPercent}%`;
            this.elements.healthText.textContent = `${p.health}/${p.maxHealth}`;
            
            if (hpPercent < 30) {
                this.elements.healthBar.style.background = 'linear-gradient(90deg, #8b0000, #ff0000)';
            } else {
                this.elements.healthBar.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
            }
        }


        if (this.elements.levelText) {
            this.elements.levelText.textContent = p.level;
        }

        //  УЛУЧШЕНО: отображение резонанса с визуальными эффектами
        if (this.elements.resonanceText) {
            this.elements.resonanceText.textContent = `🌀 ${p.resonance}%`;
            
            if (p.resonance >= 90) {
                // 🔴 КРИТИЧЕСКИЙ РЕЗОНАНС: пульсация + красный цвет + эффект
                this.elements.resonanceText.style.color = '#ff0000';
                this.elements.resonanceText.style.textShadow = '0 0 10px #ff0000, 0 0 20px #ff0000';
                this.elements.resonanceText.style.animation = 'pulse 0.5s infinite';
                this.elements.resonanceText.title = "⚠️ КРИТИЧЕСКИЙ РЕЗОНАНС! Потеря контроля!";
                
                //  Показываем эффект резонанса
                if (this.elements.resonanceEffect) {
                    this.elements.resonanceEffect.style.opacity = '1';
                    this.elements.resonanceEffect.style.background = 'radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)';
                }
            } else if (p.resonance > 60) {
                // 🟠 Высокий резонанс
                this.elements.resonanceText.style.color = '#ffa500';
                this.elements.resonanceText.style.textShadow = 'none';
                this.elements.resonanceText.style.animation = 'none';
                this.elements.resonanceText.title = "⚠️ Высокий резонанс";
                
                if (this.elements.resonanceEffect) {
                    this.elements.resonanceEffect.style.opacity = '0.5';
                }
            } else {
                // 🟢 Нормальный резонанс
                this.elements.resonanceText.style.color = '#00ff00';
                this.elements.resonanceText.style.textShadow = 'none';
                this.elements.resonanceText.style.animation = 'none';
                this.elements.resonanceText.title = "✅ Резонанс в норме";
                
                if (this.elements.resonanceEffect) {
                    this.elements.resonanceEffect.style.opacity = '0';
                }
            }
        }

        if (this.elements.controlText) {
            this.elements.controlText.textContent = `⚡ ${p.control}%`;
            this.elements.controlText.style.color = p.control > 70 ? '#00ff00' : (p.control < 30 ? '#ff0000' : '#ffa500');
        }

        if (this.elements.intoxicationText && p.intoxication !== undefined) {
            this.elements.intoxicationText.textContent = `🍷 ${p.intoxication}%`;
            if (p.intoxication >= 80) {
                this.elements.intoxicationText.style.color = '#ff0000';
                this.elements.intoxicationText.title = "⚠️ КРИТИЧЕСКАЯ ИНТОКСИКАЦИЯ!";
            } else if (p.intoxication > 50) {
                this.elements.intoxicationText.style.color = '#ffa500';
            } else {
                this.elements.intoxicationText.style.color = '#00ff00';
            }
        }
    },

    // === ОБНОВЛЕНИЕ ЛОКАЦИИ ===
    updateLocation(location) {
        if (!this.elements.locationName) return;
        
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

    // === КНОПКИ ===
    renderButtons(actions) {
        if (!this.elements.actionButtons) return;

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

    // === ИНВЕНТАРЬ ===
    renderInventory() {
        if (!this.elements.inventoryList) return;
        this.elements.inventoryList.innerHTML = '';

        const p = this.getPlayer();
        if (!p || p.inventory.length === 0) {
            this.elements.inventoryList.innerHTML = '<p class="empty-message">Пусто...</p>';
            return;
        }

        p.inventory.forEach((itemId, index) => {
            const item = gameData.items[itemId];
            if (!item) return;

            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `<strong>${item.name}</strong><br><small>${item.description || item.effect}</small>`;
            
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

    // === МОДАЛКИ ===
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

    // === ЭФФЕКТЫ ===
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

    // ===  ОБНОВЛЁННАЯ МИНИ-ИГРА С 5 ЭЛЕМЕНТАМИ ===
    showParticleGame(onComplete) {
        console.log('🎮 Запуск мини-игры с частицами...');
    
        this.hideParticleGame();
        
        let gameArea = document.getElementById('particle-game-area');
        if (!gameArea) {
            gameArea = document.createElement('div');
            gameArea.id = 'particle-game-area';
            gameArea.style.cssText = 'margin:20px 0; text-align:center; padding:20px; background:rgba(20,20,40,0.95); border-radius:15px; border:2px solid #9d4edd; position:relative; min-height:350px; z-index:5;';
            
        
            const log = document.getElementById('game-log');
            const actionsPanel = document.querySelector('.actions-panel');
            
            if (log && actionsPanel && log.parentNode) {
              
                const parent = log.parentNode;
                parent.insertBefore(gameArea, actionsPanel);
            } else if (log && log.parentNode) {
                
                log.parentNode.insertBefore(gameArea, log.nextSibling);
            }
        }
        
        gameArea.style.display = 'block';
        gameArea.innerHTML = `
            <h3 style="color:#ffd700; margin:0 0 15px 0; font-family:'Cormorant Garamond',serif; font-size:1.5em;">✨ Гармония Стихий ✨</h3>
            <p style="color:#b0b0b0; margin:0 0 20px 0; font-size:0.95em;">
                Лови: <span style="color:#ffd700">Свет</span>, 
                <span style="color:#ff4500">Огонь</span>, 
                <span style="color:#1E90FF">Вода</span>, 
                <span style="color:#87CEEB">Воздух</span>.<br>
                Избегай: <span style="color:#4b0082">Тьма</span>, 
                <span style="color:#8B4513">Земля</span>.<br>
                <small>Набери 100% гармонии!</small>
            </p>
            <div id="particle-container" style="position:relative; height:250px; background:rgba(0,0,0,0.8); border-radius:12px; overflow:hidden; border:2px solid #4a4a6a; margin-bottom:20px; box-shadow:inset 0 0 20px rgba(157,78,221,0.3);"></div>
            <div style="display:flex; justify-content:space-around; flex-wrap:wrap; gap:15px; color:#e0e0e0; font-size:1.1em; font-weight:bold;">
                <span style="color:#ffd700;">⚖️ Гармония: <span id="pg-harmony">0</span>%</span>
                <span style="color:#4b0082;">🌑 Хаос: <span id="pg-chaos">0</span>%</span>
            </div>
        `;

        const container = document.getElementById('particle-container');
        const harmonyEl = document.getElementById('pg-harmony');
        const chaosEl = document.getElementById('pg-chaos');

        if (!container || !harmonyEl || !chaosEl) {
            console.error('❌ Элементы мини-игры не найдены');
            if (typeof onComplete === 'function') onComplete();
            return;
        }

        // === 5 ЭЛЕМЕНТОВ: 4 ХОРОШИХ, 2 ПЛОХИХ ===
        const elements = {
            light: { name: "Свет", color: "#ffd700", glow: "0 0 15px #ffd700", type: "good", bonus: 15, message: "✨ Чистый свет! Посох отзывается теплом." },
            fire: { name: "Огонь", color: "#ff4500", glow: "0 0 15px #ff4500", type: "good", bonus: 12, message: "🔥 Огонь живёт в твоих венах!" },
            water: { name: "Вода", color: "#1E90FF", glow: "0 0 15px #1E90FF", type: "good", bonus: 10, message: "💧 Вода течёт, как твоя магия." },
            air: { name: "Воздух", color: "#87CEEB", glow: "0 0 15px #87CEEB", type: "good", bonus: 10, message: "💨 Воздух несёт твои мысли." },
            dark: { name: "Тьма", color: "#4b0082", glow: "0 0 15px #4b0082", type: "bad", penalty: 20, message: "🌑 Тьма пожирает свет!" },
            earth: { name: "Земля", color: "#8B4513", glow: "0 0 15px #8B4513", type: "bad", penalty: 15, message: "🪨 Земля тяжела, как твои сомнения." }
        };

        let harmony = 0;
        let chaos = 0;
        let particles = [];
        let spawnInterval;
        let gameActive = true;
        let animationId;

        function createParticle() {
            if (!gameActive || !container) return;
            
            const rand = Math.random();
            let key;
            if (rand < 0.25) key = 'light';
            else if (rand < 0.40) key = 'fire';
            else if (rand < 0.50) key = 'water';
            else if (rand < 0.60) key = 'air';
            else if (rand < 0.80) key = 'dark';
            else key = 'earth';

            const cfg = elements[key];
            const size = 18 + Math.random() * 12; 
            const particle = document.createElement('div');
            
            particle.style.cssText = `
                position:absolute; width:${size}px; height:${size}px; 
                background:radial-gradient(circle, ${cfg.color} 30%, transparent 70%); 
                border-radius:50%; left:${Math.random() * (container.offsetWidth - size)}px; top:-${size}px;
                cursor:pointer; box-shadow:${cfg.glow}; transition:transform 0.15s; z-index:10;
            `;
            
            particle.onclick = () => {
                if (!gameActive) return;
                
                particle.style.transform = 'scale(1.8)';
                particle.style.opacity = '0';
                setTimeout(() => { if (particle.parentNode) particle.remove(); }, 150);
                
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
            particles.push({ el: particle, speed: 1.2 + Math.random() * 1.8, drift: (Math.random() - 0.5) * 0.5 });
        }

        function animate() {
            if (!gameActive) return;
            
            particles.forEach((p, index) => {
                if (!p.el || !p.el.parentNode) { particles.splice(index, 1); return; }
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
                UI.log('🏆 Гармония достигнута! Ты научилась чувствовать стихии!', 'system');
                setTimeout(() => {
                    if (gameArea) {
                        gameArea.style.opacity = '0';
                        setTimeout(() => {
                            gameArea.style.display = 'none';
                            if (gameArea.parentNode) gameArea.remove();
                            if (typeof onComplete === 'function') {
                                try { onComplete(); } catch(e) { console.error('onComplete error:', e); }
                            }
                        }, 300);
                    } else if (typeof onComplete === 'function') {
                        onComplete();
                    }
                }, 500);
            } else {
                UI.log('💫 Слишком много хаоса. Попробуй снова!', 'combat');
                setTimeout(() => {
                    if (gameArea) gameArea.style.display = 'none';
                    UI.showParticleGame(onComplete);
                }, 2000);
            }
        }

        spawnInterval = setInterval(createParticle, 600);
        animate();
        console.log('✅ Мини-игра запущена');
    },

    hideParticleGame() {
        const gameArea = document.getElementById('particle-game-area');
        if (gameArea) {
            gameArea.style.opacity = '0';
            setTimeout(() => {
                gameArea.style.display = 'none';
                if (gameArea.parentNode) gameArea.remove();
            }, 300);
        }
    },

    // === ПЛОХАЯ КОНЦОВКА ===
    showBadEnding(text) {
        this.clearLog();
        this.log('════════════════════════════════', 'system');
        this.log(text, 'combat');
        this.log('════════════════════════════════', 'system');
        
        //  Блокируем интерфейс
        if (this.elements.actionButtons) {
            this.elements.actionButtons.style.pointerEvents = 'none';
            this.elements.actionButtons.style.opacity = '0.5';
        }
        
        //  Добавляем эффект затемнения
        if (this.elements.gameContainer) {
            this.elements.gameContainer.style.filter = 'blur(2px)';
        }
        
        this.renderButtons([{
            label: '🔄 Начать заново (Сбросить мир)',
            handler: () => location.reload()
        }]);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
