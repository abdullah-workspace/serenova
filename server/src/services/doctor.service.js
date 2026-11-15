import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';
import { ApiError } from '../utils/ApiError.js';
async function doctorFor(userId) {
  const doctor = await Doctor.findOne({ userId }).lean();
  if (!doctor) throw new ApiError(403, 'FORBIDDEN', 'Doctor profile is not linked to this account');
  return doctor;
}
export async function profile(userId) { return doctorFor(userId); }
export async function appointments(userId, query = {}) {
  const doctor = await doctorFor(userId);
  const filter = { doctorId: doctor._id };
  if (query.status) filter.status = query.status;
  return Appointment.find(filter).populate('patientId', 'fullName phone patientCode').sort({ startAt: 1 }).limit(300).lean();
}
export async function appointment(userId, id) {
  const doctor = await doctorFor(userId);
  const result = await Appointment.findOne({ _id: id, doctorId: doctor._id }).populate('patientId', 'fullName phone patientCode').lean();
  if (!result) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  return result;
}
export async function schedule(userId) {
  const doctor = await doctorFor(userId);
  return Schedule.findOne({ doctorId: doctor._id }).lean();
}
export async function updateAppointment(userId, id, data) {
  const doctor = await doctorFor(userId);
  const result = await Appointment.findOneAndUpdate({ _id: id, doctorId: doctor._id }, { $set: data }, { new: true, runValidators: true }).lean();
  if (!result) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  return result;
}
