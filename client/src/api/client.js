const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export async function apiClient(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error?.message || 'Request failed');
    error.code = body.error?.code;
    error.status = response.status;
    error.fields = body.error?.fields || {};
    throw error;
  }
  return body.data;
}
