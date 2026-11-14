import { asyncHandler } from '../utils/asyncHandler.js';
import * as booking from '../services/booking.service.js';
import * as slots from '../services/slots.service.js';
import { env } from '../config/env.js';

export const listSlots = asyncHandler(async (req, res) => {
  const result = await slots.getSlots(req.params.id, req.query.date);
  res.json({
    data: {
      date: req.query.date,
      doctorId: req.params.id,
      timezone: env.CLINIC_TIMEZONE,
      slots: result
    }
  });
});

export const availabilityToday = asyncHandler(async (req, res) => {
  res.json({ data: await slots.getAvailabilityToday() });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ data: await booking.createAppointment(req.body) });
});

export const lookup = asyncHandler(async (req, res) => {
  res.json({ data: await booking.lookupAppointment(req.query.ref, req.query.token) });
});

export const cancel = asyncHandler(async (req, res) => {
  res.json({ data: await booking.cancelAppointment(req.params.reference, req.body.token, req.body.reason) });
});

export const reschedule = asyncHandler(async (req, res) => {
  res.json({ data: await booking.rescheduleAppointment(req.params.reference, req.body.token, req.body.startAt) });
});
