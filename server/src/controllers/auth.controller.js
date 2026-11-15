import { asyncHandler } from '../utils/asyncHandler.js';
import * as service from '../services/auth.service.js';
import { env } from '../config/env.js';

const cookie = (res, name, value, maxAge, path = '/') => res.cookie(name, value, { httpOnly: true, secure: env.NODE_ENV === 'production' || env.AUTH_COOKIE_SECURE, sameSite: 'lax', maxAge, path });
const accessMaxAge = /^\d+$/.test(env.JWT_ACCESS_TTL) ? Number(env.JWT_ACCESS_TTL) * 1000 : Number(env.JWT_ACCESS_TTL.match(/^(\d+)([smhd])$/)?.[1] || 15) * ({ s: 1000, m: 60000, h: 3600000, d: 86400000 }[env.JWT_ACCESS_TTL.slice(-1)] || 60000);
const clear = (res) => { res.clearCookie('access'); res.clearCookie('refresh', { path: '/api/v1/auth' }); };
const result = (res, data) => {
  cookie(res, 'access', data.accessToken, accessMaxAge);
  cookie(res, 'refresh', data.refreshToken, (data.refreshRemember ? env.REFRESH_TTL_REMEMBER_DAYS : env.REFRESH_TTL_DAYS) * 86400000, '/api/v1/auth');
  res.json({ data: { user: data.user, patient: data.patient } });
};
export const register = asyncHandler(async (req, res) => result(res, await service.register(req.body, req)));
export const login = asyncHandler(async (req, res) => result(res, await service.login(req.body, req)));
export const refresh = asyncHandler(async (req, res) => result(res, await service.refresh(req.cookies?.refresh, req)));
export const logout = asyncHandler(async (req, res) => { await service.logout(req.cookies?.refresh); clear(res); res.json({ data: { success: true } }); });
export const me = asyncHandler(async (req, res) => res.json({ data: await service.getMe(req.user._id) }));
export const forgotPassword = asyncHandler(async (req, res) => { await service.requestPasswordReset(req.body.email); res.json({ data: { message: 'If an account exists, a reset email has been sent.' } }); });
export const resetPassword = asyncHandler(async (req, res) => { await service.resetPassword(req.body.token, req.body.password); clear(res); res.json({ data: { success: true } }); });
