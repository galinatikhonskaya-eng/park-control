if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();  // Обязательно вызвать ready, если ещё не вызван

  // Отключаем вертикальный свайп (закрытие/сворачивание при скролле вниз)
  window.Telegram.WebApp.disableVerticalSwipes();  // или .setAllowVerticalSwipes(false) в некоторых версиях
}
