let role = null;

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
    { number: "K526CA78", model: "Volkswagen Polo", status: "В ремонте", days: 12 },
    { number: "A317BT77", model: "Kia Rio", status: "На линии", days: 0 },
    { number: "M842OP178", model: "Hyundai Solaris", status: "На линии", days: 0 },
    { number: "T904EK98", model: "Skoda Rapid", status: "В простое", days: 5 },
    { number: "H115XP777", model: "Renault Logan", status: "ДТП", days: 7 },
    { number: "E662AA78", model: "LADA Vesta", status: "В ремонте", days: 3 },
    { number: "X908KM198", model: "Toyota Camry", status: "На линии", days: 0 }
  ]
};

function setRole(selectedRole) {
  role = selectedRole;
  showScreen('homeScreen');
  renderHome();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function logout() {
  role = null;
  showScreen('roleScreen');
}

function renderHome() {
  document.getElementById('welcomeTitle').innerText =
    role === 'owner' ? 'Здравствуйте, владелец' :
    role === 'manager' ? 'Здравствуйте, менеджер' :
    'Здравствуйте, механик';

  document.getElementById('stats').innerHTML = `
    <div class="card">🚘 Авто всего: ${data.stats.total}</div>
    <div class="card">🟢 На линии: ${data.stats.active}</div>
    <div class="card">🔧 В ремонте: ${data.stats.repair}</div>
    <div class="card">🚫 В простое: ${data.stats.idle}</div>
    <div class="card">⚠️ ДТП за неделю: ${data.stats.accident}</div>
  `;

  const finance = document.getElementById('finance');
  finance.innerHTML = '';

  if (role === 'owner') {
    finance.innerHTML = `
      <div class="card">🔧 Потери на ремонте: -${data.stats.repairLoss}</div>
      <div class="card">🚫 Потери на простое: -${data.stats.idleLoss}</div>
      <div class="card">💳 Депозиты: ${data.stats.deposits}</div>
    `;
  }

  if (role === 'manager') {
    finance.innerHTML = `
      <div class="card">🔧 Потери: есть</div>
      <div class="card">🚫 Простой: есть</div>
      <div class="card">💳 Депозиты: есть</div>
    `;
  }
}

function goTo(screen) {
  showScreen(screen);
  if (screen === 'carsScreen') renderCars();
}

function renderCars() {
  document.getElementById('carsList').innerHTML = data.cars.map((car, i) => `
    <div class="card" onclick="openCar(${i})" style="cursor:pointer;">
      🚗 ${car.number} — ${car.model}

      Статус: ${car.status}

      Простой: ${car.days} дней
    </div>
  `).join('');
}


let selectedCarIndex = null;

function openCar(i){
  selectedCarIndex = i;
  const car = data.cars[i];

  document.getElementById('carTitle').innerText = `${car.number} — ${car.model}`;

  let html = `
    <div class="card">
      <div><b>Статус:</b> ${car.status}</div>
      <div><b>Простой:</b> ${car.days} дней</div>
    </div>
  `;

  if(role === 'owner' || role === 'manager'){
    html += `<div class="card"><b>Водитель:</b> ${car.driver || '—'}</div>`;
  }

  if(role === 'owner'){
    html += `<div class="card"><b>Потери:</b> ${car.loss || '—'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit || '—'}</div>`;
  }

  if(role === 'manager'){
    html += `<div class="card"><b>Потери:</b> ${car.loss ? 'есть' : 'нет'}</div>`;
    html += `<div class="card"><b>Депозит:</b> ${car.deposit ? 'есть' : 'нет'}</div>`;
  }

  document.getElementById('carInfo').innerHTML = html;

  // Блок механика показываем только ему
  document.getElementById('mechBlock').style.display =
    (role === 'mechanic') ? 'block' : 'none';

  document.getElementById('mechSaved').innerText = '';

  goTo('carScreen');
}

function saveInspection(){
  const car = data.cars[selectedCarIndex];
  const files = document.getElementById('mechPhotos').files;
  const comment = document.getElementById('mechComment').value;

  const ok = document.getElementById('chkOk').checked;
  const repair = document.getElementById('chkRepair').checked;
  const critical = document.getElementById('chkCritical').checked;

  data.inspections = data.inspections || {};
  data.inspections[car.number] = {
    photosCount: files ? files.length : 0,
    comment,
    ok, repair, critical,
    date: new Date().toLocaleString()
  };

  document.getElementById('mechSaved').innerText =
    `✅ Сохранено: ${files.length} фото, ${new Date().toLocaleString()}`;
}