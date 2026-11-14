import { apiClient } from './client.js';

export const createAppointment = (input) =>
  apiClient('/appointments', { method: 'POST', body: JSON.stringify(input) });
export const lookupAppointment = (reference, token) =>
  apiClient(`/appointments/lookup?ref=${encodeURIComponent(reference)}&token=${encodeURIComponent(token)}`);
export const cancelAppointment = (reference, token, reason) =>
  apiClient(`/appointments/${encodeURIComponent(reference)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ token, reason })
  });
export const rescheduleAppointment = (reference, token, startAt) =>
  apiClient(`/appointments/${encodeURIComponent(reference)}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ token, startAt })
  });
