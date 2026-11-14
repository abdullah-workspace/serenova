import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid record');
export const isoDateTime = z.string().datetime({ offset: true });
export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date');
export const phone = z.string().min(7).max(20).regex(/^[\d\s+()[\]-]+$/, 'Enter a phone number we can reach you on');
