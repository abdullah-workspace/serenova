import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Express identifies error middleware by its four-parameter signature.
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  const status = error instanceof ApiError ? error.status : 500;
  const body = { code: error.code || 'INTERNAL_ERROR', message: status === 500 && env.NODE_ENV === 'production' ? 'Something went wrong' : error.message };
  if (error.fields) body.fields = error.fields;
  res.status(status).json({ error: body });
}
