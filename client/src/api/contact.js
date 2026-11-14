import { apiClient } from './client.js';
export const sendContactMessage = (input) =>
  apiClient('/contact', { method: 'POST', body: JSON.stringify(input) });
