(function () {
  const tg = window.Telegram?.WebApp || null;

  function initTelegram() {
    if (!tg) return;

    try { tg.ready(); } catch (_) {}
    try { tg.expand(); } catch (_) {}

    try { tg.setHeaderColor?.('#0b1428'); } catch (_) {}
    try { tg.setBackgroundColor?.('#0b1220'); } catch (_) {}
  }

  function initGreeting() {
    const titleEl = document.getElementById('helloTitle');
    const avatarEl = document.getElementById('tgAvatar');

    let name = 'Остап';

    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      name = (u.first_name || u.username || 'Остап').trim();
    }

    if (titleEl) titleEl.textContent = `Здравствуйте, ${name}!`;

    // В WebApp нет прямого доступа к аватарке пользователя без бота/сервера.
    // Делаем "телеграм-плашку" с первой буквой имени (визуально как аватар).
    if (avatarEl) {
      const letter = (name || 'P').charAt(0).toUpperCase();
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#2b6cff" stop-opacity="0.95"/>
              <stop offset="1" stop-color="#25d3ff" stop-opacity="0.75"/>
            </linearGradient>
          </defs>
          <rect width="120" height="120" rx="60" fill="url(#g)"/>
          <text x="60" y="74" text-anchor="middle" font-size="56"
                font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial"
                fill="white" font-weight="800">${letter}</text>
        </svg>`;
      avatarEl.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
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
    initGreeting();
    bindUI();
  });
})();
function setTelegramUserUI() {
  const tg = window.Telegram?.WebApp || null;
  const user = tg?.initDataUnsafe?.user || null;

  const titleEl = document.getElementById('tgHelloTitle');
  const subEl = document.getElementById('tgHelloSub');

  // Имя
  const name =
    user?.first_name ||
    user?.username ||
    'водитель';

  if (titleEl) titleEl.textContent = `Здравствуйте, ${name}!`;

  // Аватар (если Telegram отдаёт photo_url)
  const img = document.getElementById('tgAvatar');
  const fallback = document.getElementById('tgAvatarFallback');

  if (img && fallback) {
    const photo = user?.photo_url || '';
    if (photo) {
      img.src = photo;
      img.style.display = 'block';
      fallback.style.display = 'none';
    } else {
      img.style.display = 'none';
      fallback.style.display = 'flex';
      fallback.textContent = (name?.[0] || '👤').toUpperCase();
    }
  }

  // Подстрока (можешь позже менять цифры из данных)
  if (subEl) subEl.textContent = 'На линии: 58 водителей · 124 авто';
}

document.addEventListener('DOMContentLoaded', () => {
  setTelegramUserUI();
});

