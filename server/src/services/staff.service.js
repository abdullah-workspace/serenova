import { Appointment } from '../models/Appointment.js';
import { ApiError } from '../utils/ApiError.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Patient } from '../models/Patient.js';
export function listAppointments(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.date) {
    const start = new Date(`${query.date}T00:00:00.000Z`);
    filter.startAt = { $gte: start, $lt: new Date(start.getTime() + 86400000) };
  }
  return Appointment.find(filter).populate('doctorId', 'name').populate('departmentId', 'name').sort({ startAt: 1 }).limit(300).lean();
}
export async function updateAppointment(id, data) {
  const result = await Appointment.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  if (!result) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  return result;
}
export function listMessages(query = {}) { return ContactMessage.find(query.status ? { status: query.status } : {}).sort({ createdAt: -1 }).limit(200).lean(); }
export function listPatients(query = {}) { const filter = query.q ? { $or: [{ fullName: new RegExp(query.q, 'i') }, { patientCode: new RegExp(query.q, 'i') }] } : {}; return Patient.find(filter).sort({ fullName: 1 }).limit(200).lean(); }
export async function summary() { const [appointments, messages, patients] = await Promise.all([listAppointments({ date: new Date().toISOString().slice(0, 10) }), ContactMessage.countDocuments({ status: 'new' }), Patient.countDocuments({})]); return { appointmentsToday: appointments.length, newMessages: messages, patientCount: patients }; }
