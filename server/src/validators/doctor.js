import { z } from 'zod';
import { objectId } from './common.js';
export const id = z.object({ id: objectId });
export const query = z.object({ status: z.string().optional() });
export const update = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().max(2000).optional()
}).refine((value) => Object.keys(value).length > 0);
