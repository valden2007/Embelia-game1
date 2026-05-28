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
        UI.renderInventory();
        UI.log('🎮 Проклятие Алатар: Начало', 'system');
        
        UI.updateLocation("Серебряный Бор: Тропа");
        
        // НАЧАЛЬНЫЕ ХАРАКТЕРИСТИКИ 
        window.player.health = 100;
        window.player.maxHealth = 100;
        UI.updateStatus();
        
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
        
        // HP = 80 СРАЗУ ПРИ ПАДЕНИИ В ОВРАГ
        window.player.health = 80;
        UI.updateStatus();
        
        UI.renderButtons([
            { label: '💪 Попытаться выбраться', handler: () => this.ravineChoice('climb') },
            { label: '🔍 Осмотреться', handler: () => this.ravineChoice('inspect') },
            { label: '🩹 Перевязать рану', handler: () => this.ravineChoice('heal') }
        ]);
    },

    ravineChoice(choice) {
        this.sequenceStep = 2.5;
        if (choice === 'climb') {
            UI.log('Вы пытаетесь зацепиться, но камень крошится под руками...', 'combat');
            const fallDmg = 5;
            window.player.health = Math.max(0, window.player.health - fallDmg);
            UI.log(`💥 Камни падают на вас! -${fallDmg} HP`, 'combat');
        } else if (choice === 'inspect') {
            UI.log('Вы замечаете странные следы...', 'system');
        } else {
            UI.log('Вы перевязываете ссадины...', 'system');
            const healAmount = 5;
            window.player.health = Math.min(window.player.maxHealth, window.player.health + healAmount);
            UI.log(`🩹 Вы перевязали раны. +${healAmount} HP`, 'system');
        }
        UI.updateStatus();
        
        // ✅ ПРОВЕРКА СМЕРТИ ПОСЛЕ ВЫБОРА В ОВРАГЕ
        if (window.player.health <= 0) {
            UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Падение в бездну»\n*Ниниэль не смогла выбраться из оврага. Её тело осталось лежать на дне, забытое всеми...*');
            return;
        }
        
        setTimeout(() => {
            UI.log('🐍 Из расщелины выползает Василиск!', 'combat');
            this.startBasiliskBattle();
        }, 1500);
    },

    startBasiliskBattle() {
        this.inCombat = true; 
        this.turn = 0;
        
        if (window.player.health > 80) {
            window.player.health = 80;
            UI.updateStatus();
        }
        
        UI.log('⚔️ БОЙ С ВАСИЛИСКОМ!', 'combat');
        UI.log('Цель: продержаться 2 хода до прибытия Вальдена.', 'system');
        UI.log('⚠️ У вас мало шансов выжить, если будете только атаковать!', 'combat');
        
        //  ПЕРВАЯ НЕБЛОКИРУЕМАЯ АТАКА ЧЕРЕЗ 1.5 СЕКУНДЫ
        setTimeout(() => {
            const firstHitDmg = 25 + Math.floor(Math.random() * 6);
            window.player.health = Math.max(0, window.player.health - firstHitDmg);
            UI.log(`💥 Хвост Василиска с хрустом пробивает ваш ледяной щит! Острые шипы вонзаются в бок. -${firstHitDmg} HP`, 'combat');
            UI.updateStatus();
            
            if (window.player.health <= 0) {
                UI.log('💀 Сознание уплывает...', 'combat');
                UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Смерть в овраге»\n*Василиск добил Ниниэль. Её история закончилась, не начавшись...*');
                return;
            }
            
            UI.log('⚠️ Василиск готовится к следующей атаке!', 'combat');
            this.nextTurn();
        }, 1500);
    },

    nextTurn() {
        if (window.player.health <= 0) {
            UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Смерть в овраге»\n*Василиск добил Ниниэль. Её история закончилась, не начавшись...*');
            return;
        }
        
        if (this.turn >= 2) {
            setTimeout(() => {
                this.triggerWaldenRescue();
            }, 1000);
            return;
        }

        this.turn++;
        const baseDmg = 25 + Math.floor(Math.random() * 11);
        
        const prompts = [
            "Василиск шипит и готовится к удару хвостом!",
            "Глаза чудовища вспыхивают ядом. Оно атакует снова!"
        ];
        
        UI.log(prompts[this.turn-1] || "Василиск атакует!", 'combat');
        
        UI.renderButtons([
            { label: '⚔️ Атаковать', handler: () => { 
                UI.log('Удар бесполезен. Чешуя непробиваема.', 'combat'); 
                this.basiliskAttack('attack', baseDmg);
            }},
            { label: '🛡️ Заблокировать', handler: () => { 
                UI.log('Вы выставляете щит, готовясь принять удар.', 'system'); 
                this.basiliskAttack('defend', baseDmg);
            }},
            { label: '🏃 Уклониться', handler: () => { 
                UI.log('Вы пытаетесь уклониться...', 'combat'); 
                this.basiliskAttack('dodge', baseDmg);
            }}
        ]);
    },

    basiliskAttack(actionType, baseDmg) {
        if (window.player.health <= 0) return;
        
        let finalDmg = 0;
        let msg = '';

        if (actionType === 'dodge') {
            if (Math.random() > 0.5) {
                finalDmg = 0;
                msg = `🏃 Вы увернулись! Василиск промахнулся.`;
            } else {
                finalDmg = Math.floor(baseDmg / 2);
                msg = `🏃 Не удалось увернуться полностью! Хвост задел вас. -${finalDmg} HP`;
            }
        } else if (actionType === 'defend') {
            finalDmg = Math.floor(baseDmg / 2);
            msg = `🛡️ Блок ослабил удар! Вы получаете ${finalDmg} урона вместо ${baseDmg}.`;
        } else {
            finalDmg = baseDmg;
            msg = `⚔️ Атака не помогла! Хвост пробивает щит. -${finalDmg} HP`;
        }

        window.player.health = Math.max(0, window.player.health - finalDmg);
        UI.log(msg, 'combat');
        UI.updateStatus();

        if (window.player.health <= 0) {
            UI.log('💀 Сознание уплывает...', 'combat');
            UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Смерть в овраге»\n*Василиск добил Ниниэль. Её история закончилась, не начавшись...*');
            return;
        }

        setTimeout(() => {
            this.nextTurn();
        }, 1500);
    },

    triggerWaldenRescue() {
        this.inCombat = false;
        UI.log('══════════════════════════════', 'system');
        const lines = [
            "Внезапно сверху посыпались камни.",
            "— Ох, чёрт! Опять эта проклятая трава на утёсе!",
            "Старик размахивает посохом,будто прогонял назойливую муху. ",
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
                UI.log('Старик подошёл ближе. Его глаза светились странным светом, а вокруг посоха мерцала аура силы. Ниниэль почувствовала, как сердце бьётся чаще...', 'dialogue');
                UI.renderButtons([
                    { 
                        label: '😨 Отшатнуться (Испугаться его силы)', 
                        handler: () => {
                            window.player.addResonance(15);
                            window.player.addTrust(-5);
                            UI.updateStatus();
                            this.waldenApproachFear();
                        }
                    },
                    { 
                        label: '👁️ Смотреть с надеждой (Принять помощь)', 
                        handler: () => {
                            window.player.addTrust(10);
                            window.player.addControl(5);
                            UI.updateStatus();
                            this.waldenApproachHope();
                        }
                    }
                ]);
            }
        };
        step();
    },

    waldenApproachFear() {
        UI.log('Ниниэль отползла назад, сжимаясь от страха. Этот человек... он не был обычным стариком. В нём было что-то древнее и опасное.\n\n— Не бойся, девочка, — сказал Вальден, но в его голосе прозвучала лёгкая обида. — Я не причиню тебе вреда.', 'dialogue');
        setTimeout(() => {
            UI.fadeScreen('out'); 
            this.isFaded = true;
            setTimeout(() => {
                window.player.health = Math.floor(window.player.maxHealth * 0.55);
                UI.updateStatus();
                this.loadLocation("walden_hut");
            }, 2000);
        }, 1500);
    },

    waldenApproachHope() {
        UI.log('Ниниэль подняла взгляд на старика. В его глазах она увидела не угрозу, а... понимание. Как будто он тоже знал, что такое потерять всё.\n\n— Ты смелая, — сказал Вальден с одобрением. — Это хорошо. Тебе понадобится смелость.', 'dialogue');
        setTimeout(() => {
            UI.fadeScreen('out'); 
            this.isFaded = true;
            setTimeout(() => {
                window.player.health = Math.floor(window.player.maxHealth * 0.55);
                UI.updateStatus();
                this.loadLocation("walden_hut");
            }, 2000);
        }, 1500);
    },

    loadLocation(id) {
        const loc = gameData.locations[id];
        if (!loc) {
            console.error('❌ Локация не найдена:', id);
            return UI.log('❌ Локация не найдена', 'system');
        }
        
        window.player.currentLocation = id;
        UI.updateLocation(loc.name);
        UI.log(`📍 ${loc.name}`, 'system');
        
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
        
        if (id === "silver_forest_deep") {
            this.forestDeepEncounter();
            return;
        }
        
        if (id === "bear_lair") {
            this.startBearBattle();
            return;
        }
        
        this.renderActions(loc);
    },

    forestDeepEncounter() {
        UI.log('🌲 Вы зашли глубоко в чащу. Воздух стал тяжёлым, деревья нависают, как стражи...', 'system');
        UI.log('Внезапно из-за кустов раздался рык...', 'combat');
        
        UI.renderButtons([
            { label: '🐻 Исследовать источник звука', handler: () => this.loadLocation('bear_lair') },
            { label: '🏃 Осторожно отступить', handler: () => this.loadLocation('silver_forest') },
            { label: '🔍 Осмотреться', handler: () => this.forestInspect() }
        ]);
    },

    forestInspect() {
        const roll = Math.random();
        if (roll < 0.3) {
            UI.log('🌿 Вы нашли редкую траву: Лунный корень!', 'item');
            window.player.addItem('moonroot');
        } else if (roll < 0.6) {
            UI.log('👣 Вы заметили свежие следы. Лучше не рисковать...', 'system');
        } else {
            UI.log('🐺 Из кустов выскочила Теневая Гончая!', 'combat');
            this.startShadowHoundBattle();
            return;
        }
        setTimeout(() => this.loadLocation('silver_forest'), 1500);
    },

    startBearBattle() {
        this.inCombat = true;
        this.turn = 0;
        UI.log('🐻 БОЙ! Земляной Медведь преграждает путь!', 'combat');
        UI.log('Цель: продержаться 4 хода или нанести 60 урона.', 'system');
        this.bearNextTurn();
    },

    bearNextTurn() {
        this.turn++;
        const bearPrompts = [
            "Медведь ревёт, земля дрожит под его лапами. Он бросается вперёд!",
            "Его когти оставляют глубокие борозды в камне. Удар был близок!",
            "Медведь устал, но не сдаётся. Его глаза горят яростью.",
            "Последний рывок! Медведь собирается для решающей атаки."
        ];
        
        UI.log(bearPrompts[this.turn-1] || "Держись!", 'combat');
        
        UI.renderButtons([
            { label: '🔥 Огненная стрела (20 урона)', handler: () => {
                const dmg = 20 + Math.floor(Math.random() * 10);
                UI.log(`🔥 Огненная стрела наносит ${dmg} урона!`, 'combat');
                this.bearTakeDamage(dmg);
            }},
            { label: '💧 Водяной щит (защита)', handler: () => {
                window.player.isDefending = true;
                UI.log('💧 Водяной щит активирован!', 'system');
                this.bearEnemyTurn();
            }},
            { label: '💨 Порыв ветра (уклонение)', handler: () => {
                UI.log('💨 Вы уклонились от атаки!', 'system');
                this.bearEnemyTurn();
            }}
        ]);
        UI.updateStatus();
    },

    bearTakeDamage(dmg) {
        const bearHP = 60;
        if (dmg >= bearHP || this.turn >= 4) {
            UI.log('🐻 Медведь отступает! Вы победили!', 'system');
            UI.log('🎁 Награда: Шкура медведя (крафт), +10 Контроль', 'item');
            window.player.addControl(10);
            window.player.addItem('bear_hide');
            this.inCombat = false;
            setTimeout(() => this.loadLocation('silver_forest'), 2000);
        } else {
            this.bearEnemyTurn();
        }
    },

    bearEnemyTurn() {
        if (!this.inCombat) return;
        const dmg = window.player.isDefending ? 10 : 25;
        window.player.isDefending = false;
        const died = window.player.takeDamage(dmg);
        UI.log(`🐻 Медведь наносит ${dmg} урона!`, 'combat');
        UI.updateStatus();
        if (died) {
            UI.log('💀 Вы пали в бою с медведем...', 'combat');
            UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Жертва леса»\n*Земляной Медведь стал вашей последней битвой. Без вас Орден Света ослабнет...*');
            return;
        }
        if (this.turn < 4) {
            this.bearNextTurn();
        } else {
            UI.log('🐻 Медведь, израненный, отступает в чащу.', 'system');
            this.inCombat = false;
            setTimeout(() => this.loadLocation('silver_forest'), 2000);
        }
    },

    startShadowHoundBattle() {
        this.inCombat = true;
        this.turn = 0;
        UI.log('🐺 БОЙ! Теневая Гончая атакует!', 'combat');
        this.houndNextTurn();
    },

    houndNextTurn() {
        this.turn++;
        UI.log('Гончая кружит, её глаза горят тусклым светом...', 'combat');
        
        UI.renderButtons([
            { label: '⚡ Быстрая атака (15 урона)', handler: () => {
                UI.log('⚡ Вы наносите 15 урона!', 'combat');
                this.houndDefeated();
            }},
            { label: '🛡️ Блок', handler: () => {
                window.player.isDefending = true;
                this.houndEnemyTurn();
            }}
        ]);
        UI.updateStatus();
    },

    houndEnemyTurn() {
        if (!this.inCombat) return;
        const dmg = window.player.isDefending ? 5 : 15;
        window.player.isDefending = false;
        const died = window.player.takeDamage(dmg);
        UI.log(`🐺 Гончая наносит ${dmg} урона!`, 'combat');
        UI.updateStatus();
        if (died) {
            UI.showBadEnding('🔚 КОНЕЦ ИГРЫ: «Укус тени»\n*Теневая Гончая оказалась быстрее...');
            return;
        }
        if (this.turn < 3) {
            this.houndNextTurn();
        } else {
            this.houndDefeated();
        }
    },

    houndDefeated() {
        UI.log('🐺 Гончая с визгом убегает в тень.', 'system');
        this.inCombat = false;
        setTimeout(() => this.loadLocation('silver_forest'), 1500);
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
            buttons.push({ label: '🌿 Искать лаванду', handler: () => this.collectHerb('lavender') });
        }
        if (!window.player.inventory.includes('plantain')) {
            buttons.push({ label: '🌱 Искать подорожник', handler: () => this.collectHerb('plantain') });
        }
        if (!window.player.inventory.includes('sixflower')) {
            buttons.push({ label: '🌸 Искать шестьцветник', handler: () => this.collectHerb('sixflower') });
        }
        
        if (collected >= 3) {
            buttons.push({ 
                label: '✅ Вернуться к Вальдену', 
                handler: () => this.completeHerbQuest() 
            });
        }
        
        buttons.push({ label: '⚗️ Создать зелье', handler: () => this.showCraftingMenu() });
        buttons.push({ label: '🎒 Инвентарь', handler: () => UI.renderInventory() });
        
        UI.renderButtons(buttons);
    },

    collectHerb(herbId) {
        if (window.player.addItem(herbId)) {
            const herb = gameData.items[herbId];
            UI.log(`🌿 Найдено: ${herb.name}`, 'item');
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
            window.player.health = window.player.maxHealth;
            UI.log('✨ Ниниэль стала сильнее!', 'system');
            UI.updateStatus();
            this.runStoryNode('chapter2_intro');
        }, 2000);
    },

    showCraftingMenu() {
        UI.log('⚗️ === ЗЕЛЬЕВАРЕНИЕ ===', 'system');
        
        const buttons = [];
        
        for (let key in gameData.recipes) {
            const recipe = gameData.recipes[key];
            const hasIngredients = recipe.ingredients.every(ing => window.player.inventory.includes(ing));
            const alreadyHas = window.player.inventory.includes(recipe.result);
            
            if (hasIngredients && !alreadyHas) {
                buttons.push({
                    label: `⚗️ ${recipe.name}`,
                    handler: () => this.craftPotion(key)
                });
            } else if (alreadyHas) {
                buttons.push({
                    label: `✅ ${recipe.name} (уже есть)`,
                    handler: () => {},
                    disabled: true
                });
            } else {
                buttons.push({
                    label: `❌ ${recipe.name} (нет трав)`,
                    handler: () => {
                        UI.log(`Не хватает: ${recipe.ingredients.map(i => gameData.items[i].name).join(', ')}`, 'system');
                    },
                    disabled: true
                });
            }
        }
        
        buttons.push({ label: '🔙 Назад', handler: () => this.renderHerbQuestButtons() });
        UI.renderButtons(buttons);
    },

    craftPotion(recipeId) {
        const recipe = gameData.recipes[recipeId];
        recipe.ingredients.forEach(ing => {
            const idx = window.player.inventory.indexOf(ing);
            if (idx !== -1) {
                window.player.inventory.splice(idx, 1);
            }
        });
        window.player.inventory.push(recipe.result);
        const potion = gameData.items[recipe.result];
        UI.log(`⚗️ Создано: ${potion.name}!`, 'item');
        UI.log(potion.description, 'system');
        UI.renderInventory();
        this.showCraftingMenu();
    },

    startChapter2Battle() {
        this.inCombat = true;
        this.turn = 0;
        UI.log('⚔️ ГЛАВА 2: Призрачные всадники атакуют!', 'combat');
        this.runMordredBattle();
    },

    runMordredBattle() {
        const battle = gameData.mordredBattle;

        // Проверка плохой концовки
        if (window.player.checkBadEnding && window.player.checkBadEnding()) {
             this.showChapter2BadEnding();
             return;
        }

        // Показываем вступление один раз
        if (!this.mordredIntroShown) {
            if (battle.intro) {
                UI.log(battle.intro, 'combat');
            }
            this.mordredIntroShown = true;
        }

        // Показываем корневые выборы
        this.renderBattleChoices(battle.choices, battle);
    },

    // функция для рендера выборов в любой фазе боя
    renderBattleChoices(choices, battle) {
        const buttons = choices.map(choice => {
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
                    // Применяем эффекты
                    if (choice.effect) {
                        if (choice.effect.resonance) window.player.addResonance(choice.effect.resonance);
                        if (choice.effect.control) window.player.addControl(choice.effect.control);
                        UI.updateStatus();
                    }
                    
                    // ПРОВЕРКА РЕЗОНАНСА ПОСЛЕ ВЫБОРА
                    if (window.player.resonance >= 90) {
                        this.showChapter2BadEnding();
                        return;
                    }

                    // Переходим к следующей фазе
                    if (choice.next) {
                        this.renderMordredPhase(choice.next, battle);
                    }
                }
            };
        });
        
        UI.renderButtons(buttons);
    },

    //  функция для обработки фаз боя (узлов в data.js)
    renderMordredPhase(phaseKey, battle) {
        const node = battle[phaseKey];
        if (!node) {
            console.error("Фаза боя не найдена:", phaseKey);
            return;
        }

        // Логируем текст фазы
        if (node.text) {
            UI.log(node.text, 'system');
        }

        // Если есть концовки 
        if (node.endings) {
            let endingKey = 'balance'; 
            if (window.player.resonance > 60) endingKey = 'power';
            else if (window.player.control > 70) endingKey = 'peace';
            
            const ending = node.endings[endingKey] || node.endings['balance'];
            if (ending) {
                UI.log(ending.text, 'system');
            }
            
            // Кнопка продолжения
            UI.renderButtons([
                { label: '🌲 Продолжить в Серебряный Бор', handler: () => this.loadLocation("silver_forest") }
            ]);
            return;
        }

        // Если есть выборы в этой фазе
        if (node.choices && node.choices.length > 0) {
            setTimeout(() => {
                this.renderBattleChoices(node.choices, battle);
            }, 1000);
        } 
        // Если нет выборов, но есть переход к следующей фазе
        else if (node.next) {
            setTimeout(() => {
                this.renderMordredPhase(node.next, battle);
            }, 2000);
        }
    },

    //  Функция для плохой концовки (потеря контроля)
    showChapter2BadEnding() {
        UI.log('══════════════════════════════', 'system');
        UI.log('🌀 СИЛА АЛАТАР ВЫРЫВАЕТСЯ НАРУЖУ!', 'combat');
        UI.log('Ниниэль чувствует, как пространство рвётся вокруг неё. Её глаза горят спиральным светом.', 'dialogue');
        UI.log('Вальден, создающий шар стихий, видит это — и понимает: он не успеет отменить заклинание.', 'system');
        
        setTimeout(() => {
            UI.log('💥 ВЗРЫВ!', 'combat');
            UI.flashScreen();
            UI.log('Свет Ниниэль встречается с шаром Вальдена. Пространство схлопывается.', 'combat');
            UI.log('Когда дым рассеивается... на месте хижины — огромный кратер.', 'system');
            UI.log('Ниниэль лежит на краю. Вальдена нет. Мордреда нет. Только пепел и тишина.', 'dialogue');
            UI.log('Она одна. Сила Алатар внутри неё пульсирует, но не отвечает.', 'system');
            UI.log('🔚 КОНЕЦ ИГРЫ: «Одиночество в кратере»\n*Ты потеряла контроль. Сила поглотила всё. Теперь ты — одна в разрушенном мире. История закончилась.*', 'ending');
            
            UI.renderButtons([
                { label: '🔄 Начать заново', handler: () => location.reload() }
            ]);
        }, 2000);
    },

    endChapter2() {
        const ending = gameData.mordredBattle.chapter2_end;
        
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
                const text = line.text || '';
                if (text) {
                    UI.log(text, 'dialogue');
                }
                currentIndex++;
                UI.renderButtons([{ label: '🗣️ Далее', handler: () => showNextLine() }]);
            };
            showNextLine();
            return;
        }
        
        const text = node.text || '';
        if (text) {
            UI.log(text, 'dialogue');
        }
        
        if (node.effect) {
            if (node.effect.resonance) window.player.addResonance(node.effect.resonance);
            if (node.effect.control) window.player.addControl(node.effect.control);
            if (node.effect.trust) window.player.addTrust(node.effect.trust);
            if (node.effect.health_restore) window.player.heal(50);
            UI.updateStatus();
        }
        
        if (node.effect && typeof node.effect === 'string' && node.effect.includes('collected')) {
            const herb = node.effect.replace('_collected', '');
            if (window.player.addItem(herb)) {
                UI.log(`🌿 Найдено: ${gameData.items[herb].name}`, 'item');
            }
        }

        if (node.action === "heal_player") {
            this.healGradually();
        }
        
        if (node.choices) {
            const buttons = node.choices.map(choice => ({
                label: choice.text,
                handler: () => {
                    if (choice.effect) {
                        if (choice.effect.resonance) window.player.addResonance(choice.effect.resonance);
                        if (choice.effect.control) window.player.addControl(choice.effect.control);
                        if (choice.effect.trust) window.player.addTrust(choice.effect.trust);
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
            if (node.next === 'ointment_intro') {
                this.startOintmentQuest();
                return;
            }
            
            UI.renderButtons([{ label: '➡️ Далее', handler: () => this.runStoryNode(node.next) }]);
        }
    },

    startOintmentQuest() {
        UI.log('🧴 КВЕСТ: Целебная мазь для Вальдена', 'system');
        UI.log('Соберите 4 травы: Окопник, Ивовую кору, Арнику и Мяту', 'system');
        this.ointmentCollected = {
            comfrey: false,
            willow_bark: false,
            arnica: false,
            mentha: false
        };
        this.renderOintmentQuestButtons();
    },

    renderOintmentQuestButtons() {
        const buttons = [];
        
        if (!this.ointmentCollected.comfrey) {
            buttons.push({ label: '🌿 Искать Окопник', handler: () => this.collectOintmentHerb('comfrey') });
        }
        if (!this.ointmentCollected.willow_bark) {
            buttons.push({ label: '🌱 Искать Ивовую кору', handler: () => this.collectOintmentHerb('willow_bark') });
        }
        if (!this.ointmentCollected.arnica) {
            buttons.push({ label: '🌸 Искать Арнику', handler: () => this.collectOintmentHerb('arnica') });
        }
        if (!this.ointmentCollected.mentha) {
            buttons.push({ label: '🍃 Искать Мяту', handler: () => this.collectOintmentHerb('mentha') });
        }
        
        const allCollected = Object.values(this.ointmentCollected).every(v => v === true);
        if (allCollected) {
            buttons.push({ 
                label: '✅ Вернуться к Вальдену', 
                handler: () => this.completeOintmentQuest() 
            });
        }
        
        buttons.push({ label: '🎒 Инвентарь', handler: () => UI.renderInventory() });
        UI.renderButtons(buttons);
    },

    collectOintmentHerb(herbId) {
        if (window.player.addItem(herbId)) {
            const herb = gameData.items[herbId];
            UI.log(`🌿 Найдено: ${herb.name}`, 'item');
            this.ointmentCollected[herbId] = true;
            UI.updateStatus();
        }
        this.renderOintmentQuestButtons();
    },

    completeOintmentQuest() {
        UI.log('🧴 Все травы собраны! Ниниэль возвращается к Вальдену.', 'system');
        setTimeout(() => {
            this.runStoryNode('ointment_choice');
        }, 1500);
    },

    startTraining() {
        console.log('🎮 Запуск тренировки с частицами...');
        UI.log('✨ <b>ОБУЧЕНИЕ: МАГИЯ СВЕТА</b>', 'system');
        UI.log('«Вспомни момент безопасности. Почувствуй частицы».', 'dialogue');
        
        if (typeof UI.showParticleGame === 'function') {
            console.log('✅ Функция showParticleGame найдена');
            UI.showParticleGame(() => {
                console.log('✅ Мини-игра завершена, вызываем onTrainingComplete');
                this.onTrainingComplete();
            });
        } else {
            console.error('❌ Функция showParticleGame не найдена!');
            UI.log('Ошибка загрузки мини-игры...', 'system');
        }
    },

    onTrainingComplete() {
        window.player.addControl(15);
        UI.updateStatus();
        UI.log('✨ Гармония достигнута! Ты научилась чувствовать стихии!', 'system');
        UI.log('Посох вспыхнул. «Лучше. Но должно быть как маяк».', 'item');
        this.runStoryNode('purple_energy_vision');
    },

    healGradually() {
        if (this.healInterval) clearInterval(this.healInterval);
        UI.log('🍵 Зелье действует... Силы постепенно возвращаются.', 'item');
        let currentHP = window.player.health;
        const targetHP = window.player.maxHealth;
        this.healInterval = setInterval(() => {
            if (currentHP < targetHP) {
                currentHP += 2;
                if (currentHP > targetHP) currentHP = targetHP;
                window.player.health = currentHP;
                UI.updateStatus();
            } else {
                clearInterval(this.healInterval);
                this.healInterval = null;
                UI.log('✨ Здоровье полностью восстановлено.', 'item');
            }
        }, 300);
    },

    renderActions(loc) {
        const acts = [];
        for (let [dir, target] of Object.entries(loc.exits || {})) {
            if (target && typeof target === 'string') {
                acts.push({ label: `⬇️ ${target}`, handler: () => this.loadLocation(target) });
            }
        }
        if (loc.npcs) {
            loc.npcs.forEach(npcId => {
                const npc = gameData.npcs[npcId];
                if (npc && !npc.hostile) {
                    acts.push({ label: `💬 Говорить: ${npc.name}`, handler: () => {
                        const dialog = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
                        UI.log(`${npc.name}: "${dialog}"`, 'dialogue');
                    }});
                }
            });
        }
        if (loc.items?.length) {
            acts.push({ label: '🎒 Подобрать', handler: () => {
                loc.items.forEach(i => {
                    if (window.player.addItem(i)) {
                        UI.log(`Подобрано: ${gameData.items[i].name}`, 'item');
                    }
                });
                loc.items = []; 
                UI.renderInventory(); 
                this.renderActions(loc);
            }});
        }
        acts.push({ label: '🎒 Инвентарь', handler: () => UI.renderInventory() });
        UI.renderButtons(acts);
    },

    useItem(id) {
        const result = window.player.useItem(id);
        UI.log(result, 'item');
        UI.updateStatus();
        UI.renderInventory();
    }
};
