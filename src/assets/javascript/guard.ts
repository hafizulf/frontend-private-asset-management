import auth from './auth';

const LOGIN_URL = '/auth/login/';

(async () => {
  const ok = await auth.isLoggedIn();

  if (!ok) {
    auth.clearAccessToken();
    const next = location.pathname + location.search + location.hash;
    location.replace(`${LOGIN_URL}?next=${encodeURIComponent(next)}`);
  }
})();
