import { apiClient } from './client.js';

const call = (path, options) => apiClient(path, options);
export const getDoctorSummary = async () => { const data = await call('/doctor/appointments'); return { appointments: data, today: data }; };
export const getDoctorAppointments = (query = '') => call(`/doctor/appointments${query ? `?${query}` : ''}`);
export const getDoctorAppointment = (id) => call(`/doctor/appointments/${id}`);
export const updateDoctorAppointment = (id, input) => call(`/doctor/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const getDoctorSchedule = () => call('/doctor/schedule');

export const getStaffSummary = () => call('/staff/summary');
export const getStaffAppointments = (query = '') => call(`/staff/appointments${query ? `?${query}` : ''}`);
export const getStaffAppointment = (id) => call(`/staff/appointments/${id}`);
export const createStaffAppointment = (input) => call('/staff/appointments', { method: 'POST', body: JSON.stringify(input) });
export const updateStaffAppointment = (id, input) => call(`/staff/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const getStaffMessages = (query = '') => call(`/staff/messages${query ? `?${query}` : ''}`);
export const getStaffMessage = (id) => call(`/staff/messages/${id}`);
export const updateStaffMessage = (id, status) => call(`/staff/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const getStaffPatients = (query = '') => call(`/staff/patients${query ? `?${query}` : ''}`);
export const getStaffPatient = (id) => call(`/staff/patients/${id}`);

export const getAdminSummary = (query = '') => call(`/admin/reports${query ? `?${query}` : ''}`);
export const getAdminDoctors = () => call('/admin/doctors');
export const createAdminDoctor = (input) => call('/admin/doctors', { method: 'POST', body: JSON.stringify(input) });
export const updateAdminDoctor = (id, input) => call(`/admin/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const getAdminSchedule = (id) => call(`/admin/doctors/${id}/schedule`);
export const updateAdminSchedule = (id, input) => call(`/admin/doctors/${id}/schedule`, { method: 'PUT', body: JSON.stringify(input) });
export const getAdminDepartments = () => call('/admin/departments');
export const createAdminDepartment = (input) => call('/admin/departments', { method: 'POST', body: JSON.stringify(input) });
export const updateAdminDepartment = (id, input) => call(`/admin/departments/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const getAdminUsers = (query = '') => call(`/admin/users${query ? `?${query}` : ''}`);
export const createAdminUser = (input) => call('/admin/users', { method: 'POST', body: JSON.stringify(input) });
export const updateAdminUser = (id, input) => call(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const getAdminSettings = () => call('/admin/settings');
export const updateAdminSettings = (input) => call('/admin/settings', { method: 'PATCH', body: JSON.stringify(input) });
