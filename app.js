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
// ===== ДАННЫЕ (пока статичные) =====
const data = {
  stats: {
    total: 150,
    active: 130,
    repair: 10,
    idle: 10,
    accident: 3,
    repairLoss: "459 000",
    idleLoss: "35 000",
    deposits: "350 000"
  }
};

// ===== ГЛАВНАЯ =====
function renderHome() {
  // Заголовок приветствия
  const welcome = document.getElementById('welcomeTitle');
  if (welcome) {
    welcome.innerText =
      role === 'owner' ? 'Здравствуйте, владелец' :
      role === 'manager' ? 'Здравствуйте, менеджер' :
      'Здравствуйте, механик';
  }

  // Статистика (видят все)
  const statsEl = document.getElementById('stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="card">🚘 Авто всего: ${data.stats.total}</div>
      <div class="card">🟢 На линии: ${data.stats.active}</div>
      <div class="card">🔧 В ремонте: ${data.stats.repair}</div>
      <div class="card">⏸ В простое: ${data.stats.idle}</div>
      <div class="card">⚠️ ДТП за неделю: ${data.stats.accident}</div>
    `;
  }

  // Финансы (по ролям)
  const finance = document.getElementById('finance');
  if (!finance) return;

  finance.innerHTML = '';

  if (role === 'owner') {
    finance.innerHTML = `
      <div class="card">🔧 Потери на ремонте: -${data.stats.repairLoss}</div>
      <div class="card">🚫 Потери на простое: -${data.stats.idleLoss}</div>
      <div class="card">💳 Депозиты: ${data.stats.deposits}</div>
    `;
  } else if (role === 'manager') {
    finance.innerHTML = `
      <div class="card">🔧 Потери: есть</div>
      <div class="card">🚫 Простой: есть</div>
      <div class="card">💳 Депозиты: есть</div>
    `;
  } else {
    // mechanic — финансы не показываем
    finance.innerHTML = '';
  }
}
window.setRole = setRole;
window.goTo = goTo;
window.openCar = openCar;
window.saveInspection = saveInspection;
window.logout = logout;
document.addEventListener('DOMContentLoaded', () => {
  role = detectRole();
  showScreen('homeScreen');
  renderHome();
});
