const tg = window.Telegram?.WebApp || null;

function syncAppHeight() {
  const h = tg?.viewportHeight || window.innerHeight;
  document.documentElement.style.setProperty('--app-h', `${h}px`);
}

function applyTelegramTheme() {
  if (!tg) return;

  const p = tg.themeParams || {};
  const root = document.documentElement;

  // Если Telegram отдаёт цвета — подстроим текст/подсказки
  if (p.text_color) root.style.setProperty('--text', p.text_color);
  if (p.hint_color) root.style.setProperty('--muted', p.hint_color);

  // Попросим Telegram оформить системные цвета (если доступно)
  try { tg.setHeaderColor?.('secondary_bg_color'); } catch (_) {}
  try { tg.setBackgroundColor?.(p.bg_color || '#0b1220'); } catch (_) {}
}

function initTelegram() {
  syncAppHeight();
  window.addEventListener('resize', syncAppHeight);

  if (!tg) return;

  tg.ready();
  tg.expand();

  // помогает на iOS, чтобы не “дёргалось”
  try { tg.disableVerticalSwipes?.(); } catch (_) {}

  applyTelegramTheme();

  try { tg.onEvent('viewportChanged', syncAppHeight); } catch (_) {}
}

function showDemoAction(text) {
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

  document.getElementById('btnBack')?.addEventListener('click', () => {
    if (tg?.close) tg.close();
    else history.back();
  });

  document.getElementById('btnMore')?.addEventListener('click', () => {
    showDemoAction('Меню: позже добавим экран "Ещё".');
  });

  document.querySelectorAll('.tile').forEach(btn => {
    btn.addEventListener('click', () => {
      showDemoAction(`Открыть раздел: ${btn.dataset.route} (демо).`);
    });
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showDemoAction(`Нижнее меню: ${tab.dataset.tab} (демо).`);
    });
  });
});
