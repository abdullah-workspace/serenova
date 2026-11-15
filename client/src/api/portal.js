import { apiClient } from './client.js';

export const getProfile = () => apiClient('/me/profile');
export const updateProfile = (input) => apiClient('/me/profile', { method: 'PATCH', body: JSON.stringify(input) });
export const changePassword = (input) => apiClient('/me/change-password', { method: 'POST', body: JSON.stringify(input) });
export const getAppointments = (scope = 'upcoming', page = 1) => apiClient(`/me/appointments?scope=${scope}&page=${page}&limit=10`);
export const getAppointment = (id) => apiClient(`/me/appointments/${id}`);
export const cancelAppointment = (id, reason = '') => apiClient(`/me/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) });
export const rescheduleAppointment = (id, startAt) => apiClient(`/me/appointments/${id}/reschedule`, { method: 'PATCH', body: JSON.stringify({ startAt }) });
export const claimAppointment = (reference, token) => apiClient('/me/appointments/claim', { method: 'POST', body: JSON.stringify({ reference, token }) });
