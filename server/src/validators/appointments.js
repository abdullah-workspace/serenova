import { z } from 'zod';
import { dateOnly, isoDateTime, objectId, phone } from './common.js';

const birthDate = dateOnly.refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  const now = new Date();
  const oldest = new Date(now);
  oldest.setUTCFullYear(oldest.getUTCFullYear() - 120);
  return date < now && date >= oldest;
}, 'Enter a valid date of birth');

export const createAppointment = z.object({
  visitType: z.enum(['new', 'returning']),
  departmentId: objectId,
  doctorId: objectId,
  startAt: isoDateTime,
  fullName: z.string().trim().min(2).max(80),
  phone,
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  dateOfBirth: birthDate,
  reason: z.string().max(500).optional().default(''),
  consent: z.literal(true)
});

export const lookup = z.object({ ref: z.string().min(1), token: z.string().length(64) });
export const cancel = z.object({ token: z.string().length(64), reason: z.string().max(500).optional() });
export const reschedule = z.object({ token: z.string().length(64), startAt: isoDateTime });
export const referenceParams = z.object({ reference: z.string().regex(/^APT-\d{4}-\d{5}$/) });

export const contact = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(2000)
});
