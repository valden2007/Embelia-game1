const gameData = {
    locations: {
        canyon_ambush: {
            id: "canyon_ambush",
            name: "Тёмное Ущелье",
            description: "Хвост Василиска с хрустом пробил последний щит. Ниниэль отлетела к скале, чувствуя, как яд сжигает вены.",
            magicLevel: "low",
            exits: {},
            items: [],
            npcs: ["basilisk"],
            isIntroBattle: true
        },
        walden_hut: {
            id: "walden_hut",
            name: "Хижина Вальдена",
            description: "Уютное жилище на краю Серебряного Бора. Пахнет полынью и старыми книгами.",
            magicLevel: "high",
            exits: { south: null, herb_garden: "Сад с травами" },
            items: ["old_potion", "herb_bundle", "burnt_drawing"],
            npcs: ["walden"]
        },
        herb_garden: {
            id: "herb_garden",
            name: "Сад с травами",
            description: "Небольшой сад за хижиной. Растут полынь, лаванда, шестьцветник и другие магические травы.",
            magicLevel: "high",
            exits: { north: "walden_hut" },
            items: ["lavender", "plantain", "sixflower"],
            npcs: []
        },
        silver_forest: {
            id: "silver_forest",
            name: "Серебряный Бор",
            description: "Древний лес. Кора деревьев переливается, как ртуть.",
            magicLevel: "normal",
            exits: { north: "walden_hut", east: "tikhorechye" },
            items: ["herb_bundle"],
            npcs: ["shadow_hound"]
        },
        phantom_ambush: {
            id: "phantom_ambush",
            name: "Опушка Серебряного Бора",
            description: "На горизонте виднеются силуэты всадников в чёрных доспехах. Воздух пахнет пеплом и смертью.",
            magicLevel: "low",
            exits: {},
            items: [],
            npcs: ["phantom_rider", "mordred"],
            isChapter2Battle: true
        }
    },
    
    items: {
        old_potion: { id: "old_potion", name: "Зелье Вальдена", description: "Восстанавливает 50 HP.", effect: "health_restore", value: 50 },
        herb_bundle: { id: "herb_bundle", name: "Пучок трав", description: "Восстанавливает 30 MP.", effect: "mana_restore", value: 30 },
        burnt_drawing: { id: "burnt_drawing", name: "Обгоревший рисунок", description: "Память о родителях.", effect: "quest_item", value: 0 },
        lavender: { id: "lavender", name: "Лаванда", description: "Успокаивающая трава.", effect: "quest_item", value: 0 },
        plantain: { id: "plantain", name: "Подорожник", description: "Целебная трава.", effect: "quest_item", value: 0 },
        sixflower: { id: "sixflower", name: "Шестьцветник", description: "Редкая магическая трава.", effect: "quest_item", value: 0 }
    },
    
    npcs: {
        basilisk: { id: "basilisk", name: "Василиск", role: "boss", dialogues: ["Шшшш..."], hostile: true, health: 9999, damage: 25 },
        walden: { 
            id: "walden", 
            name: "Вальден", 
            role: "teacher", 
            dialogues: [
                "Ожила! Пей. От моих зелий никто ещё не умирал.",
                "Свет — это не просто искра, Ниниэль. Это груз, который ты выбираешь нести.",
                "Твоя кровь помнит больше, чем ты знаешь..."
            ] 
        },
        shadow_hound: { id: "shadow_hound", name: "Теневая Гончая", role: "enemy", dialogues: ["Ррр..."], hostile: true, health: 50, damage: 10 },
        phantom_rider: { id: "phantom_rider", name: "Призрачный Всадник", role: "enemy", dialogues: ["Твоя кровь... откроет врата..."], hostile: true, health: 80, damage: 15 },
        mordred: { 
            id: "mordred", 
            name: "Мордред Чёрный", 
            role: "boss", 
            dialogues: ["Ты серьёзно думала, что такие фокусы сработают?"], 
            hostile: true, 
            health: 200, 
            damage: 30,
            isChapter2Boss: true
        }
    },
    
    // Диалоги Главы 1
    chapter1Dialogues: {
        wake_up: [
            { speaker: "???", text: "Ожила! Пей. От моих зелий никто ещё не умирал." },
            { speaker: "Ниниэль", text: "Где он?", next: "dialog_2" },
            { speaker: "???", text: "Кто?", next: "dialog_3" },
            { speaker: "Ниниэль", text: "Василиск...", next: "dialog_4" },
            { speaker: "???", text: "В котле. Хотя мясо жёсткое. Но в целом съедобное.", next: "dialog_5" },
            { speaker: "Ниниэль", text: "Вы... сварили его?", next: "dialog_6" },
            { speaker: "???", text: "Не переживай: если бы я его сварил, ты бы сейчас чихала от перца. А так — только полынь да дурман.", next: "dialog_7" },
            { speaker: "Ниниэль", text: "Вы... маг?", next: "dialog_8" },
            { speaker: "???", text: "Садовод-любитель. Вальден. А ты?", next: "dialog_9" },
            { speaker: "Ниниэль", text: "Ниниэль. Я...", next: "drawing_scene" }
        ],
        
        drawing_scene: {
            text: "Ниниэль разворачивает обугленный пергамент. Детский рисунок семьи.",
            choices: [
                { 
                    text: "🔥 Протянуть рисунок Вальдену", 
                    next: "burn_drawing",
                    effect: { resonance: 15, control: -5 }
                },
                { 
                    text: "📜 Спрятать рисунок", 
                    next: "keep_drawing",
                    effect: { resonance: -5, control: 10 }
                }
            ]
        },
        
        burn_drawing: {
            text: "Вальден подносит рисунок к огню. Чернила вспыхивают синим светом. Шрам на запястье пульсирует.",
            next: "training_intro"
        },
        
        keep_drawing: {
            text: "«Ты хранишь мёртвых, вместо того чтобы защищать живых», — говорит Вальден.",
            next: "training_intro"
        },
        
        training_intro: {
            text: "«Научите меня», — говорит Ниниэль. Вальден кивает.",
            next: "herb_quest_intro"
        },
        
        // Квест: Сбор трав (показывает месяц тренировок)
        herb_quest_intro: {
            text: "«Хорошо, — говорит Вальден. — Но сначала — практика. За хижиной растёт сад. Собери: лаванду, подорожник и шестьцветник. Это поможет тебе почувствовать ритм магии».",
            next: "herb_quest_start"
        },
        
        herb_quest_start: {
            text: "Ниниэль выходит в сад. Воздух пахнет полынью и влажной землёй. Трава шепчет под пальцами.",
            choices: [
                { text: "🌿 Искать лаванду", next: "find_lavender", effect: { control: 5 } },
                { text: "🌱 Искать подорожник", next: "find_plantain", effect: { control: 3 } },
                { text: "🌸 Искать шестьцветник", next: "find_sixflower", effect: { resonance: 5 } }
            ]
        },
        
        find_lavender: {
            text: "Лаванда растёт у старого пня. Её фиолетовые цветы дрожат на ветру. Ниниэль аккуратно срывает стебель.",
            effect: "lavender_collected",
            next: "herb_quest_continue"
        },
        
        find_plantain: {
            text: "Подорожник прячется в тени. Его широкие листья покрыты росой. Ниниэль чувствует, как трава отзывается на её прикосновение.",
            effect: "plantain_collected",
            next: "herb_quest_continue"
        },
        
        find_sixflower: {
            text: "Шестьцветник светится слабым голубым светом. Когда Ниниэль касается его, шрам на запястье пульсирует в такт.",
            effect: "sixflower_collected",
            next: "herb_quest_continue"
        },
        
        herb_quest_continue: {
            text: "Собрав травы, Ниниэль возвращается к Вальдену. Старик кивает, принимая пучок.",
            next: "training_complete"
        },
        
        training_complete: {
            text: "«Неплохо, — говорит Вальден. — Ты начала слышать ритм. Но это только начало. Месяц тренировок впереди».",
            next: "time_skip"
        },
        
        time_skip: {
            text: "Прошёл месяц. Ниниэль учится управлять светом, Вальден показывает секреты магии. Шрам на руке больше не болит — он стал частью её.",
            next: "chapter2_intro"
        },
        
        // Начало Главы 2
        chapter2_intro: {
            text: "Утро. Запах полыни разбудил Ниниэль раньше рассвета. Она выглянула в окно: весь лес покрыт инеем, хотя стояло лето. На снегу чёрнели отпечатки — не лошадиные, не человечьи... знакомые.",
            next: "phantom_warning"
        },
        
        phantom_warning: {
            text: "«Молчи!» — Вальден уже стоит за спиной с посохом. — «Это следы теневых гончих. Значит, они уже близко».",
            next: "phantom_appear"
        },
        
        phantom_appear: {
            text: "Внезапно в воздухе повисло напряжение. Из тени деревьев появились фигуры в доспехах, светящихся холодным тёмным светом. Их глаза горели жутким огнём.",
            next: "battle_choice"
        },
        
        battle_choice: {
            text: "«Нам нужно сражаться», — спокойно говорит Вальден. — «Я отвлеку их, а ты используй то, чему я тебя научил».",
            choices: [
                { 
                    text: "⚔️ «Я прикрою вас!» (Атака)", 
                    next: "battle_start",
                    effect: { resonance: 10, control: -5 }
                },
                { 
                    text: "🛡️ «Я буду защищать» (Защита)", 
                    next: "battle_start",
                    effect: { resonance: -5, control: 10 }
                },
                { 
                    text: "🧘 «Я попробую контролировать» (Контроль)", 
                    next: "battle_start",
                    effect: { resonance: 0, control: 15 }
                }
            ]
        }
    },
    
    // Сценарий битвы с Мордредом (Глава 2)
    mordredBattle: {
        intro: "Мордред Чёрный, десятый из генералов призрачной армии, выходит вперёд. Его доспехи поглощают свет, а на груди — шрам в виде спирали, знак проклятого племени Алатар.",
        
        choices: [
            {
                text: "⚡ «Я уничтожу тебя!» (Полная сила)",
                condition: { minResonance: 50 },
                effect: { resonance: 20, control: -15 },
                next: "mordred_full_power"
            },
            {
                text: "🛡️ «Вальден, пригнись!» (Защита)",
                effect: { resonance: -10, control: 10 },
                next: "mordred_defend"
            },
            {
                text: "🧘 «Свет — это не ярость...» (Контроль)",
                condition: { minControl: 60 },
                effect: { resonance: -15, control: 20 },
                next: "mordred_control"
            }
        ],
        
        mordred_full_power: {
            text: "Ниниэль закричала, и боль в запястье превратилась в огонь. Шрам вспыхнул чёрно-фиолетовым. Посох треснул. Луч был не похож на свет — это была волна чистого пространства.",
            checkBadEnding: true,
            badEndingText: "Взрыв тишины накрыл поляну. Когда пыль осела, Мордреда не было. Но не было и Вальдена. Только его посох, сломанный пополам. Ниниэль упала на колени. Шрам пульсировал, удовлетворённо гудя.\n\n🔚 КОНЕЦ ИГРЫ: «Сломанный Свет»\n*Вы позволили силе Алатар поглотить себя. Без Вальдена вы не сможете контролировать дар.*",
            goodText: "Мордред ранен, но Вальден истощён. Битва продолжается...",
            next: "battle_continue"
        },
        
        mordred_defend: {
            text: "Щит вокруг учителя. Вальден безопасно завершает заклинание. Мордред отступает, но не сдаётся.",
            effect: { resonance: -10 },
            next: "battle_continue"
        },
        
        mordred_control: {
            text: "Атака слабее, но точнее. Ниниэль направляет свет не на уничтожение, а на сдерживание. Мордред поражён — он не ожидал такого контроля.",
            effect: { resonance: -20, control: 10 },
            next: "battle_continue"
        },
        
        battle_continue: {
            text: "Битва продолжается. Вальден и Ниниэль сражаются плечом к плечу. Призрачные всадники отступают, но Мордред не сдаётся.",
            next: "final_choice"
        },
        
        final_choice: {
            text: "Мордред готовится к последнему удару. Вальден ранен. Ниниэль должна решить: рискнуть силой или искать другой путь.",
            choices: [
                {
                    text: "⚡ Использовать всю силу (Риск плохой концовки)",
                    effect: { resonance: 30 },
                    next: "final_power"
                },
                {
                    text: "🤝 Объединиться с Вальденом (Баланс)",
                    effect: { control: 20 },
                    next: "final_balance"
                },
                {
                    text: "🕊️ Попытаться договориться (Мирный путь)",
                    condition: { minControl: 70 },
                    effect: { resonance: -10, control: 10 },
                    next: "final_peace"
                }
            ]
        },
        
        final_power: {
            text: "Ниниэль выпускает всю силу. Пространство разрывается. Мордред исчезает в портале, но Вальден падает, истощённый. Ниниэль чувствует, как шрам пульсирует — сила Алатар пробуждается полностью.",
            checkBadEnding: true,
            badEndingText: "🔚 КОНЕЦ ИГРЫ: «Сломанный Свет»\n*Сила поглотила тебя. Ты стала оружием, но потеряла себя.*",
            goodText: "Глава 2 завершена. Но цена победы высока...",
            next: "chapter2_end"
        },
        
        final_balance: {
            text: "Вальден и Ниниэль объединяют магию. Свет и опыт против тьмы. Мордред отступает в портал, но обещает вернуться. Вальден жив, но ранен. Ниниэль понимает: сила — это не только мощь, но и ответственность.",
            effect: { resonance: 5, control: 15 },
            next: "chapter2_end"
        },
        
        final_peace: {
            text: "Ниниэль не атакует. Она протягивает руку — не как враг, а как человек. Мордред замирает. В его глазах мелькает что-то человеческое. Он отступает, но не исчезает. «Мы ещё встретимся», — говорит он и уходит в портал.",
            effect: { resonance: -15, control: 25 },
            next: "chapter2_end"
        },
        
        chapter2_end: {
            text: "🌅 Глава 2 завершена.\n\nСтатус:\n" + 
                "🌀 Резонанс: {resonance}%\n" +
                "⚡ Контроль: {control}%\n\n" +
                "✅ Баланс сохранён. Ты на пути к истинной силе."
        }
    }
};