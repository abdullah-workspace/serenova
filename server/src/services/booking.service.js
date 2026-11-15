import crypto from 'node:crypto';
import { DateTime } from 'luxon';
import { Appointment } from '../models/Appointment.js';
import { Counter } from '../models/Counter.js';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { isSlotBookable } from './slots.service.js';
import {
  sendBookingConfirmation,
  sendCancellation,
  sendReschedule
} from './email.service.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sameToken(token, storedHash) {
  if (!token || !storedHash) return false;
  const actual = Buffer.from(hashToken(token), 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function nextReference() {
  const year = DateTime.now().setZone(env.CLINIC_TIMEZONE).year;
  const counter = await Counter.findOneAndUpdate(
    { _id: String(year) },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return `APT-${year}-${String(counter.seq).padStart(5, '0')}`;
}

function publicSummary(appointment) {
  return {
    reference: appointment.reference,
    status: appointment.status,
    doctor: appointment.doctorId,
    department: appointment.departmentId,
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    visitType: appointment.visitType,
    guest: appointment.guest,
    reason: appointment.reason
  };
}

async function findWithToken(reference, token) {
  const appointment = await Appointment.findOne({ reference })
    .select('+cancelTokenHash')
    .populate('doctorId', 'name initials specialty')
    .populate('departmentId', 'name slug')
    .lean();
  if (!appointment || !sameToken(token, appointment.cancelTokenHash)) {
    throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  }
  return appointment;
}

function ensureChangeAllowed(appointment) {
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online. Please call the clinic.');
  }
  if (DateTime.fromJSDate(appointment.startAt).toUTC() <= DateTime.utc().plus({ hours: env.CANCEL_CUTOFF_HOURS })) {
    throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online. Please call the clinic.');
  }
}

export async function createAppointment(input) {
  const [doctor, department] = await Promise.all([
    Doctor.findOne({ _id: input.doctorId, isActive: true }).lean(),
    Department.findOne({ _id: input.departmentId, isActive: true }).lean()
  ]);
  if (!doctor || !department || String(doctor.departmentId) !== String(department._id)) {
    throw new ApiError(400, 'INVALID_DOCTOR', 'Choose a doctor from the selected department');
  }
  const slot = await isSlotBookable(input.doctorId, input.startAt);
  if (!slot) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'That time is no longer available. Please choose another.');

  const manageToken = crypto.randomBytes(32).toString('hex');
  const appointment = new Appointment({
    reference: await nextReference(),
    guest: {
      fullName: input.fullName,
      phone: input.phone,
      email: input.email.toLowerCase(),
      dateOfBirth: input.dateOfBirth
    },
    doctorId: doctor._id,
    departmentId: department._id,
    startAt: new Date(slot.startAt),
    endAt: new Date(slot.endAt),
    visitType: input.visitType,
    reason: input.reason || '',
    consentAt: new Date(),
    cancelTokenHash: hashToken(manageToken),
    patientId: input.patientId || null,
    createdBy: input.patientId ? 'patient' : 'guest'
  });
  try {
    await appointment.save();
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'SLOT_TAKEN', 'That time was just taken, please choose another.');
    }

    throw error;
  }

  const result = {
    ...publicSummary({
      ...appointment.toObject(),
      doctorId: { id: doctor._id, name: doctor.name, initials: doctor.initials, specialty: doctor.specialty },
      departmentId: { id: department._id, name: department.name, slug: department.slug }
    }),
    manageToken
  };
  void sendBookingConfirmation(result).catch((error) => logger.error(`Booking email failed: ${error.message}`));
  return result;
}

export async function getOwnedAppointment(id, patientId) {
  const appointment = await Appointment.findOne({ _id: id, patientId })
    .populate('doctorId', 'name initials specialty')
    .populate('departmentId', 'name slug')
    .lean();
  if (!appointment) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  return publicSummary(appointment);
}

export async function cancelOwnedAppointment(id, patientId, reason) {
  const appointment = await Appointment.findOne({ _id: id, patientId })
    .populate('doctorId', 'name initials specialty')
    .populate('departmentId', 'name slug')
    .lean();
  if (!appointment) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  ensureChangeAllowed(appointment);
  const updated = await Appointment.findOneAndUpdate(
    { _id: id, patientId, status: { $in: ['pending', 'confirmed'] } },
    { $set: { status: 'cancelled', cancelReason: reason || '' } },
    { new: true }
  ).populate('doctorId', 'name initials specialty').populate('departmentId', 'name slug').lean();
  if (!updated) throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online. Please call the clinic.');
  return publicSummary(updated);
}

export async function rescheduleOwnedAppointment(id, patientId, newStartAt) {
  const appointment = await Appointment.findOne({ _id: id, patientId })
    .populate('doctorId', 'name initials specialty')
    .populate('departmentId', 'name slug')
    .lean();
  if (!appointment) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found');
  ensureChangeAllowed(appointment);
  const slot = await isSlotBookable(appointment.doctorId._id, newStartAt);
  if (!slot) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'That time is no longer available. Please choose another.');
  try {
    const updated = await Appointment.findOneAndUpdate(
      { _id: id, patientId, status: { $in: ['pending', 'confirmed'] } },
      { $set: { startAt: new Date(slot.startAt), endAt: new Date(slot.endAt) } },
      { new: true }
    ).populate('doctorId', 'name initials specialty').populate('departmentId', 'name slug').lean();
    if (!updated) throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online.');
    return publicSummary(updated);
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'SLOT_TAKEN', 'That time was just taken, please choose another.');
    throw error;
  }
}

export async function lookupAppointment(reference, token) {
  return publicSummary(await findWithToken(reference, token));
}

export async function cancelAppointment(reference, token, reason) {
  const appointment = await findWithToken(reference, token);
  ensureChangeAllowed(appointment);
  const updated = await Appointment.findOneAndUpdate(
    { reference, status: { $in: ['pending', 'confirmed'] } },
    { $set: { status: 'cancelled', cancelReason: reason || '' } },
    { new: true }
  )
    .populate('doctorId', 'name initials specialty')
    .populate('departmentId', 'name slug')
    .lean();
  if (!updated) throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online. Please call the clinic.');
  const result = publicSummary(updated);
  void sendCancellation(result).catch((error) => logger.error(`Cancellation email failed: ${error.message}`));
  return result;
}

export async function rescheduleAppointment(reference, token, newStartAt) {
  const appointment = await findWithToken(reference, token);
  ensureChangeAllowed(appointment);
  const slot = await isSlotBookable(appointment.doctorId._id, newStartAt);
  if (!slot) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'That time is no longer available. Please choose another.');
  try {
    const updated = await Appointment.findOneAndUpdate(
      { reference, status: { $in: ['pending', 'confirmed'] } },
      { $set: { startAt: new Date(slot.startAt), endAt: new Date(slot.endAt) } },
      { new: true }
    )
      .populate('doctorId', 'name initials specialty')
      .populate('departmentId', 'name slug')
      .lean();
    if (!updated) throw new ApiError(409, 'TOO_LATE', 'This visit is too close to cancel online. Please call the clinic.');
    const result = publicSummary(updated);
    void sendReschedule(result).catch((error) => logger.error(`Reschedule email failed: ${error.message}`));
    return result;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'SLOT_TAKEN', 'That time was just taken, please choose another.');
    }
    throw error;
  }
}
