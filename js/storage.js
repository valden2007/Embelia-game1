// js/storage.js
// Модуль сохранения и загрузки игры

const Storage = {
    SAVE_KEY: 'embedia_save_v1',

    // Сохранение состояния игры
    save() {
        try {
            const saveData = {
                player: { ...player }, // Копия объекта игрока
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            UI.showModal('Сохранение', 'Игра успешно сохранена!');
            console.log('Game saved:', saveData);
        } catch (error) {
            console.error('Save error:', error);
            UI.showModal('Ошибка', 'Не удалось сохранить игру. Возможно, переполнено хранилище.');
        }
    },

    // Загрузка состояния игры
    load() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            
            if (!saveData) {
                UI.showModal('Информация', 'Сохранений не найдено. Начните новую игру.');
                return false;
            }

            const data = JSON.parse(saveData);
            
            // Восстанавливаем игрока
            Object.assign(player, data.player);
            
            UI.showModal('Загрузка', `Игра загружена! Время сохранения: ${new Date(data.timestamp).toLocaleString()}`);
            console.log('Game loaded:', data);
            return true;
        } catch (error) {
            console.error('Load error:', error);
            UI.showModal('Ошибка', 'Не удалось загрузить игру. Файл сохранения повреждён.');
            return false;
        }
    },

    // Проверка наличия сохранения
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    // Сброс сохранения (новая игра)
    reset() {
        localStorage.removeItem(this.SAVE_KEY);
        location.reload(); // Перезагрузка страницы
    }
};