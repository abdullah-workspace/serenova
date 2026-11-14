import { apiClient } from './client.js';
export const getDoctors = (params = '') => apiClient(`/doctors${params ? `?${params}` : ''}`);
export const getDoctor = (id) => apiClient(`/doctors/${id}`);
export const getDoctorSlots = (id, date) => apiClient(`/doctors/${id}/slots?date=${date}`);
