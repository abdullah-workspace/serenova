import { apiClient } from './client.js';
export const getDepartments = () => apiClient('/departments');
export const getDepartment = (slug) => apiClient(`/departments/${slug}`);
