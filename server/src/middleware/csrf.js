import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const cookieRoute = req.originalUrl.includes('/auth/') || req.cookies?.access || req.cookies?.refresh;
  if (!cookieRoute) return next();
  if (req.get('origin') && req.get('origin') !== env.CLIENT_URL) {
    return next(new ApiError(403, 'CSRF', 'Request origin is not allowed'));
  }
  if (req.get('x-requested-with') !== 'serenova') {
    return next(new ApiError(403, 'CSRF', 'Request origin is not allowed'));
  }
  return next();
}
