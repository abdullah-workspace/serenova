import { z } from 'zod';
import { objectId, dateOnly } from './common.js';
export const query = z.object({ status: z.string().optional(), date: dateOnly.optional() });
export const id = z.object({ id: objectId });
export const update = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().max(2000).optional(),
  cancelReason: z.string().max(500).optional()
}).refine((value) => Object.keys(value).length > 0);
