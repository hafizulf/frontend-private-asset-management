import Swal from 'sweetalert2';
import auth from '@/assets/javascript/auth';
import http from '@/assets/javascript/http';

export function initLogout() {
  const btn = document.getElementById('btn-logout');
  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: 'Logout?',
      text: 'You will be signed out from this session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await http.post('/auths/logout');
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      auth.clearAccessToken();
      location.replace('/auth/login');
    }
  });
}
