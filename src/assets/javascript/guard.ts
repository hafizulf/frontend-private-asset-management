import auth from "./auth"; // ✅ correct path (same folder)

const LOGIN_PATH = "/auth/login.html";
const here = location.pathname;

// Skip guard on public pages and the login page itself
if (!(window as any).__PUBLIC_PAGE__ && here !== LOGIN_PATH) {
  (async () => {
    const ok = await auth.isLoggedIn();
    if (!ok) {
      const next = location.pathname + location.search + location.hash; // relative is cleaner
      location.replace(`${LOGIN_PATH}?next=${encodeURIComponent(next)}`);
    }
  })();
}
