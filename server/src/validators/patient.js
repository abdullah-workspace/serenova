import { z } from 'zod';
import { dateOnly, isoDateTime, objectId, phone } from './common.js';

export const profile = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone,
  dateOfBirth: dateOnly,
  gender: z.string().max(40).optional().default(''),
  address: z.string().max(300).optional().default(''),
  emergencyContact: z.object({ name: z.string().max(120).optional().default(''), phone: z.string().max(40).optional().default('') }).optional(),
  insurance: z.object({ provider: z.string().max(120).optional().default(''), memberId: z.string().max(120).optional().default('') }).optional()
});

export const password = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(10).max(72).regex(/[A-Za-z]/).regex(/\d/) });
export const list = z.object({ scope: z.enum(['upcoming', 'past']).default('upcoming'), page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(50).default(10) });
export const id = z.object({ id: objectId });
export const cancel = z.object({ reason: z.string().max(500).optional().default('') });
export const reschedule = z.object({ startAt: isoDateTime });
export const claim = z.object({ reference: z.string().regex(/^APT-\d{4}-\d{5}$/), token: z.string().length(64) });
