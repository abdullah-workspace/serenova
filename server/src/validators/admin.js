import { z } from 'zod';
import { objectId, dateOnly } from './common.js';

export const resource = z.object({ resource: z.enum(['departments', 'doctors', 'schedules', 'users']) });
export const id = z.object({ resource: z.enum(['departments', 'doctors', 'schedules', 'users']), id: objectId });
export const report = z.object({ from: dateOnly.optional(), to: dateOnly.optional() });
export const settings = z.record(z.union([z.string(), z.number(), z.boolean()]));
