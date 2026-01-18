// Telegram WebApp init
const tg = window.Telegram ? window.Telegram.WebApp : null;

let tgUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  tgUser = tg.initDataUnsafe?.user || null;
}

// Твой Telegram user id (владелец)
const OWNER_TG_ID = 658384304;

let role = null; // 'owner' | 'manager' | 'mechanic'

// Показываем нужный экран
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// Авто-роль по Telegram (если зашли из TG)
function detectRole() {
  if (!tgUser) return null;
  if (tgUser.id === OWNER_TG_ID) return 'owner';
  return null; // остальных пока выбираем кнопкой
}

// Выбор роли
function setRole(selectedRole) {
  role = selectedRole;
  showScreen('homeScreen');
  renderHome();
}

// Выход
function logout() {
  role = null;
  showScreen('roleScreen');
}

// Переходы
function goTo(screen) {
  showScreen(screen);
}

// При запуске
(function init() {
  const auto = detectRole();
  if (auto) {
    role = auto;
    showScreen('homeScreen');
    renderHome();
  } else {
    showScreen('roleScreen');
  }
})();
