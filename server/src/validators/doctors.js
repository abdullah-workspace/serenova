import { z } from 'zod';
import { dateOnly, objectId } from './common.js';

export const slotsQuery = z.object({ date: dateOnly });
export const doctorIdParams = z.object({ id: objectId });
