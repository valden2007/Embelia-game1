document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Эмбедия: Запуск...');
    Game.init();

    document.getElementById('save-btn').onclick = () => UI.showModal('Сохранение', 'Функция в разработке (localStorage)');
    document.getElementById('load-btn').onclick = () => UI.showModal('Загрузка', 'Функция в разработке (localStorage)');
    document.getElementById('reset-btn').onclick = () => {
        if (confirm('Начать заново?')) location.reload();
    };
});     