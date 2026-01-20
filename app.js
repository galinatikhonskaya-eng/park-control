const APP_VERSION = "3";
const LS_VER = "pc_ver";

(function forceUpdate() {
  try {
    const v = localStorage.getItem(LS_VER);
    if (v !== APP_VERSION) {
      localStorage.setItem(LS_VER, APP_VERSION);
      // можно сбросить роль при обновлении, чтобы не тянуло старые состояния
      localStorage.removeItem(LS_ROLE);
    }
  } catch (e) {}
})();


'use strict';

// Telegram init (safe)
const tg = window.Telegram?.WebApp || null;

function isTelegramEnv() {
  // В реальном Telegram всегда есть initData (не пустая строка)
  return !!(tg && typeof tg.initData === 'string' && tg.initData.length > 0);
}

function initTelegram() {
  const chipEnv = document.getElementById('chip-env');
  if (chipEnv) chipEnv.textContent = isTelegramEnv() ? 'Telegram' : 'Web';

  if (!tg) return;

  try {
    tg.ready();
    tg.expand();

    const tp = tg.themeParams || {};
    if (tp.bg_color) document.documentElement.style.setProperty('--bg', tp.bg_color);
    if (tp.text_color) document.documentElement.style.setProperty('--text', tp.text_color);
    if (tp.hint_color) document.documentElement.style.setProperty('--muted', tp.hint_color);
    if (tp.button_color) document.documentElement.style.setProperty('--accent', tp.button_color);

    tg.BackButton.onClick(() => {
      if (currentScreen === 'role') return;
      goBack();
    });
  } catch (e) {
    // no-op
  }
}

// Mock data
const state = { role: null, currentCarId: null, carFilter: null };

const stats = {
  carsTotal: 150,
  onLine: 100,
  inRepair: 5,
  idle: 2,
  dptWeek: 1,
  lossRepair: 593000,
  lossIdle: 175000,
  deposits: 320000
};

const cars = [
  { id:'А101АА', model:'Kia Rio',          status:'online',   idleDays:0, driver:'Иван',   loss:593000, deposit:320000 },
  { id:'В202ВВ', model:'Hyundai Solaris',  status:'repair',   idleDays:6, driver:'Сергей', loss:175000, deposit:120000 },
  { id:'С303СС', model:'VW Polo',          status:'idle',     idleDays:3, driver:'—',      loss:0,      deposit:0 },
  // остальные можно оставить как есть, или потом тоже дописать

  { id: 'Е505ЕЕ', model: 'Renault Logan',   status: 'accident', idleDays: 2 },
  { id: 'К777КК', model: 'Skoda Rapid',     status: 'online',   idleDays: 0 },

  { id: 'М111ММ', model: 'Toyota Camry',    status: 'online',   idleDays: 0 },
  { id: 'Н222НН', model: 'Kia K5',          status: 'idle',     idleDays: 1 },
  { id: 'О333ОО', model: 'Lada Granta',     status: 'repair',   idleDays: 9 },
  { id: 'Р444РР', model: 'Chery Tiggo 7',   status: 'online',   idleDays: 0 },
  { id: 'Т555ТТ', model: 'Geely Coolray',   status: 'idle',     idleDays: 4 },
];



function statusBadge(status) {
  const s = String(status || '').trim().toLowerCase();

  // online / линия
  if (s === 'online' || s.includes('линия') || s.includes('на линии')) {
    return { cls: 'ok', text: '🟢 На линии' };
  }

  // repair / ремонт
  if (s === 'repair' || s.includes('ремонт') || s.includes('в ремонте')) {
    return { cls: 'warn', text: '🛠 Ремонт' };
  }

  // idle / простой
  if (s === 'idle' || s.includes('простой') || s.includes('в простое')) {
    return { cls: 'warn', text: '⏸ Простой' };
  }

  // accident / дтп
  if (s === 'accident' || s.includes('дтп')) {
    return { cls: 'bad', text: '⚠️ ДТП' };
  }

  return { cls: '', text: status || '' };
}

// Navigation
const screens = {};
let navStack = ['role'];
let currentScreen = 'role';

function bindScreens() {
  screens.role = document.getElementById('screen-role');
  screens.home = document.getElementById('screen-home');
  screens.cars = document.getElementById('screen-cars');
  screens.car  = document.getElementById('screen-car');
  screens.docs = document.getElementById('screen-docs');
}

function setActiveScreen(name) {
  Object.keys(screens).forEach(k => screens[k] && screens[k].classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
  currentScreen = name;

  if (tg) {
    try {
      if (name === 'role') tg.BackButton.hide();
      else tg.BackButton.show();
    } catch (e) {}
  }
}

function goTo(name) {
  if (!screens[name]) return;
  if (name === 'role') {
    logout();
    return;
  }
  navStack.push(name);
  setActiveScreen(name);

  if (name === 'home') renderHome();
  if (name === 'cars') renderCarsList();
  if (name === 'car') renderCarCard();
}
function goBack() {
  if (navStack.length <= 1) return;
  navStack.pop();
  const prev = navStack[navStack.length - 1];
  setActiveScreen(prev);

  if (prev === 'home') renderHome();
  if (prev === 'cars') renderCarsList();
  if (prev === 'car') renderCarCard();
}

// Expose to window (required)
window.goTo = goTo;
window.goBack = goBack;

// Role logic
const LS_ROLE = 'pc_role';
const LS_INSPECTIONS = 'pc_inspections';

function getRoleTitle(role) {
  if (role === 'owner') return 'Владелец';
  if (role === 'manager') return 'Менеджер';
  if (role === 'mechanic') return 'Механик';
  return '';
}
function roleGreeting(role) {
  if (role === 'owner') return 'Здравствуйте, владелец';
  if (role === 'manager') return 'Здравствуйте, менеджер';
  if (role === 'mechanic') return 'Здравствуйте, механик';
  return 'Здравствуйте';
}

function loadRole() {
  const saved = localStorage.getItem(LS_ROLE);
  if (saved === 'owner' || saved === 'manager' || saved === 'mechanic') {
    state.role = saved;
    return saved;
  }
  return null;
}
function setRole(role) {
  if (!(role === 'owner' || role === 'manager' || role === 'mechanic')) return;

  state.role = role;
  localStorage.setItem(LS_ROLE, role);

  toast('Роль: ' + getRoleTitle(role));
  goTo('home');
}
window.setRole = setRole;
function logout() {
  localStorage.removeItem(LS_ROLE);
  state.role = null;
  navStack = ['role'];
  setActiveScreen('role');
  toast('Роль сброшена');
}

window.setRole = setRole;
window.logout = logout;

// Screens render
function renderHome() {
  const r = state.role;

  // приветствие
  const greet = document.getElementById('home-greet');
  if (greet) greet.textContent = roleGreeting(r);

  // цифры в шапке
  const elTotalCars = document.getElementById('home-total-cars');
  const elOnlineDrivers = document.getElementById('home-online-drivers');

  const totalCars = (stats?.carsTotal ?? cars?.length ?? 0);
  const onlineDrivers = (stats?.onLine ?? 0);

  if (elTotalCars) elTotalCars.textContent = String(totalCars);
  if (elOnlineDrivers) elOnlineDrivers.textContent = String(onlineDrivers);

  // мини-показатели
  const elRepair = document.getElementById('home-repair');
  const elDtp = document.getElementById('home-dtp');
  if (elRepair) elRepair.textContent = String(stats?.inRepair ?? 0);
  if (elDtp) elDtp.textContent = String(stats?.dptWeek ?? 0);

  // финансы (механику скрываем)
  const financeWrap = document.getElementById('home-finance');
  if (r === 'mechanic') {
    if (financeWrap) financeWrap.style.display = 'none';
  } else {
    if (financeWrap) financeWrap.style.display = 'grid';

    const lossRepair = Number(stats?.lossRepair ?? 0);
    const lossIdle = Number(stats?.lossIdle ?? 0);
    const deposits = Number(stats?.deposits ?? 0);
    const balance = deposits - lossRepair - lossIdle;

    const elLossRepair = document.getElementById('home-loss-repair');
    const elLossIdle = document.getElementById('home-loss-idle');
    const elDeposits = document.getElementById('home-deposits');
    const elBalance = document.getElementById('home-balance');

    if (elLossRepair) elLossRepair.textContent = '-' + fmtRub(lossRepair);
    if (elLossIdle) elLossIdle.textContent = '-' + fmtRub(lossIdle);
    if (elDeposits) elDeposits.textContent = fmtRub(deposits);
    if (elBalance) elBalance.textContent = fmtRub(balance);
  }

  // клики по плиткам (внутренние разделы)
  const tiles = document.getElementById('home-tiles');
  if (tiles && !tiles.dataset.bound) {
    tiles.dataset.bound = '1';
    tiles.querySelectorAll('.tile').forEach(btn => {
      btn.onclick = () => {
        const screen = btn.dataset.screen;
        if (screen) goTo(screen);
      };
    });
  

  // клики по мини-статам (ремонт/дтп) -> сразу в авто с фильтром
  const minis = document.querySelectorAll('.miniStats .mini');
  minis.forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.onclick = () => {
      const f = btn.dataset.carfilter;
      if (f) state.carFilter = f;
      goTo('cars');
      renderCarsList?.();
    };
  });

  // нижнее меню
  const bottom = document.querySelectorAll('.bottomNav [data-screen]');
  bottom.forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.onclick = () => {
      const screen = btn.dataset.screen;
      if (screen) goTo(screen);
    };
  });
}

  // Клики по мини-статам (ремонт/дтп) -> сразу в авто и фильтр
  document.querySelectorAll('.miniStats .mini').forEach(btn => {
    btn.onclick = () => {
      const f = btn.dataset.carfilter;
      if (f) state.carFilter = f; // если у тебя есть state.carFilter
      goTo('cars');
      renderCarsList?.();
    };
  });
}
function normPlate(s) {
  s = String(s || '').trim().toLowerCase();

  const map = {
    '\u0430': 'a', // а
    '\u0432': 'b', // в
    '\u0435': 'e', // е
    '\u043a': 'k', // к
    '\u043c': 'm', // м
    '\u043d': 'h', // н
    '\u043e': 'o', // о
    '\u0440': 'p', // р
    '\u0441': 'c', // с
    '\u0442': 't', // т
    '\u0443': 'y', // у
    '\u0445': 'x'  // х
  };

  return s.replace(/[\u0430\u0432\u0435\u043a\u043c\u043d\u043e\u0440\u0441\u0442\u0443\u0445]/g, ch => map[ch] || ch);
}

function setCarFilter(filter, btn) {
  state.carFilter = filter;

  // подсветка активной кнопки
  document.querySelectorAll('#screen-cars .chips .chipBtn, #screen-cars .chips .chip')
    .forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderCarsList();
}
window.setCarFilter = setCarFilter;
function renderCarsList() {
  const list = document.getElementById('cars-list');
  if (!list) return;
  list.innerHTML = '';

  const q = normPlate(document.getElementById('cars-q')?.value || '');
  const filter = state.carFilter || 'all'; // all | online | repair | idle | accident

  const filtered = cars.filter(c => {
   const idStr = normPlate(c.id ?? '');
const modelStr = normPlate(c.model ?? '');
    const matchesQ = !q || idStr.includes(q) || modelStr.includes(q);
    const matchesF = (filter === 'all') || (String(c.status) === filter);

    return matchesQ && matchesF;
  });

  filtered.forEach(c => {
    const b = statusBadge(c.status);
    const el = document.createElement('div');
    el.className = 'item';
    el.onclick = () => openCar(c.id);

    el.innerHTML =
      '<div class="itemTop">' +
        '<div class="itemTitle">🚗 ' + escapeHtml(c.id) + ' - ' + escapeHtml(c.model) + '</div>' +
        '<div class="badge ' + b.cls + '">' + b.text + '</div>' +
      '</div>' +
      '<div class="row"><span>Простой</span><span>' + (c.idleDays ?? 0) + ' дн.</span></div>';

    list.appendChild(el);
  });
}




function openCar(carId) {
  state.currentCarId = carId;
  goTo('car');
}
window.openCar = openCar;

function renderCarCard() {
  const r = state.role;
  const carId = state.currentCarId;
  const c = cars.find(x => x.id === carId) || cars[0];
  const b = statusBadge(c.status);
const loss = Number(c.loss ?? c.losses ?? 0);
const deposit = Number(c.deposit ?? 0);
  const carTitle = document.getElementById('car-title');
  const carSub = document.getElementById('car-sub');
  const carChip = document.getElementById('car-chip');
  if (carTitle) carTitle.textContent = c.id + ' — ' + c.model;
  if (carSub) carSub.textContent = b.text + ' • Простой: ' + c.idleDays + ' дн.';
  if (carChip) carChip.textContent = getRoleTitle(r) || 'роль';

  const info = document.getElementById('car-info');
  if (!info) return;

let html = '';

html += `<div class="row"><span>Статус</span><b>${b.text}</b></div>`;
html += `<div class="row"><span>Простой</span><b>${c.idleDays || 0} дн.</b></div>`;

if (r === 'owner' || r === 'manager') {
  html += `<div class="row"><span>Водитель</span><b>${escapeHtml(c.driver || '-')}</b></div>`;
}
  if (r === 'owner') {
    html +=
      '<div class="row"><span>Потери</span><span class="'+(loss>0?'neg':'')+'">'+(loss>0 ? ('-' + fmtRub(loss)) : '0 ₽')+'</span></div>' +
'<div class="row"><span>Депозит</span><span class="'+(deposit>0?'pos':'')+'">'+fmtRub(deposit)+'</span></div>';
  }

  if (r === 'manager') {
    html +=
      '<div class="row"><span>Потери</span><span>'+((c.loss && c.loss>0) ? 'есть' : 'нет')+'</span></div>' +
      '<div class="row"><span>Депозит</span><span>'+((c.deposit && c.deposit>0) ? 'есть' : 'нет')+'</span></div>';
  }

  info.innerHTML = html;

  const mech = document.getElementById('mech-inspection');
  if (mech) {
    if (r === 'mechanic') {
      mech.style.display = 'block';
      loadInspectionIntoUI(c.id);
    } else {
      mech.style.display = 'none';
    }
  }
}

// Mechanic inspection (local save)
function getInspections() {
  try {
    const raw = localStorage.getItem(LS_INSPECTIONS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function setInspections(obj) {
  localStorage.setItem(LS_INSPECTIONS, JSON.stringify(obj));
}

function getSelectedInspectionState() {
  const el = document.querySelector('input[name="inspState"]:checked');
  return el ? el.value : null;
}
function setSelectedInspectionState(val) {
  const el = document.querySelector('input[name="inspState"][value="'+val+'"]');
  if (el) el.checked = true;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ''));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

async function saveInspection() {
  const carId = state.currentCarId || '';
  if (!carId) return;

  const commentEl = document.getElementById('insp-comment');
  const photosEl = document.getElementById('insp-photos');
  const thumbsEl = document.getElementById('insp-thumbs');

  const comment = commentEl ? String(commentEl.value || '').trim() : '';
  const st = getSelectedInspectionState();

  if (!st) {
    toast('Выберите состояние (ОК / Нужен ремонт / Критично)');
    return;
  }

  const files = Array.from((photosEl && photosEl.files) ? photosEl.files : []);
  const limited = files.slice(0, 4);
  const photos = [];

  for (const f of limited) {
    try {
      const dataUrl = await fileToDataURL(f);
      photos.push(dataUrl);
    } catch (e) {}
  }

  const inspections = getInspections();
  inspections[carId] = { savedAt: Date.now(), state: st, comment, photos };
  setInspections(inspections);

  if (thumbsEl) thumbsEl.innerHTML = (photos.length ? thumbsEl.innerHTML : thumbsEl.innerHTML);
  showSavedInspectionHint(inspections[carId]);
  toast('Осмотр сохранён');
}
window.saveInspection = saveInspection;

function loadInspectionIntoUI(carId) {
  const inspections = getInspections();
  const i = inspections[carId];

  const commentEl = document.getElementById('insp-comment');
  const photosEl = document.getElementById('insp-photos');
  const thumbsEl = document.getElementById('insp-thumbs');
  const savedEl = document.getElementById('insp-saved');

  if (commentEl) commentEl.value = '';
  if (thumbsEl) thumbsEl.innerHTML = '';
  if (photosEl) photosEl.value = '';
  document.querySelectorAll('input[name="inspState"]').forEach(x => (x.checked = false));
  if (savedEl) savedEl.style.display = 'none';

  if (!i) return;

  if (commentEl && i.comment) commentEl.value = i.comment;
  if (i.state) setSelectedInspectionState(i.state);

  if (thumbsEl && Array.isArray(i.photos)) {
    i.
photos.slice(0, 8).forEach(src => {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = src;
      thumbsEl.appendChild(img);
    });
  }

  showSavedInspectionHint(i);
}

function showSavedInspectionHint(i) {
  const el = document.getElementById('insp-saved');
  if (!el) return;

  const dt = new Date(i.savedAt || Date.now());
  const label = (i.state === 'ok') ? '✅ ОК'
              : (i.state === 'need') ? '🛠 Нужен ремонт'
              : '🚨 Критично';

  el.style.display = 'block';
  el.className = 'mini';
  el.textContent = 'Сохранено: ' + dt.toLocaleString('ru-RU') + ' • ' + label + (i.comment ? (' • ' + i.comment) : '');
}

// Photo thumbs preview
function bindPhotoPreview() {
  const photosInput = document.getElementById('insp-photos');
  const thumbs = document.getElementById('insp-thumbs');
  if (!photosInput || !thumbs) return;

  photosInput.addEventListener('change', () => {
    thumbs.innerHTML = '';
    const files = Array.from(photosInput.files || []);
    files.slice(0, 8).forEach(f => {
      const url = URL.createObjectURL(f);
      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = url;
      img.onload = () => URL.revokeObjectURL(url);
      thumbs.appendChild(img);
    });
  });
}

// Utils
function fmtRub(n) {
  const v = Number(n || 0);
  return v.toLocaleString('ru-RU') + ' ₽';
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

let toastTimer = null;
function toast(text) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

// Boot
function boot() {
  bindScreens();
  initTelegram();
  bindPhotoPreview();

  // (Опционально позже) авто-роль по tg user id:
  // if (tg?.initDataUnsafe?.user?.id === 123456789) { localStorage.setItem(LS_ROLE,'owner'); }

  const role = loadRole();
  if (role) {
    navStack = ['role', 'home'];
    setActiveScreen('home');
    renderHome();
  } else {
    setActiveScreen('role');
  }
}

document.addEventListener('DOMContentLoaded', boot);
