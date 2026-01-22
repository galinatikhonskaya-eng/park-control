(function () {
  const tg = window.Telegram?.WebApp || null;

  function initTelegram() {
    if (!tg) return;
    try { tg.ready(); } catch (_) {}
    try { tg.expand(); } catch (_) {}
    try { tg.setHeaderColor?.('#0b0b18'); } catch (_) {}
    try { tg.setBackgroundColor?.('#0b0b18'); } catch (_) {}
  }

  function setUserHeader() {
    const titleEl = document.getElementById('tgHelloTitle');
    const subEl = document.getElementById('tgHelloSub');
    const img = document.getElementById('tgAvatar');

    const user = tg?.initDataUnsafe?.user || null;

    const name = (user?.first_name || user?.username || 'Остап').trim();

    if (titleEl) titleEl.textContent = `Здравствуйте, ${name}!`;
    if (subEl) subEl.textContent = 'На линии: 58 водителей · 124 авто';

    // Фото: если Telegram отдаёт photo_url — ставим. Если нет — просто будет пусто (как ты хотела).
    if (img) {
      const photo = user?.photo_url || '';
      if (photo) {
        img.src = photo;
      } else {
        // оставляем пусто, не подставляем иконки/буквы
        img.removeAttribute('src');
      }
    }
  }

  function bindUI() {
    document.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      if (tg?.close) tg.close();
      else history.back();
    });

    document.querySelectorAll('[data-route]').forEach((el) => {
      el.addEventListener('click', () => {
        const route = el.getAttribute('data-route');
        try { tg?.HapticFeedback?.impactOccurred('light'); } catch (_) {}
        console.log('route:', route);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    setUserHeader();
    bindUI();
  });
})();
