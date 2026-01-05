import { clearErrors } from '@/helpers/form-validation';
import { initLogout } from '@/assets/javascript/logout';

function initModalReset() {
  document
    .querySelectorAll('.modal [data-bs-dismiss="modal"]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        const form = modal?.querySelector('form') as HTMLFormElement | null;
        if (form) {
          clearErrors(form);
          form.reset();
        }
      });
    });
}

function initSidebarActive() {
  const normalizePath = (path: string) =>
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll('.sidebar-item').forEach((item) => {
    const link = item.querySelector('.sidebar-link') as HTMLAnchorElement | null;
    if (!link) return;

    if (link.id === 'btn-logout') return;

    const normalizePath = (path: string) =>
      path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

    const currentPath = normalizePath(window.location.pathname);
    const linkPath = normalizePath(new URL(link.href).pathname);

    if (linkPath === currentPath) item.classList.add('active');
    else item.classList.remove('active');
  });
}

export function initLayout() {
  initModalReset();
  initSidebarActive();
  initLogout();
}
