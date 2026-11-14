import { apiClient } from './client.js';
export const getAvailabilityToday = () => apiClient('/availability/today');
