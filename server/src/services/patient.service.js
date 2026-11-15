import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import * as booking from './booking.service.js';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function getPatient(userId) {
  const patient = await Patient.findOne({ userId }).lean();
  if (!patient) throw new ApiError(404, 'NOT_FOUND', 'Patient profile not found');
  return patient;
}

export async function profile(userId) {
  return getPatient(userId);
}

export async function updateProfile(userId, input) {
  const patient = await Patient.findOneAndUpdate({ userId }, { $set: input }, { new: true, runValidators: true }).lean();
  if (!patient) throw new ApiError(404, 'NOT_FOUND', 'Patient profile not found');
  return patient;
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
  }
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await RefreshToken.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
}

function queryForScope(patientId, scope) {
  return scope === 'upcoming'
    ? { patientId, startAt: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } }
    : { patientId, $or: [{ startAt: { $lt: new Date() } }, { status: { $in: ['completed', 'cancelled', 'no-show'] } }] };
}

export async function listAppointments(patientId, scope, page, limit) {
  const filter = queryForScope(patientId, scope);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter).sort({ startAt: scope === 'upcoming' ? 1 : -1 }).skip((page - 1) * limit).limit(limit)
      .populate('doctorId', 'name initials specialty').populate('departmentId', 'name slug').lean(),
    Appointment.countDocuments(filter)
  ]);
  return { appointments, page, limit, pages: Math.ceil(total / limit) };
}

export async function appointment(patientId, id) {
  return booking.getOwnedAppointment(id, patientId);
}

export async function cancel(patientId, id, reason) {
  return booking.cancelOwnedAppointment(id, patientId, reason);
}

export async function reschedule(patientId, id, startAt) {
  return booking.rescheduleOwnedAppointment(id, patientId, startAt);
}

export async function claim(userId, reference, token) {
  const patient = await getPatient(userId);
  const appointment = await Appointment.findOne({ reference }).select('+cancelTokenHash');
  const actual = Buffer.from(hash(token || ''), 'hex');
  const expected = Buffer.from(appointment?.cancelTokenHash || '', 'hex');
  const validToken = actual.length === expected.length && actual.length > 0 && crypto.timingSafeEqual(actual, expected);
  if (!appointment || appointment.patientId || !validToken) {
    throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  }
  appointment.patientId = patient._id;
  appointment.createdBy = 'patient';
  await appointment.save();
  return booking.getOwnedAppointment(appointment._id, patient._id);
}
