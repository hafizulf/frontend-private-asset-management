import http from './http';

let refreshPromise: Promise<string> | null = null;

function getAccessToken() {
  return localStorage.getItem('token');
}
function setAccessToken(token: string) {
  localStorage.setItem('token', token);
}
function clearAccessToken() {
  localStorage.removeItem('token');
}

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= (async () => {
    const res = await http.post('/auths/refresh-token'); // cookie-based
    const newToken = res.data?.data;
    if (typeof newToken !== 'string' || !newToken) {
      throw new Error('Refresh response does not contain token string');
    }
    setAccessToken(newToken);
    return newToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function authRequest<T = any>(config: {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}): Promise<T> {
  const token = getAccessToken();
  if (!token)
    throw Object.assign(new Error('NO_ACCESS_TOKEN'), { status: 401 });

  try {
    const res = await http.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: { ...(config.headers ?? {}), Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status !== 401) throw err;

    const newToken = await refreshAccessToken();
    const res2 = await http.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
    return res2.data;
  }
}

async function isLoggedIn(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  try {
    await authRequest({ method: 'get', url: '/auths/getMe' });
    return true;
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    if (status === 401 || status === 422 || status === 403) return false;
    return false;
  }
}

export default {
  isLoggedIn,
  authRequest,
  refreshAccessToken,
  clearAccessToken,
};
