import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

export const routeRateLimit = (windowMs, limit) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res, next) {
      next(new ApiError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.'));
    }
  });
