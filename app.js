// ===== Telegram WebApp init =====
const tg = window.Telegram?.WebApp || null;

function applyTelegramTheme() {
  if (!tg) return;

  const p = tg.themeParams || {};
  // Telegram часто отдаёт цвета, но не всегда.
  // Делаем мягкую интеграцию: если есть — используем.
  const root = document.documentElement;

  if (p.bg_color) root.style.setProperty('--bg', p.bg_color);
  if (p.text_color) root.style.setProperty('--text', p.text_color);
  if (p.hint_color) root.style.setProperty('--muted', p.hint_color);

  // Попросим Telegram покрасить системную шапку/фон (если доступно)
  try { tg.setHeaderColor?.('secondary_bg_color'); } catch (_) {}
  try { tg.setBackgroundColor?.(p.bg_color || '#0b1220'); } catch (_) {}
}

function initTelegram() {
  if (!tg) return;

  tg.ready();
  tg.expand();

  applyTelegramTheme();

  // Если хотим: показать нативную кнопку назад Telegram
  // (пока оставим свою, как на макете)
  // tg.BackButton.show();
  // tg.BackButton.onClick(() => console.log('Back'));
}

// ===== UI handlers =====
function showDemoAction(text) {
  // Внутри Telegram лучше использовать встроенный popup, в браузере — alert
  if (tg?.showPopup) {
    tg.showPopup({
      title: 'Demo',
      message: text,
      buttons: [{ id: 'ok', type: 'ok', text: 'Ок' }]
    });
  } else {
    alert(text);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTelegram();

  // Topbar buttons
  document.getElementById('btnBack')?.addEventListener('click', () => {
    // если внутри Telegram — можно закрывать миниапп
    if (tg?.close) tg.close();
    else history.back();
  });

  document.getElementById('btnMore')?.addEventListener('click', () => {
    showDemoAction('Меню: позже добавим экран "Ещё".');
  });

  // Tiles
  document.querySelectorAll('.tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      showDemoAction(`Открыть раздел: ${route} (демо).`);
    });
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showDemoAction(`Нижнее меню: ${tab.dataset.tab} (демо).`);
    });
  });
});
