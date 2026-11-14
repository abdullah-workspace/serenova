import { DateTime } from 'luxon';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function clinicDate(dateString) {
  if (!datePattern.test(dateString)) {
    throw new ApiError(400, 'INVALID_DATE', 'Enter a date in YYYY-MM-DD format');
  }
  const date = DateTime.fromISO(dateString, { zone: env.CLINIC_TIMEZONE });
  if (!date.isValid || date.toISODate() !== dateString) {
    throw new ApiError(400, 'INVALID_DATE', 'Enter a valid date');
  }
  const today = DateTime.now().setZone(env.CLINIC_TIMEZONE).startOf('day');
  if (date < today) throw new ApiError(400, 'PAST_DATE', 'Choose a future date');
  if (date > today.plus({ days: env.BOOKING_MAX_DAYS_AHEAD })) {
    throw new ApiError(400, 'DATE_TOO_FAR', `Choose a date within ${env.BOOKING_MAX_DAYS_AHEAD} days`);
  }
  return date;
}

function localDateTime(date, time) {
  return DateTime.fromISO(`${date.toISODate()}T${time}`, { zone: env.CLINIC_TIMEZONE });
}

function isWithinBreak(time, breaks = []) {
  return breaks.some((breakTime) => time >= breakTime.start && time < breakTime.end);
}

export async function getSlots(doctorId, dateString) {
  const date = clinicDate(dateString);
  const doctor = await Doctor.findOne({ _id: doctorId, isActive: true }).lean();
  if (!doctor) throw new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
  const schedule = await doctorSchedule(doctorId);
  if (!schedule || schedule.daysOff.some((day) => day.date === dateString)) return [];
  const weekly = schedule.weekly.find((entry) => entry.day === date.weekday % 7);
  if (!weekly) return [];

  const slots = [];
  const step = doctor.slotMinutes || 30;
  let cursor = localDateTime(date, weekly.start);
  const finish = localDateTime(date, weekly.end);
  const nowWithNotice = DateTime.utc().plus({ hours: env.MIN_NOTICE_HOURS });
  while (cursor.plus({ minutes: step }) <= finish) {
    const label = cursor.toFormat('HH:mm');
    const slotEnd = cursor.plus({ minutes: step });
    if (!isWithinBreak(label, weekly.breaks) && cursor.toUTC() >= nowWithNotice) {
      slots.push({
        startAt: cursor.toUTC().toISO(),
        endAt: slotEnd.toUTC().toISO(),
        label
      });
    }
    cursor = slotEnd;
  }
  const taken = await Appointment.find({
    doctorId,
    status: { $in: ['pending', 'confirmed'] },
    startAt: { $in: slots.map((slot) => slot.startAt) }
  }).select('startAt').lean();
  const takenStarts = new Set(taken.map((appointment) => new Date(appointment.startAt).toISOString()));
  return slots.filter((slot) => !takenStarts.has(new Date(slot.startAt).toISOString()));
}

async function doctorSchedule(doctorId) {
  const { Schedule } = await import('../models/Schedule.js');
  return Schedule.findOne({ doctorId }).lean();
}

export async function isSlotBookable(doctorId, startAt) {
  const instant = DateTime.fromISO(startAt, { setZone: true });
  if (!instant.isValid || !instant.isOffsetFixed) return false;
  const clinicDateString = instant.setZone(env.CLINIC_TIMEZONE).toISODate();
  const slots = await getSlots(doctorId, clinicDateString);
  return slots.find((slot) => slot.startAt === instant.toUTC().toISO()) || false;
}

export async function getAvailabilityToday() {
  const doctors = await Doctor.find({ isActive: true }).sort({ name: 1 }).limit(20).lean();
  const today = DateTime.now().setZone(env.CLINIC_TIMEZONE).toISODate();
  const results = [];
  for (const doctor of doctors) {
    const slots = await getSlots(doctor._id, today);
    if (slots.length) {
      results.push({
        doctor: { id: doctor._id, name: doctor.name, initials: doctor.initials, specialty: doctor.specialty },
        slots: slots.slice(0, 3).map(({ startAt, label }) => ({ startAt, label }))
      });
    }
    if (results.length === 4) break;
  }
  return results;
}

export { clinicDate };
