const Game = {
    inCombat: false,
    turn: 0,
    storyStep: 0,
    isFaded: false,
    sequenceStep: 0,
    currentDialogue: null,
    herbsNeeded: 3,
    herbsCollected: 0,
    healInterval: null,

    init() {
        if (!this.checkDependencies()) {
            if (typeof UI !== 'undefined' && UI.log) {
                UI.log('❌ Ошибка загрузки игры. Проверь консоль (F12).', 'system');
            }
            return;
        }
        
        UI.init();
        UI.updateStatus();
        UI.renderInventory();
        UI.log('🎮 Проклятие Алатар: Начало', 'system');
        
        UI.updateLocation("Серебряный Бор: Тропа");
        
        this.startForestWalk();
    },

    checkDependencies() {
        if (typeof window.player === 'undefined') {
            console.error('❌ window.player не найден! Проверь player.js');
            return false;
        }
        if (typeof gameData === 'undefined') {
            console.error('❌ gameData не найден! Проверь data.js');
            return false;
        }
        if (typeof UI === 'undefined') {
            console.error('❌ UI не найден! Проверь ui.js');
            return false;
        }
        return true;
    },

    startForestWalk() {
        this.sequenceStep = 1;
        window.player.currentLocation = "forest_path";
        UI.updateLocation("Серебряный Бор: Тропа");
        UI.log('🌲 Ниниэль идёт по Серебряному Бору. Кора деревьев отливает серебром. Тропы запутаны, она ищет путь в Тихоречье.', 'system');
        UI.log('Что делать?', 'system');
        UI.renderButtons([
            { label: '🌲 Пойти по левой тропе', handler: () => this.forestChoice('left') },
            { label: '🍂 Пойти по правой тропе', handler: () => this.forestChoice('right') },
            { label: '🗺️ Свериться с картой', handler: () => this.forestChoice('map') }
        ]);
    },

    forestChoice(choice) {
        this.sequenceStep = 1.5;
        if (choice === 'left') {
            UI.log('Вы сворачиваете налево. Тропа идёт вниз...', 'system');
        } else if (choice === 'right') {
            UI.log('Вы идёте направо. Ветви цепляются за плащ...', 'system');
        } else {
            UI.log('Вы разворачиваете карту, но ветер вырывает её...', 'system');
        }
        setTimeout(() => this.triggerRavineFall(), 1500);
    },

    triggerRavineFall() {
        this.sequenceStep = 2;
        window.player.currentLocation = "ravine_bottom";
        UI.updateLocation("Дно Оврага");
        UI.log('💥 Обвал! Вы срываетесь вниз...', 'combat');
        UI.renderButtons([
            { label: '💪 Попытаться выбраться', handler: () => this.ravineChoice('climb') },
            { label: '🔍 Осмотреться', handler: () => this.ravineChoice('inspect') },
            { label: '🩹 Перевязать рану', handler: () => this.ravineChoice('heal') }
        ]);
    },

    ravineChoice(choice) {
        this.sequenceStep = 2.5;
        if (choice === 'climb') {
            UI.log('Вы пытаетесь зацепиться, но камень крошится...', 'combat');
            window.player.health = Math.max(0, window.player.health - 5);
        } else if (choice === 'inspect') {
            UI.log('Вы замечаете странные следы...', 'system');
        } else {
            UI.log('Вы перевязываете ссадины...', 'system');
        }
        UI.updateStatus();
        setTimeout(() => {
            UI.log('🐍 Из расщелины выползает Василиск!', 'combat');
            this.startBasiliskBattle();
        }, 1500);
    },

    startBasiliskBattle() {
        this.inCombat = true; 
        this.turn = 0;
        UI.log('⚔️ БОЙ! Цель: продержаться 3 хода.', 'combat');
        this.nextTurn();
    },

    nextTurn() {
        this.turn++;
        // ✅ ИСПРАВЛЕНО: Добавлен ледяной щит, пробитие и эффект яда
        const prompts = [
            "Ниниэль успела выставить ледяной щит, но хвост Василиска с оглушительным хрустом пробил его. Острые шипы впились в бок, а на хвосте мерцал яд. По телу разлилась слабость, сознание начало мутнеть...",
            "В памяти крик: «Беги, Нини!». Яд жжёт вены, ноги подкашиваются.",
            "Силы на исходе. Тьма подступает к краям зрения."
        ];
        
        UI.log(prompts[this.turn-1] || "Держись!", 'combat');
        UI.renderButtons([
            { label: '⚔️ Атаковать', handler: () => { 
                UI.log('Удар бесполезен. Чешуя непробиваема.', 'combat'); 
                this.enemyTurn(); 
            }},
            { label: '🛡️ Заблокировать', handler: () => { 
                UI.log('Блок ослабил удар, но яд продолжает действовать.', 'system'); 
                window.player.isDefending = true; 
                this.enemyTurn(); 
            }},
            { label: '🏃 Уклониться', handler: () => { 
                UI.log('Едва уворачиваешься. Голова кружится от яда.', 'combat'); 
                this.enemyTurn(); 
            }}
        ]);
    },

    enemyTurn() {
        const dmg = 20 + Math.floor(Math.random() * 10);
        const died = window.player.takeDamage(dmg);
        UI.log(`Василиск наносит ${dmg} урона!`, 'combat');
        UI.updateStatus();
        if (died) {
            UI.log('💀 Сознание уплывает...', 'combat');
            return;
        }
        if (this.turn >= 3) {
            this.triggerWaldenRescue();
        } else {
            this.nextTurn();
        }
    },

    triggerWaldenRescue() {
        this.inCombat = false;
        UI.log('══════════════════════════════', 'system');
        const lines = [
            "Внезапно сверху посыпались камни.",
            "— Ох, чёрт! Опять эта проклятая трава!",
            "Старик размахивает посохом.",
            "— Закопать? Поджарить? — Или...",
            "ХЛОП! Невидимая сила вдавила чудовище.",
            "— Ай, спина! Ну вот, опять...",
            "— Эй, девочка! Не вздумай умирать!"
        ];
        let i = 0;
        const step = () => {
            if (i < lines.length) {
                UI.log(lines[i], i % 2 === 0 ? 'system' : 'dialogue');
                if (i === 4) UI.flashScreen();
                i++; 
                setTimeout(step, 1800);
            } else {
                UI.fadeScreen('out'); 
                this.isFaded = true;
                setTimeout(() => {
                    // НЕ восстанавливаем здоровье полностью!
                    window.player.mana = Math.min(window.player.maxMana, window.player.mana + 20);
                    UI.updateStatus();
                    this.loadLocation("walden_hut");
                }, 2000);
            }
        };
        step();
    },

    loadLocation(id) {
        const loc = gameData.locations[id];
        if (!loc) {
            console.error('❌ Локация не найдена:', id);
            return UI.log('❌ Локация не найдена', 'system');
        }
        
        window.player.currentLocation = id;
        UI.updateLocation(loc.name);
        
        // ✅ ИСПРАВЛЕНО: Убрано авто-дублирование описания в лог.
        // Выводим только короткий атмосферный переход:
        UI.log(`📍 Переход: ${loc.name}`, 'system');
        
        if (this.isFaded) { 
            UI.fadeScreen('in'); 
            this.isFaded = false; 
        }
        
        if (id === "walden_hut" && !window.player.hutVisited) {
            window.player.hutVisited = true;
            setTimeout(() => this.runStoryNode('hut_wake'), 1000);
            return;
        }
        
        if (id === "herb_garden" && !window.player.trainingComplete) {
            this.startHerbQuest();
            return;
        }
        
        if (id === "phantom_ambush") {
            this.startChapter2Battle();
            return;
        }
        
        this.renderActions(loc);
    },

    startHerbQuest() {
        UI.log('🌿 КВЕСТ: Собери 3 травы для Вальдена', 'system');
        this.herbsCollected = 0;
        this.herbsNeeded = 3;
        this.renderHerbQuestButtons();
    },

    renderHerbQuestButtons() {
        const collected = window.player.inventory.filter(i => 
            ['lavender', 'plantain', 'sixflower'].includes(i)
        ).length;
        
        UI.log(`📊 Собрано трав: ${collected}/3`, 'system');
        
        const buttons = [];
        
        if (!window.player.inventory.includes('lavender')) {
            buttons.push({ label: '🌿 Искать лаванду', handler: () => this.collectHerb('lavender', 5, 0) });
        }
        if (!window.player.inventory.includes('plantain')) {
            buttons.push({ label: '🌱 Искать подорожник', handler: () => this.collectHerb('plantain', 3, 0) });
        }
        if (!window.player.inventory.includes('sixflower')) {
            buttons.push({ label: '🌸 Искать шестьцветник', handler: () => this.collectHerb('sixflower', 0, 5) });
        }
        
        if (collected >= 3) {
            buttons.push({ 
                label: '✅ Вернуться к Вальдену', 
                handler: () => this.completeHerbQuest() 
            });
        }
        
        buttons.push({ label: '🎒 Инвентарь', handler: () => UI.renderInventory() });
        
        UI.renderButtons(buttons);
    },

    collectHerb(herbId, controlBonus, resonanceBonus) {
        if (window.player.addItem(herbId)) {
            const herb = gameData.items[herbId];
            UI.log(`🌿 Найдено: ${herb.name}`, 'item');
            if (controlBonus) window.player.addControl(controlBonus);
            if (resonanceBonus) window.player.addResonance(resonanceBonus);
            UI.updateStatus();
        }
        this.renderHerbQuestButtons();
    },

    completeHerbQuest() {
        UI.log('🌿 Квест завершён! Вальден принимает травы.', 'system');
        window.player.trainingComplete = true;
        
        UI.log('📅 Прошёл месяц тренировок...', 'system');
        setTimeout(() => {
            window.player.addControl(20);
            window.player.level = 2;
            window.player.maxHealth += 20;
            window.player.maxMana += 10;
            window.player.health = window.player.maxHealth;
            window.player.mana = window.player.maxMana;
            UI.log('✨ Ниниэль стала сильнее!', 'system');
            UI.updateStatus();
            this.runStoryNode('chapter2_intro');
        }, 2000);
    },

    startChapter2Battle() {
        this.inCombat = true;
        this.turn = 0;
        UI.log('⚔️ ГЛАВА 2: Призрачные всадники атакуют!', 'combat');
        this.runMordredBattle();
    },

    runMordredBattle() {
        const battle = gameData.mordredBattle;
        
        if (battle.checkBadEnding && window.player.checkBadEnding()) {
            UI.showBadEnding(battle.badEndingText);
            return;
        }
        
        if (battle.intro) {
            UI.log(battle.intro, 'combat');
        }
        
        if (battle.choices) {
            const buttons = battle.choices.map(choice => {
                if (choice.condition) {
                    if (choice.condition.minResonance && window.player.resonance < choice.condition.minResonance) {
                        return { label: choice.text + ' ❌ (нужен резонанс)', handler: () => {}, disabled: true };
                    }
                    if (choice.condition.minControl && window.player.control < choice.condition.minControl) {
                        return { label: choice.text + ' ❌ (нужен контроль)', handler: () => {}, disabled: true };
                    }
                }
                
                return {
                    label: choice.text,
                    handler: () => {
                        if (choice.effect) {
                            if (choice.effect.resonance) window.player.addResonance(choice.effect.resonance);
                            if (choice.effect.control) window.player.addControl(choice.effect.control);
                            UI.updateStatus();
                        }
                        
                        if (choice.checkBadEnding && window.player.checkBadEnding()) {
                            UI.showBadEnding(battle.badEndingText);
                            return;
                        }
                        
                        if (choice.next) {
                            const nextScene = battle[choice.next];
                            if (nextScene) {
                                UI.log(nextScene.text || nextScene.goodText, 'system');
                                if (nextScene.next) {
                                    setTimeout(() => this.runMordredBattle(), 2000);
                                } else {
                                    this.endChapter2();
                                }
                            }
                        }
                    }
                };
            });
            
            UI.renderButtons(buttons);
        }
    },

    endChapter2() {
        const ending = gameData.mordredBattle.chapter2_end;
        const text = ending.text
            .replace('{resonance}', window.player.resonance)
            .replace('{control}', window.player.control);
        
        UI.log(text, 'system');
        
        if (gameData.locations.walden_hut) {
            gameData.locations.walden_hut.exits.south = "silver_forest";
        }
        
        UI.renderButtons([
            { label: '🌲 Продолжить в Серебряный Бор', handler: () => this.loadLocation("silver_forest") },
            { label: '🎒 Инвентарь', handler: () => UI.renderInventory() }
        ]);
    },

    runStoryNode(nodeId) {
        const dialogueTree = gameData.chapter1Dialogues;
        if (!dialogueTree || !dialogueTree[nodeId]) {
            console.error('❌ Ошибка сцены: nodeId не найден -', nodeId);
            return;
        }
        
        const node = dialogueTree[nodeId];
        
        if (Array.isArray(node)) {
            let currentIndex = 0;
            
            const showNextLine = () => {
                if (currentIndex >= node.length) {
                    if (node[node.length - 1].next) {
                        this.runStoryNode(node[node.length - 1].next);
                    }
                    return;
                }
                
                const line = node[currentIndex];
                const speaker = line.speaker || '';
                const text = line.text || '';
                
                UI.log(`<b>${speaker === '???' ? 'Незнакомец' : speaker}:</b> ${text}`, 'dialogue');
                currentIndex++;
                
                UI.renderButtons([{ 
                    label: '🗣️ Далее', 
                    handler: () => showNextLine() 
                }]);
            };
            
            showNextLine();
            return;
        }
        
        const speaker = node.speaker || '';
        const text = node.text || '';
        
        UI.log(`<b>${speaker === '???' ? 'Незнакомец' : speaker}:</b> ${text}`, 'dialogue');
        
        if (node.effect) {
            if (node.effect.resonance) window.player.addResonance(node.effect.resonance);
            if (node.effect.control) window.player.addControl(node.effect.control);
            UI.updateStatus();
        }
        
        if (node.effect && typeof node.effect === 'string' && node.effect.includes('collected')) {
            const herb = node.effect.replace('_collected', '');
            if (window.player.addItem(herb)) {
                UI.log(`🌿 Найдено: ${gameData.items[herb].name}`, 'item');
            }
        }

        // Обработка мгновенного лечения без спама
        if (node.action === "heal_player") {
            this.healGradually(); // ✅ Запускаем плавное лечение
        }
        
        if (node.choices) {
            const buttons = node.choices.map(choice => ({
                label: choice.text,
                handler: () => {
                    if (choice.effect) {
                        if (choice.effect.resonance) window.player.addResonance(choice.effect.resonance);
                        if (choice.effect.control) window.player.addControl(choice.effect.control);
                        UI.updateStatus();
                    }
                    this.runStoryNode(choice.next);
                }
            }));
            UI.renderButtons(buttons);
        } else if (node.next) {
            if (node.next === 'herb_quest_start') {
                this.loadLocation("herb_garden");
                return;
            }
            if (node.next === 'time_skip') {
                setTimeout(() => this.runStoryNode('chapter2_intro'), 2000);
                return;
            }
            if (node.next === 'battle_choice') {
                this.loadLocation("phantom_ambush");
                return;
            }
            if (node.next === 'training_minigame' || node.next === 'training_minigame_first') {
                setTimeout(() => this.startTraining(), 1000);
                return;
            }
            
            UI.renderButtons([{ 
                label: '➡️ Далее', 
                handler: () => this.runStoryNode(node.next) 
            }]);
        } else if (node.next === 'training_minigame' || node.next === 'training_minigame_first') {
            setTimeout(() => this.startTraining(), 1000);
        }
    },

    startTraining() {
        console.log('🎮 Запуск тренировки с частицами...');
        UI.log('✨ <b>ПЕРВАЯ ТРЕНИРОВКА: ЛОВЛЯ ЧАСТИЦ СВЕТА</b>', 'system');
        UI.log('— Теперь попробуй на практике! Лови частицы чистого Света, избегай Тьмы.', 'dialogue');
        
        // Запускаем мини-игру
        UI.showParticleGame(() => {
            console.log('✅ Мини-игра завершена, продолжаем сюжет...');
            this.onTrainingComplete();
        });
    },

    onTrainingComplete() {
        window.player.mana = window.player.maxMana;
        window.player.addControl(15);
        UI.updateStatus();
        UI.log('— Неплохо для начала, — кивнул Вальден. — Но светит, как фонарь у двери. А должно — как маяк для тех, кто заблудился во тьме.', 'dialogue');
        UI.log('— Лучше, — кивнул Вальден. — Но это только начало. Теперь ты понимаешь, как работает свет.', 'dialogue');
        this.runStoryNode('training_why_save_me');
    },

    // ✅ ПЛАВНОЕ ЛЕЧЕНИЕ БЕЗ СПАМА
    healGradually() {
        if (this.healInterval) clearInterval(this.healInterval);
        
        UI.log('🍵 Зелье действует... Силы постепенно возвращаются.', 'item');
        
        let currentHP = window.player.health;
        const targetHP = window.player.maxHealth;
        
        this.healInterval = setInterval(() => {
            if (currentHP < targetHP) {
                currentHP += 2; // Скорость лечения
                if (currentHP > targetHP) currentHP = targetHP;
                window.player.health = currentHP;
                UI.updateStatus(); // Просто обновляем полоску, НЕ пишем в лог
            } else {
                clearInterval(this.healInterval);
                this.healInterval = null;
                UI.log('✨ Здоровье полностью восстановлено.', 'item');
            }
        }, 300); // Интервал обновления (чем меньше, тем плавнее)
    },

    renderActions(loc) {
        const acts = [];
        
        for (let [dir, target] of Object.entries(loc.exits || {})) {
            if (target && typeof target === 'string') {
                acts.push({ 
                    label: `⬇️ ${target}`, 
                    handler: () => this.loadLocation(target) 
                });
            }
        }
        
        if (loc.npcs) {
            loc.npcs.forEach(npcId => {
                const npc = gameData.npcs[npcId];
                if (npc && !npc.hostile) {
                    acts.push({ 
                        label: `💬 Говорить: ${npc.name}`, 
                        handler: () => {
                            const dialog = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
                            UI.log(`${npc.name}: "${dialog}"`, 'dialogue');
                        }
                    });
                }
            });
        }
        
        if (loc.items?.length) {
            acts.push({ 
                label: '🎒 Подобрать', 
                handler: () => {
                    loc.items.forEach(i => {
                        if (window.player.addItem(i)) {
                            UI.log(`Подобрано: ${gameData.items[i].name}`, 'item');
                        }
                    });
                    loc.items = []; 
                    UI.renderInventory(); 
                    this.renderActions(loc);
                }
            });
        }
        
        acts.push({ 
            label: '🎒 Инвентарь', 
            handler: () => UI.renderInventory() 
        });
        
        UI.renderButtons(acts);
    },

    useItem(id) {
        const result = window.player.useItem(id);
        UI.log(result, 'item');
        UI.updateStatus();
        UI.renderInventory();
    }
};