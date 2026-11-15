import { ApiError } from '../utils/ApiError.js';
export const requireRole = (...roles) => (req, res, next) =>
  req.user && roles.includes(req.user.role) ? next() : next(new ApiError(403, 'FORBIDDEN', 'You do not have permission'));
