></div>
        <div class="card">🚫 Простой: <b>есть</b></div>
        <div class="card">💳 Депозиты: <b>есть</b></div>
      `;
    } else {
      // mechanic — финансы не показываем
      finance.innerHTML = '';
    }
  }
}

// ===== Navigation =====
function goTo(screen) {
  showScreen(screen);
  if (screen === 'carsScreen') renderCars();
}

// ===== Cars list =====
function renderCars() {
  const el = document.getElementById('carsList');
  if (!el) return;

  el.innerHTML = data.cars.map((car, i) => `
    <div class="card" onclick="openCar(${i})" style="cursor:pointer;">
      🚗 ${car.number} — ${car.model}

      Статус: ${car.status}

      Простой: ${car.days} дней
    </div>
  `).join('');
}

// ===== Car card =====
let selectedCarIndex = null;

function openCar(i) {
  selectedCarIndex = i;
  const car = data.cars[i];

  const title = document.getElementById('carTitle');
  if (title) title.innerText = `${car.number} — ${car.model}`;

  let html = `
    <div class="card">
      <div><b>Статус:</b> ${car.status}</div>
      <div><b>Простой:</b> ${car.days} дней</div>
    </div>
  `;

  if (role === 'owner' || role === 'manager') {
    html += `<div class="card"><b>Водитель:</b> ${car.driver || '—'}</div>`;
  }

  if (role === 'owner') {
    html += `<div class="card"><b>Потери:</b> ${car.loss ? car.loss : '—'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit ? car.deposit : '—'}</div>`;
  } else if (role === 'manager') {
    html += `<div class="card"><b>Потери:</b> ${car.loss ? 'есть' : 'нет'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit ? 'есть' : 'нет'}</div>`;
  }

  const carInfo = document.getElementById('carInfo');
  if (carInfo) carInfo.innerHTML = html;

  // блок механика
  const mechBlock = document.getElementById('mechBlock');
  if (mechBlock) mechBlock.style.display = (role === 'mechanic') ? 'block' : 'none';

  const mechSaved = document.getElementById('mechSaved');
  if (mechSaved) mechSaved.innerText = '';

  goTo('carScreen');
}

function saveInspection() {
  const car = data.cars[selectedCarIndex];
  const files = document.getElementById('mechPhotos')?.files;
  const comment = document.getElementById('mechComment')?.value || '';

  const ok = document.getElementById('chkOk')?.checked || false;
  const repair = document.getElementById('chkRepair')?.checked || false;
  const critical = document.getElementById('chkCritical')?.checked || false;

  data.inspections[car.number] = {
    photosCount: files ? files.length : 0,
    comment,
    ok, repair, critical,
    date: new Date().toLocaleString()
  };

  const mechSaved = document.getElementById('mechSaved');
  if (mechSaved) {
    mechSaved.innerText = `✅ Сохранено: ${files ? files.length : 0} фото, ${new Date().toLocaleString()}`;
  }
}/b


// ===== Telegram WebApp init (без падений вне Telegram) =====
const tg = (window.Telegram && window.Telegram.WebApp)
  ? window.Telegram.WebApp
  : null;

let tgUser = null;

if (tg) {
  tg.ready();
  tg.expand();
  tgUser = tg.initDataUnsafe?.user || null;
}

// ===== Roles =====
const OWNER_TG_ID = 658384304; // <-- твой Telegram ID (числом)

let role = null;

function detectRole() {
  if (!tgUser) return null;          // если не из Telegram — роли нет
  if (tgUser.id === OWNER_TG_ID) return 'owner';
  return 'manager';                   // по умолчанию
}

// ===== Demo data =====
const data = {
  stats: {
    total: 150,
    active: 130,
    repair: 10,
    idle: 10,
    accident: 3,

    // по твоему ТЗ: показываем как есть, без ₽
    repairLoss: "459 000",
    idleLoss: "35 000",
    deposits: "350 000"
  },

  cars: [
    { number: "K526CA78", model: "Volkswagen Polo", driver: "Юрий Иванов", status: "В ремонте", days: 12, loss: "175 000", deposit: "0" },
    { number: "A317BT77", model: "Kia Rio", driver: "Роман Смирнов", status: "На линии", days: 0, loss: "", deposit: "5 000" },
    { number: "M842OP178", model: "Hyundai Solaris", driver: "Артём Ковалёв", status: "На линии", days: 0, loss: "", deposit: "5 000" },
    { number: "T904EK98", model: "Skoda Rapid", driver: "Сергей Михайлов", status: "В простое", days: 5, loss: "35 000", deposit: "" },
    { number: "H115XP777", model: "Renault Logan", driver: "Павел Орлов", status: "ДТП", days: 7, loss: "96 000", deposit: "" },
    { number: "E662AA78", model: "LADA Vesta", driver: "Дмитрий Соколов", status: "В ремонте", days: 3, loss: "58 000", deposit: "" },
    { number: "X908KM198", model: "Toyota Camry", driver: "Николай Фёдоров", status: "На линии", days: 0, loss: "", deposit: "10 000" }
  ],

  inspections: {} // сохранение осмотров механика по номеру авто
};

// ===== Screen helpers =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// ===== Entry point =====
window.addEventListener('DOMContentLoaded', () => {
  role = detectRole();

  if (role) {
    showScreen('homeScreen');
    renderHome();
  } else {
    // если открыли просто в браузере (без Telegram)
    showScreen('roleScreen');
  }
});

// ===== Role screen (fallback manual) =====
function setRole(selectedRole) {
  role = selectedRole;
  showScreen('homeScreen');
  renderHome();
}

function logout() {
  // в Telegram “выйти” обычно не нужно, но оставим как демо
  role = detectRole(); // вернём роль по Telegram
  if (role) {
    showScreen('homeScreen');
    renderHome();
  } else {
    showScreen('roleScreen');
  }
}

// ===== Home =====
function renderHome() {
  const name = tgUser?.first_name || "Пользователь";
  const s = data.stats;

  // Заголовок
  const welcomeTitle = document.getElementById('welcomeTitle');
  if (welcomeTitle) {
    welcomeTitle.innerText =
      role === 'owner' ? `Здравствуйте, ${name}! (Владелец)` :
      role === 'manager' ? `Здравствуйте, ${name}! (Менеджер)` :
      `Здравствуйте, ${name}! (Механик)`;
  }

  // Статы
  const statsEl = document.getElementById('stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="card">🚘 Авто всего: <b>${s.total}</b></div>
      <div class="card">🟢 На линии: <b>${s.active}</b></div>
      <div class="card">🔧 В ремонте: <b>${s.repair}</b></div>
      <div class="card">⏸️ В простое: <b>${s.idle}</b></div>
      <div class="card">⚠️ ДТП за неделю: <b>${s.accident}</b></div>
    `;
  }

  // Финансы
  const finance = document.getElementById('finance');
  if (finance) {
    finance.innerHTML = '';

    if (role === 'owner') {
      finance.innerHTML = `
        <div class="card">🔧 Потери на ремонте: -<b>${s.repairLoss}</b></div>
        <div class="card">🚫 Потери на простое: -<b>${s.idleLoss}</b></div>
        <div class="card">💳 Депозиты: <b>${s.deposits}</b></div>
      `;
    } else if (role === 'manager') {
      finance.innerHTML = `
        <div class="card">🔧 Потери: <b>есть<


></div>
        <div class="card">🚫 Простой: <b>есть</b></div>
        <div class="card">💳 Депозиты: <b>есть</b></div>
      `;
    } else {
      // mechanic — финансы не показываем
      finance.innerHTML = '';
    }
  }
}

// ===== Navigation =====
function goTo(screen) {
  showScreen(screen);
  if (screen === 'carsScreen') renderCars();
}

// ===== Cars list =====
function renderCars() {
  const el = document.getElementById('carsList');
  if (!el) return;

  el.innerHTML = data.cars.map((car, i) => `
    <div class="card" onclick="openCar(${i})" style="cursor:pointer;">
      🚗 ${car.number} — ${car.model}

      Статус: ${car.status}

      Простой: ${car.days} дней
    </div>
  `).join('');
}

// ===== Car card =====
let selectedCarIndex = null;

function openCar(i) {
  selectedCarIndex = i;
  const car = data.cars[i];

  const title = document.getElementById('carTitle');
  if (title) title.innerText = `${car.number} — ${car.model}`;

  let html = `
    <div class="card">
      <div><b>Статус:</b> ${car.status}</div>
      <div><b>Простой:</b> ${car.days} дней</div>
    </div>
  `;

  if (role === 'owner' || role === 'manager') {
    html += `<div class="card"><b>Водитель:</b> ${car.driver || '—'}</div>`;
  }

  if (role === 'owner') {
    html += `<div class="card"><b>Потери:</b> ${car.loss ? car.loss : '—'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit ? car.deposit : '—'}</div>`;
  } else if (role === 'manager') {
    html += `<div class="card"><b>Потери:</b> ${car.loss ? 'есть' : 'нет'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit ? 'есть' : 'нет'}</div>`;
  }

  const carInfo = document.getElementById('carInfo');
  if (carInfo) carInfo.innerHTML = html;

  // блок механика
  const mechBlock = document.getElementById('mechBlock');
  if (mechBlock) mechBlock.style.display = (role === 'mechanic') ? 'block' : 'none';

  const mechSaved = document.getElementById('mechSaved');
  if (mechSaved) mechSaved.innerText = '';

  goTo('carScreen');
}

function saveInspection() {
  const car = data.cars[selectedCarIndex];
  const files = document.getElementById('mechPhotos')?.files;
  const comment = document.getElementById('mechComment')?.value || '';

  const ok = document.getElementById('chkOk')?.checked || false;
  const repair = document.getElementById('chkRepair')?.checked || false;
  const critical = document.getElementById('chkCritical')?.checked || false;

  data.inspections[car.number] = {
    photosCount: files ? files.length : 0,
    comment,
    ok, repair, critical,
    date: new Date().toLocaleString()
  };

  const mechSaved = document.getElementById('mechSaved');
  if (mechSaved) {
    mechSaved.innerText = `✅ Сохранено: ${files ? files.length : 0} фото, ${new Date().toLocaleString()}`;
  }
}/b
