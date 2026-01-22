// Park Control — Demo (Telegram WebApp ready)
(function () {
  const tg = window.Telegram?.WebApp;

  // ===== Telegram init =====
  function initTelegram() {
    if (!tg) return;

    try { tg.ready(); } catch (_) {}
    try { tg.expand(); } catch (_) {}

    // theme colors (safe)
    try { tg.setHeaderColor?.('#0b1428'); } catch (_) {}
    try { tg.setBackgroundColor?.('#0b1220'); } catch (_) {}

    // iOS viewport fixes
    const setVh = () => {
      const h = tg.viewportStableHeight || window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
    };
    setVh();
    try { tg.onEvent('viewportChanged', setVh); } catch (_) {}
  }

  // ===== Greeting + Avatar =====
  function initGreeting() {
    const titleEl = document.getElementById('helloTitle');
    const avatarEl = document.getElementById('tgAvatar');

    const fallbackName = 'Остап';
    let name = fallbackName;

    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user;
      name = (u.first_name || u.username || fallbackName).trim();
    }

    if (titleEl) titleEl.textContent = `Здравствуйте, ${name}!`;

    // Telegram WebApp не отдаёт photo_url напрямую.
    // Делаем красивую телеграм-плашку с первой буквой имени.
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

  // ===== Basic interactions (demo) =====
  function bindUI() {
    // back
    document.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      if (tg?.BackButton) {
        // Если захочешь реальную навигацию — сделаем роутер.
      }
      if (tg?.close) tg.close();
      else history.back();
    });

    // tile click demo
    document.querySelectorAll('[data-route]').forEach((el) => {
      el.addEventListener('click', () => {
        const route = el.getAttribute('data-route');
        if (tg?.HapticFeedback) {
          try { tg.HapticFeedback.impactOccurred('light'); } catch (_) {}
        }
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
