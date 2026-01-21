(() => {
  'use strict';

  // ===== DOM =====
  const el = {
    content: document.getElementById('content'),
    topTitle: document.getElementById('topTitle'),
    backBtn: document.getElementById('backBtn'),
    toast: document.getElementById('toast'),
  };

  // ===== Telegram WebApp =====
  const tg = window.Telegram?.WebApp || null;

  function hexToRgba(hex, a = 1) {
    try {
      let h = String(hex).replace('#', '').trim();
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      return `rgba(${r},${g},${b},${a})`;
    } catch {
      return `rgba(255,255,255,${a})`;
    }
  }

  function applyThemeFromTelegram() {
    const tp = tg?.themeParams || {};
    const css = document.documentElement.style;

    if (tp.bg_color) css.setProperty('--bg', tp.bg_color);
    if (tp.secondary_bg_color) css.setProperty('--card', hexToRgba(tp.secondary_bg_color, 0.55));
    if (tp.text_color) css.setProperty('--text', tp.text_color);
    if (tp.hint_color) css.setProperty('--hint', hexToRgba(tp.hint_color, 0.85));
    if (tp.button_color) css.setProperty('--accent', tp.button_color);
    if (tp.text_color) css.setProperty('--line', hexToRgba(tp.text_color, 0.12));
  }

  function initTelegram() {
    console.log('[init] Telegram WebApp available:', !!tg);
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();

      applyThemeFromTelegram();

      try { tg.setHeaderColor?.('secondary_bg_color'); } catch (_) {}
      try { tg.setBackgroundColor?.(tg.themeParams?.bg_color || '#0f1115'); } catch (_) {}
      try { tg.disableVerticalSwipes?.(); } catch (_) {}

      console.log('[init] themeParams:', tg.themeParams);
    } catch (e) {
      console.log('[init] Telegram init error:', e);
    }
  }

  // ===== Utils =====
  function money(n) {
    const s = String(n).replace(/[^\d]/g, '');
    const parts = [];
    for (let i = s.length; i > 0; i -= 3) parts.unshift(s.substring(Math.max(0, i - 3), i));
    return parts.join(' ') + ' ₽';
  }

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => el.toast.classList.remove('show'), 1600);
  }

  function htm(str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  }

  function mount(node) {
    el.content.innerHTML = '';
    el.content.appendChild(node);
    el.content.scrollTop = 0;
  }

  function setTopbar({ title, canBack }) {
    el.topTitle.textContent = title || 'Park Control';
    el.backBtn.style.visibility = canBack ? 'visible' : 'hidden';
  }

  // ===== Demo data =====
  const demo = {
    user: { name: 'Иван' },
    stats: {
      total: 150,
      active: 130,
      repair: 10,
      idle: 10,
      accident: 3,
      repairLoss: 459000,
      idleLoss: 35000,
      deposits: 350000
    },
    drivers: [
      { id: 1, name: 'Юрий Иванов' },
      { id: 2, name: 'Алексей Смирнов' },
      { id: 3, name: 'Марат Ахметов' },
      { id: 4, name: 'Сергей Петров' }
    ],
    cars: [
      { id: 1, number: 'K526CA78', model: 'Volkswagen Polo', driverId: 1, status: 'repair', days: 4, mileage: 126450, lastTO: 120000 },
      { id: 2, number: 'A112BC78', model: 'Kia Rio', driverId: 2, status: 'active', days: 12, mileage: 98420, lastTO: 90000 },
      { id: 3, number: 'M904EE78', model: 'Hyundai Solaris', driverId: 3, status: 'idle', days: 2, mileage: 153120, lastTO: 150000 },
      { id: 4, number: 'P771OP78', model: 'Skoda Rapid', driverId: 4, status: 'accident', days: 1, mileage: 73110, lastTO: 60000 },
      { id: 5, number: 'T090TT78', model: 'Renault Logan', driverId: 1, status: 'active', days: 18, mileage: 201330, lastTO: 195000 },
      { id: 6, number: 'X333XX78', model: 'Lada Granta', driverId: 2, status: 'repair', days: 7, mileage: 64120, lastTO: 60000 },
      { id: 7, number: 'E404KE78', model: 'Geely Emgrand', driverId: 3, status: 'active', days: 9, mileage: 112020, lastTO: 105000 },
      { id: 8, number: 'B808BB78', model: 'Chery Tiggo', driverId: 4, status: 'idle', days: 5, mileage: 45200, lastTO: 45000 },
      { id: 9, number: 'H515HH78', model: 'Nissan Almera', driverId: 1, status: 'active', days: 22, mileage: 179990, lastTO: 170000 },
      { id: 10, number: 'C700CC78', model: 'Toyota Corolla', driverId: 2, status: 'accident', days: 3, mileage: 245600, lastTO: 240000 },
    ],
    documents: {
      templates: [
        { id: 'rent', title: 'Договор аренды ТС', subtitle: 'Шаблон + автоподстановка (демо)' },
        { id: 'act', title: 'Акт приёма-передачи', subtitle: 'Фиксация состояния (демо)' },
        { id: 'deposit', title: 'Соглашение о депозите', subtitle: 'Условия удержаний (демо)' },
        { id: 'power', title: 'Доверенность', subtitle: 'Для управления/перегона (демо)' },
      ],
      dtp: [
        { id: 'dtp1', title: 'Заявление о ДТП', subtitle: 'Шаблон (демо)' },
        { id: 'dtp2', title: 'Объяснительная водителя', subtitle: 'Шаблон (демо)' },
        { id: 'dtp3', title: 'Чек-лист материалов', subtitle: 'Список фото/доков (демо)' },
      ]
    }
  };

  const STATUS = {
    active: { label: 'На линии', emoji: '🟢' },
    repair: { label: 'В ремонте', emoji: '🛠️' },
    idle: { label: 'В простое', emoji: '⏸️' },
    accident: { label: 'ДТП', emoji: '⚠️' },
  };

  const storageKeyRole = 'parkControl.role';

  const state = {
    role: localStorage.getItem(storageKeyRole) || null,
    carFilter: 'all'
  };

  const navStack = []; // {screen, params}

  function getDriverName(id) {
    return demo.drivers.find(d => d.id === id)?.name || '—';
  }

  function navigate(screen, params = {}) {
    console.log('[nav] ->', screen, params);
    navStack.push({ screen, params });
    render();
  }

  function replace(screen, params = {}) {
    console.log('[nav] replace ->', screen, params);
    if (navStack.length) navStack.pop();
    navStack.push({ screen, params });
    render();
  }

  function back() {
    if (navStack.length <= 1) return;
    navStack.pop();
    console.log('[nav] <- back');
    render();
  }

  function current() {
    return navStack[navStack.length - 1] || { screen: 'role', params: {} };
  }

  // ===== Screens =====
  function screenRole() {
    setTopbar({ title: 'Park Control', canBack: false });

    const root = htm(`
      <div class="container">
        <div class="h1">Выбор роли</div>
        <p class="sub">Выберите роль. Сохранится в localStorage.</p>

        <div class="list">
          <div class="item" data-role="owner">
            <div class="item__head">
              <div class="item__title">👤 Владелец</div>
              <span class="badge">полный доступ</span>
            </div>
            <div class="item__meta">Статистика, документы, авто, финансы.</div>
          </div>

          <div class="item" data-role="manager">
            <div class="item__head">
              <div class="item__title">🧩 Менеджер</div>
              <span class="badge">операции</span>
            </div>
            <div class="item__meta">Учёт авто, водители, уведомления.</div>
          </div>

          <div class="item" data-role="mechanic">
            <div class="item__head">
              <div class="item__title">🛠️ Механик</div>
              <span class="badge">тех.блок</span>
            </div>
            <div class="item__meta">Ремонт, ТО, фото повреждений.</div>
          </div>
        </div>

        <div class="hr"></div>
        <button class="btn" id="continueBtn" type="button">Продолжить</button>
      </div>
    `);

    let selected = state.role || null;

    function paint() {
      root.querySelectorAll('.item').forEach((it) => {
        const r = it.getAttribute('data-role');
        it.style.outline = (r === selected) ? '2px solid rgba(46,166,255,0.45)' : 'none';
      });
    }

    root.querySelectorAll('.item').forEach((it) => {
      it.addEventListener('click', () => {
        selected = it.getAttribute('data-role');
        console.log('[role] selected:', selected);
        toast('Роль выбрана');
        paint();
      });
    });

    root.querySelector('#continueBtn').addEventListener('click', () => {
      if (!selected) return toast('Выберите роль');
      state.role = selected;
      localStorage.setItem(storageKeyRole, selected);
      replace('dashboard');
    });

    paint();
    return root;
  }

  function roleChips(activeRole) {
    const root = htm(`
      <div class="chips">
        <div class="chip ${activeRole === 'owner' ? 'active' : ''}" data-role="owner">👤 Владелец</div>
        <div class="chip ${activeRole === 'manager' ? 'active' : ''}" data-role="manager">🧩 Менеджер</div>
        <div class="chip ${activeRole === 'mechanic' ? 'active' : ''}" data-role="mechanic">🛠️ Механик</div>
      </div>
    `);

    root.querySelectorAll('.chip').forEach((c) => {
      c.addEventListener('click', () => {
        const r = c.getAttribute('data-role');
        state.role = r;
        localStorage.setItem(storageKeyRole, r);
        console.log('[role] switched:', r);
        toast('Роль изменена');
        replace('dashboard');
      });
    });

    return root;
  }

  function screenDashboard() {
    setTopbar({ title: 'Park Control', canBack: false });

    const s = demo.stats;

    const root = htm(`
      <div class="container">
        <div class="card pad">
          <div class="h1">Здравствуйте, ${demo.user.name}!</div>
          <p class="sub" style="margin:0">Короткая сводка и разделы.</p>
        </div>

        <div class="section-title">Роли</div>
        <div id="roleSlot"></div>

        <div class="section-title">Статистика</div>
        <div class="grid stats">
          <div class="stat"><div class="stat__label">Всего авто</div><div class="stat__value">${s.total}</div></div>
          <div class="stat"><div class="stat__label">На линии</div><div class="stat__value">${s.active}</div></div>
          <div class="stat"><div class="stat__label">В ремонте</div><div class="stat__value">${s.repair}</div></div>
          <div class="stat"><div class="stat__label">В простое</div><div class="stat__value">${s.idle}</div></div>

          <div class="stat"><div class="stat__label">ДТП</div><div class="stat__value">${s.accident}</div></div>
          <div class="stat"><div class="stat__label">Потери на ремонте</div><div class="stat__value small">${money(s.repairLoss)}</div></div>
          <div class="stat"><div class="stat__label">Потери на простое</div><div class="stat__value small">${money(s.idleLoss)}</div></div>
          <div class="stat"><div class="stat__label">Депозиты</div><div class="stat__value small">${money(s.deposits)}</div></div>
        </div>

        <div class="section-title">Разделы</div>
        <div class="tiles">
          <div class="tile" data-go="documents">
            <div class="tile__top"><div class="tile__name">Договоры и документы</div><div class="tile__icon">📄</div></div>
            <div class="tile__hint">Шаблоны + ДТП</div>
          </div>

          <div class="tile" data-go="cars">
            <div class="tile__top"><div class="tile__name">Учёт авто</div><div class="tile__icon">🚗</div></div>
            <div class="tile__hint">Список, фильтры, карточка</div>
          </div>

          <div class="tile" data-go="stub" data-title="Водители">
            <div class="tile__top"><div class="tile__name">Водители</div><div class="tile__icon">🧑‍✈️</div></div>
            <div class="tile__hint">Демо</div>
          </div>

          <div class="tile" data-go="stub" data-title="Депозиты">
            <div class="tile__top"><div class="tile__name">Депозиты</div><div class="tile__icon">💰</div></div>
            <div class="tile__hint">Демо</div>
          </div>

          <div class="tile" data-go="stub" data-title="Штрафы">
            <div class="tile__top"><div class="tile__name">Штрафы</div><div class="tile__icon">🧾</div></div>
            <div class="tile__hint">Демо</div>
          </div>

          <div class="tile" data-go="stub" data-title="GPS контроль">
            <div class="tile__top"><div class="tile__name">GPS контроль</div><div class="tile__icon">📍</div></div>
            <div class="tile__hint">Демо</div>
          </div>

          <div class="tile" data-go="stub" data-title="Уведомления">
            <div class="tile__top"><div class="tile__name">Уведомления</div><div class="tile__icon">🔔</div></div>
            <div class="tile__hint">Демо</div>
          </div>
        </div>

        <div class="hr"></div>
        <button class="btn" id="resetRoleBtn" type="button">Сбросить роль</button>
      </div>
    `);

    root.querySelector('#roleSlot').appendChild(roleChips(state.role));

    root.querySelectorAll('.tile').forEach((t) => {
      t.addEventListener('click', () => {
        const go = t.getAttribute('data-go');
        if (go === 'documents') return navigate('documents');
        if (go === 'cars') return navigate('cars');
        toast((t.getAttribute('data-title') || 'Раздел') + ' (демо)');
      });
    });

    root.querySelector('#resetRoleBtn').addEventListener('click', () => {
      localStorage.removeItem(storageKeyRole);
      state.role = null;
      replace('role');
    });

    return root;
  }

  function screenCars(params) {
    setTopbar({ title: 'Учёт авто', canBack: true });

    const activeFilter = params?.filter || state.carFilter || 'all';

    const root = htm(`
      <div class="container">
        <div class="card pad">
          <div class="h1">Учёт авто</div>
          <p class="sub" style="margin:0">Фильтры по статусам + список авто.</p>
        </div>

        <div class="section-title">Фильтры</div>
        <div class="chips">
          <div class="chip ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Все</div>
          <div class="chip ${activeFilter === 'active' ? 'active' : ''}" data-filter="active">🟢 На линии</div>
          <div class="chip ${activeFilter === 'repair' ? 'active' : ''}" data-filter="repair">🛠️ В ремонте</div>
          <div class="chip ${activeFilter === 'idle' ? 'active' : ''}" data-filter="idle">⏸️ В простое</div>
          <div class="chip ${activeFilter === 'accident' ? 'active' : ''}" data-filter="accident">⚠️ ДТП</div>
        </div>

        <div class="section-title">Автомобили</div>
        <div class="list" id="carsList"></div>
      </div>
    `);

    const list = root.querySelector('#carsList');

    function getCars() {
      if (activeFilter === 'all') return demo.cars;
      return demo.cars.filter(c => c.status === activeFilter);
    }

    function renderList() {
      list.innerHTML = '';
      const cars = getCars();

      cars.forEach((c) => {
        const st = STATUS[c.status];
        const node = htm(`
          <div class="item" data-car="${c.id}">
            <div class="item__head">
              <div class="item__title">${c.number} · ${c.model}</div>
              <span class="badge">${st.emoji} ${st.label}</span>
            </div>
            <div class="item__meta">
              Водитель: <b style="color:var(--text)">${getDriverName(c.driverId)}</b><br/>
              В статусе: <b style="color:var(--text)">${c.days} дн.</b>
            </div>
          </div>
        `);
        node.addEventListener('click', () => navigate('car', { carId: c.id }));
        list.appendChild(node);
      });

      if (!cars.length) {
        list.appendChild(htm(`<div class="card pad"><div class="sub" style="margin:0">Нет авто по фильтру.</div></div>`));
      }
    }

    root.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const f = chip.getAttribute('data-filter');
        state.carFilter = f;
        console.log('[cars] filter:', f);
        replace('cars', { filter: f });
      });
    });

    renderList();
    return root;
  }

  function screenCar(params) {
    setTopbar({ title: 'Карточка авто', canBack: true });

    const carId = Number(params?.carId);
    const car = demo.cars.find(c => c.id === carId);

    if (!car) {
      return htm(`
        <div class="container">
          <div class="card pad">
            <div class="h1">Авто не найдено</div>
            <p class="sub" style="margin:0">Неверный carId</p>
          </div>
        </div>
      `);
    }

    const st = STATUS[car.status];

    const root = htm(`
      <div class="container">
        <div class="card pad">
          <div class="item__head">
            <div class="item__title">${car.number} · ${car.model}</div>
            <span class="badge">${st.emoji} ${st.label}</span>
          </div>
          <div class="item__meta">
            Водитель: <b style="color:var(--text)">${getDriverName(car.driverId)}</b><br/>
            В статусе: <b style="color:var(--text)">${car.days} дн.</b>
          </div>
        </div>

        <div class="section-title">ТО / пробег</div>
        <div class="card pad">
          <div class="kv">
            <div class="kv__row"><span>Пробег</span><b>${car.mileage.toLocaleString('ru-RU')} км</b></div>
            <div class="kv__row"><span>Последнее ТО</span><b>${car.lastTO.toLocaleString('ru-RU')} км</b></div>
          </div>
        </div>

        <div class="section-title">Фото повреждений</div>
        <div class="card pad">
          <p class="sub" style="margin:0 0 12px 0">Заглушка (демо).</p>
          <button class="btn" id="addPhotoBtn" type="button">📷 Добавить фото</button>
        </div>
      </div>
    `);

    root.querySelector('#addPhotoBtn').addEventListener('click', () => {
      console.log('[car] add photo click:', car.id);
      toast('Добавить фото (демо)');
    });

    return root;
  }

  function screenDocuments() {
    setTopbar({ title: 'Документы', canBack: true });

    const root = htm(`
      <div class="container">
        <div class="card pad">
          <div class="h1">Документы</div>
          <p class="sub" style="margin:0">Шаблоны + блок по ДТП.</p>
        </div>

        <div class="section-title">Шаблоны</div>
        <div class="list" id="tpl"></div>

        <div class="section-title">ДТП-документы</div>
        <div class="list" id="dtp"></div>

        <div class="hr"></div>
        <button class="btn" id="createBtn" type="button">✍️ Создать договор (демо)</button>
      </div>
    `);

    const tpl = root.querySelector('#tpl');
    demo.documents.templates.forEach((d) => {
      const node = htm(`
        <div class="item">
          <div class="item__head">
            <div class="item__title">📄 ${d.title}</div>
            <span class="badge">шаблон</span>
          </div>
          <div class="item__meta">${d.subtitle}</div>
        </div>
      `);
      node.addEventListener('click', () => toast('Открыть шаблон (демо)'));
      tpl.appendChild(node);
    });

    const dtp = root.querySelector('#dtp');
    demo.documents.dtp.forEach((d) => {
      const node = htm(`
        <div class="item">
          <div class="item__head">
            <div class="item__title">⚠️ ${d.title}</div>
            <span class="badge">ДТП</span>
          </div>
          <div class="item__meta">${d.subtitle}</div>
        </div>
      `);
      node.addEventListener('click', () => toast('Открыть документ (демо)'));
      dtp.appendChild(node);
    });

    root.querySelector('#createBtn').addEventListener('click', () => {
      console.log('[docs] create contract');
      toast('Создать договор (демо)');
    });

    return root;
  }

  // ===== Render =====
  function render() {
    const { screen, params } = current();

    if (!state.role && screen !== 'role') {
      console.log('[guard] no role -> role');
      replace('role');
      return;
    }

    let node;
    switch (screen) {
      case 'role': node = screenRole(); break;
      case 'dashboard': node = screenDashboard(); break;
      case 'cars': node = screenCars(params); break;
      case 'car': node = screenCar(params); break;
      case 'documents': node = screenDocuments(); break;
      default:
        node = htm(`
          <div class="container">
            <div class="card pad">
              <div class="h1">Экран не найден</div>
              <p class="sub" style="margin:0">${screen}</p>
            </div>
          </div>
        `);
    }

    mount(node);

    const canBack = navStack.length > 1 && screen !== 'dashboard' && screen !== 'role';
    setTopbar({ title: el.topTitle.textContent, canBack });

    console.log('[render]', screen, params);
  }

  // ===== Events =====
  el.backBtn.addEventListener('click', () => {
    try { tg?.HapticFeedback?.impactOccurred?.('light'); } catch (_) {}
    back();
  });

  // ===== Boot =====
  function boot() {
    console.log('[boot] start');
    initTelegram();

    if (state.role) navStack.push({ screen: 'dashboard', params: {} });
    else navStack.push({ screen: 'role', params: {} });

    render();

    window.addEventListener('error', (e) => {
      console.log('[error]', e?.message || e);
      toast('Ошибка JS (смотри консоль)');
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.log('[unhandledrejection]', e?.reason || e);
      toast('Ошибка Promise (смотри консоль)');
    });
  }

  boot();
})();
