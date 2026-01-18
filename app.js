/************ Telegram WebApp init ************/
const tg = window.Telegram ? window.Telegram.WebApp : null;

let tgUser = null;
if (tg) {
  tg.ready();
  tg.expand();
  tgUser = tg.initDataUnsafe?.user || null;
}

/************ CONFIG ************/
const OWNER_TG_ID = 658383404; // <-- твой Telegram ID

/************ GLOBAL STATE ************/
let role = null;

/************ DEMO DATA ************/
const data = {
  stats: {
    total: 150,
    active: 100,
    repair: 10,
    idle: 40,
  },
  cars: [
    { number: "K526CA78", model: "Volkswagen Polo", status: "В ремонте", days: 2 },
    { number: "A102BC77", model: "Hyundai Solaris", status: "На линии", days: 0 },
    { number: "M883PK98", model: "Kia Rio", status: "В простое", days: 7 },
  ]
};

/************ SCREENS ************/
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/************ ROLE DETECT ************/
function detectRoleByTelegram() {
  if (!tgUser) return null;
  if (Number(tgUser.id) === OWNER_TG_ID) return "owner";
  return null;
}

/************ ROLE SELECT ************/
window.setRole = function (selectedRole) {
  role = selectedRole;
  showScreen("homeScreen");
  renderHome();
};

/************ HOME ************/
function renderHome() {
  const title = document.getElementById("welcomeTitle");

  if (role === "owner") title.innerText = "Здравствуйте, владелец";
  if (role === "manager") title.innerText = "Здравствуйте, менеджер";
  if (role === "mechanic") title.innerText = "Здравствуйте, механик";

  const home = document.getElementById("homeContent");
  home.innerHTML = `
    <button onclick="goTo('carsScreen')">🚗 Авто</button>
    <button onclick="alert('Документы в разработке')">📄 Документы</button>
    <button onclick="logout()">Выйти</button>
  `;
}

/************ NAV ************/
window.goTo = function (screen) {
  showScreen(screen);
  if (screen === "carsScreen") renderCars();
};

window.logout = function () {
  role = null;
  showScreen("roleScreen");
};

/************ CARS ************/
function renderCars() {
  const list = document.getElementById("carsList");
  list.innerHTML = data.cars.map(car => `
    <div class="card">
      <b>${car.number}</b> — ${car.model}

      Статус: ${car.status}

      Простой: ${car.days} дней
    </div>
  `).join("");
}

/************ INIT ************/
(function initApp() {
  const autoRole = detectRoleByTelegram();
  if (autoRole) {
    role = autoRole;
    showScreen("homeScreen");
    renderHome();
  } else {
    showScreen("roleScreen");
  }
})();


