import { apiClient } from './client.js';

export const register = (input) => apiClient('/auth/register', { method: 'POST', body: JSON.stringify(input) });
export const login = (input) => apiClient('/auth/login', { method: 'POST', body: JSON.stringify(input) });
export const logout = () => apiClient('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
export const getMe = () => apiClient('/auth/me');
export const forgotPassword = (email) => apiClient('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (input) => apiClient('/auth/reset-password', { method: 'POST', body: JSON.stringify(input) });
