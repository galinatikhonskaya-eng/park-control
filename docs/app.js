const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;

if (user) {
  const name = user.first_name || 'друг';
  document.getElementById('tgHello').textContent = `Здравствуйте, ${name}!`;

  if (user.photo_url) {
    document.getElementById('tgAvatar').src = user.photo_url;
  }
}
