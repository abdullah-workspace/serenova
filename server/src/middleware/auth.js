import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.access || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
    req.user = user; req.auth = payload; return next();
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, 'UNAUTHENTICATED', 'Authentication required'));
  }
}

export function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.access || (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (token) {
      const payload = jwt.verify(token, env.JWT_SECRET);
      User.findOne({ _id: payload.sub, isActive: true }).then((user) => { req.user = user || undefined; next(); }).catch(() => next());
      return;
    }
  } catch { /* optional credentials do not block public access */ }
  next();
}
