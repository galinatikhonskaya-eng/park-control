// Telegram init (без авто-ролей, чтобы ничего не ломалось)
const tg = window.Telegram?.WebApp || null;
if (tg) {
  tg.ready();
  tg.expand();
}

// state
let role = null;

// demo cars
const cars = [
  { number: "K526CA78", model: "Volkswagen Polo", status: "В ремонте", days: 12 },
  { number: "A102BC77", model: "Hyundai Solaris", status: "На линии", days: 0 },
  { number: "M883PK98", model: "Kia Rio", status: "В простое", days: 7 },
];

// helpers
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
}

// global functions for HTML buttons
window.setRole = function(selectedRole) {
  role = selectedRole;
  renderHome();
  showScreen("homeScreen");
};

window.goTo = function(screenId) {
  showScreen(screenId);
  if (screenId === "carsScreen") renderCars();
};

window.logout = function() {
  role = null;
  showScreen("roleScreen");
};

// render
function renderHome() {
  const title = document.getElementById("welcomeTitle");
  if (!title) return;

  title.textContent =
    role === "owner" ? "Здравствуйте, владелец" :
    role === "manager" ? "Здравствуйте, менеджер" :
    "Здравствуйте, механик";
}

function renderCars() {
  const el = document.getElementById("carsList");
  if (!el) return;

  el.innerHTML = cars.map(car => `
    <div class="card">
      🚗 <b>${car.number}</b> — ${car.model}

      <div style="opacity:.85; margin-top:6px;">
        Статус: ${car.status}

        Простой: ${car.days} дней
      </div>
    </div>
  `).join("");
}
