// ===============================
// Telegram WebApp init
// ===============================
const tg = window.Telegram ? window.Telegram.WebApp : null;

let tgUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  tgUser = tg.initDataUnsafe?.user || null;
}

// ===============================
// CONFIG
// ===============================
const OWNER_TG_ID = 658384304; // ← ТВОЙ Telegram ID
let role = null;

// ===============================
// MOCK DATA
// ===============================
const data = {
  stats: {
    total: 150,
    active: 130,
    repair: 10,
    idle: 10,
    accident: 3,
    repairLoss: "459 000 ₽",
    idleLoss: "35 000 ₽",
    deposits: "350 000 ₽"
  },
  cars: [
    {
      number: "А123ВС",
      model: "Hyundai Solaris",
      status: "На линии",
      days: 0,
      driver: "Иванов",
      loss: "—",
      deposit: "20 000 ₽"
    },
    {
      number: "В456ОР",
      model: "Kia Rio",
      status: "Простой",
      days: 5,
      driver: "Петров",
      loss: "15 000 ₽",
      deposit: "—"
    }
  ]
};

// ===============================
// UTILS
// ===============================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s =>
    s.classList.remove("active")
  );
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

// ===============================
// ROLE LOGIC
// ===============================
function detectRoleFromTelegram() {
  if (!tgUser) return null;
  if (tgUser.id === OWNER_TG_ID) return "owner";
  return null; // остальных пускаем через выбор роли
}

function setRole(selectedRole) {
  role = selectedRole;
  localStorage.setItem("park_role", role);
  showScreen("homeScreen");
  renderHome();
}

function logout() {
  role = null;
  localStorage.removeItem("park_role");
  showScreen("roleScreen");
}

// ===============================
// HOME
// ===============================
function renderHome() {
  const title = document.getElementById("welcomeTitle");

  title.innerText =
    role === "owner"
      ? "Здравствуйте, владелец"
      : role === "manager"
      ? "Здравствуйте, менеджер"
      : "Здравствуйте, механик";

  const stats = document.getElementById("stats");
  stats.innerHTML = `
    <div class="card">🚗 Авто всего: ${data.stats.total}</div>
    <div class="card">🟢 На линии: ${data.stats.active}</div>
    <div class="card">🔧 В ремонте: ${data.stats.repair}</div>
    <div class="card">⏸ Простой: ${data.stats.idle}</div>
    <div class="card">⚠️ ДТП: ${data.stats.accident}</div>
  `;

  const finance = document.getElementById("finance");
  finance.innerHTML = "";

  if (role === "owner") {
    finance.innerHTML = `
      <div class="card">🔧 Потери на ремонте: ${data.stats.repairLoss}</div>
      <div class="card">🚫 Потери на простое: ${data.stats.idleLoss}</div>
      <div class="card">💳 Депозиты: ${data.stats.deposits}</div>
    `;
  }

  if (role === "manager") {
    finance.innerHTML = `
      <div class="card">🔧 Потери: есть</div>
      <div class="card">🚫 Простой: есть</div>
      <div class="card">💳 Депозиты: есть</div>
    `;
  }
}

// ===============================
// NAVIGATION
// ===============================
function goTo(screen) {
  showScreen(screen);
  if (screen === "carsScreen") renderCars();
}

// ===============================
// CARS
// ===============================
function renderCars() {
  const list = document.getElementById("carsList");
  list.innerHTML = data.cars
    .map(
      (car, i) => `
    <div class="card" onclick="openCar(${i})" style="cursor:pointer;">
      🚗 ${car.number} — ${car.model}

      Статус: ${car.status}

      Простой: ${car.days} дней
    </div>
  `
    )
    .join("");
}

let selectedCarIndex = null;

function openCar(i) {
  selectedCarIndex = i;
  const car = data.cars[i];

  document.getElementById(
    "carTitle"
 ).innerText = `${car.number} - ${car.model}`;

  let html = `
    <div class="card">
      <b>Статус:</b> ${car.status}

      <b>Простой:</b> ${car.days} дней
    </div>
  `;

  if (role !== "mechanic") {


html += <div class="card"><b>Водитель:</b> ${car.driver}</div>;
  }

  if (role === "owner") {
    html += `
      <div class="card"><b>Потери:</b> ${car.loss}</div>
      <div class="card"><b>Депозит:</b> ${car.deposit}</div>
    `;
  }

  document.getElementById("carInfo").innerHTML = html;

  document.getElementById("mechBlock").style.display =
    role === "mechanic" ? "block" : "none";

  showScreen("carScreen");
}

// ===============================
// INIT
// ===============================
(function initApp() {
  const savedRole = localStorage.getItem("park_role");
  const tgRole = detectRoleFromTelegram();

  if (tgRole) {
    role = tgRole;
    showScreen("homeScreen");
    renderHome();
    return;
  }

  if (savedRole) {
    role = savedRole;
    showScreen("homeScreen");
    renderHome();
    return;
  }

  showScreen("roleScreen");
})();
