const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
let refreshPromise = null;

async function request(path, options = {}) {
  const csrf = document.cookie.split('; ').find((value) => value.startsWith('csrfToken='))?.split('=')[1];
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'serenova', ...(csrf ? { 'X-CSRF-Token': decodeURIComponent(csrf) } : {}), ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Request failed');
    error.code = body.error?.code;
    error.status = response.status;
    error.fields = body.error?.fields || {};
    throw error;
  }
  return body.data;
}

export async function apiClient(path, options = {}, canRefresh = true) {
  try {
    return await request(path, options);
  } catch (error) {
    if (error.status !== 401 || !canRefresh || path.startsWith('/auth/')) throw error;
    refreshPromise ||= request('/auth/refresh', { method: 'POST', body: JSON.stringify({}) });
    try {
      await refreshPromise;
      return await apiClient(path, options, false);
    } finally {
      refreshPromise = null;
    }
  }
}
