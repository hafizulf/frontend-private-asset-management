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

function getStatus(err: any): number | undefined {
  return err?.status ?? err?.response?.status;
}

function isUnauthorizedStatus(status: any) {
  return status === 401 || status === 403 || status === 422;
}

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= (async () => {
    const res = await http.post('/auths/refresh-token'); // cookie-based
    const newToken = res.data?.data;

    if (typeof newToken !== 'string' || !newToken) {
      throw Object.assign(new Error('REFRESH_NO_TOKEN'), { status: 401 });
    }

    setAccessToken(newToken);
    return newToken;
  })()
    .catch((err) => {
      clearAccessToken();
      throw err;
    })
    .finally(() => {
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

  // If no access token, try refresh first (cookie-based)
  if (!token) {
    const newToken = await refreshAccessToken();
    const res = await http.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
    return res.data;
  }

  try {
    const res = await http.request({
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    const status = getStatus(err);
    if (!isUnauthorizedStatus(status)) throw err;

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
  try {
    await authRequest({ method: 'get', url: '/auths/getMe' });
    return true;
  } catch (err: any) {
    const status = getStatus(err);
    if (isUnauthorizedStatus(status)) clearAccessToken();
    return false;
  }
}

export default {
  isLoggedIn,
  authRequest,
  refreshAccessToken,
  clearAccessToken,
};
