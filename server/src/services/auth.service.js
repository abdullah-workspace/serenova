import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordReset } from '../models/PasswordReset.js';
import { Counter } from '../models/Counter.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email.service.js';
import { logger } from '../utils/logger.js';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const randomToken = () => crypto.randomBytes(32).toString('hex');
const dummyPasswordHash = '$2a$12$cGe0s2/D2w5UQRYArMRyH.SC9FUvcvh2vwmRqxyRieaaaRkAkPle.';
const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role
});
const publicPatient = (patient) => patient ? { id: patient._id, patientCode: patient.patientCode, fullName: patient.fullName, phone: patient.phone, dateOfBirth: patient.dateOfBirth, gender: patient.gender, address: patient.address, emergencyContact: patient.emergencyContact, insurance: patient.insurance } : null;

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
}

async function issueRefresh(user, req, remember = false, family = crypto.randomUUID()) {
  const raw = randomToken();
  const token = await RefreshToken.create({
    userId: user._id, tokenHash: hash(raw), family, remember,
    expiresAt: new Date(Date.now() + (remember ? env.REFRESH_TTL_REMEMBER_DAYS : env.REFRESH_TTL_DAYS) * 86400000),
    userAgent: req.get('user-agent'), ip: req.ip
  });
  return { raw, token };
}

export async function register({ email, password, fullName, phone, dateOfBirth, consent }, req) {
  if (!consent) throw new ApiError(400, 'VALIDATION', 'Consent is required', { consent: 'Consent is required' });
  const normalized = email.toLowerCase();
  if (await User.exists({ email: normalized })) throw new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists. Try logging in.');
  let user;
  try {
    user = await User.create({ email: normalized, passwordHash: await bcrypt.hash(password, env.BCRYPT_COST), consentAt: new Date() });
  } catch (error) {
    if (error?.code === 11000) throw new ApiError(409, 'EMAIL_IN_USE', 'An account with this email already exists. Try logging in.');
    throw error;
  }
  const counter = await Counter.findOneAndUpdate({ _id: 'patient' }, { $inc: { seq: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const patientCode = `SC-${String(counter.seq).padStart(6, '0')}`;
  const patient = await Patient.create({ userId: user._id, patientCode, fullName, phone, dateOfBirth });
  const refresh = await issueRefresh(user, req);
  sendWelcomeEmail({ email: user.email, fullName }).catch(() => {});
  return { user: publicUser(user), patient: publicPatient(patient), accessToken: signAccessToken(user), refreshToken: refresh.raw, refreshRemember: false };
}

export async function login({ identifier, password, remember }, req) {
  let user = await User.findOne({ email: identifier.toLowerCase() }).select('+passwordHash');
  if (!user) {
    const patient = await Patient.findOne({ patientCode: identifier.toUpperCase() });
    if (patient) user = await User.findById(patient.userId).select('+passwordHash');
  }
  const generic = () => new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  const passwordHash = user?.passwordHash || dummyPasswordHash;
  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (!user || !user.isActive) throw generic();
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', 'Too many attempts. Try again in a few minutes.');
  }
  if (!passwordMatches) {
    user.failedLogins += 1;
    if (user.failedLogins >= env.MAX_FAILED_LOGINS) {
      user.lockedUntil = new Date(Date.now() + env.LOCK_MINUTES * 60000);
      await user.save();
      throw new ApiError(423, 'ACCOUNT_LOCKED', 'Too many attempts. Try again in a few minutes.');
    }
    await user.save();
    throw generic();
  }
  user.failedLogins = 0; user.lockedUntil = undefined; user.lastLoginAt = new Date(); await user.save();
  const patient = await Patient.findOne({ userId: user._id });
  const refresh = await issueRefresh(user, req, remember);
  return { user: publicUser(user), patient: publicPatient(patient), accessToken: signAccessToken(user), refreshToken: refresh.raw, refreshRemember: Boolean(remember) };
}

export async function refresh(raw, req) {
  if (!raw) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
  const token = await RefreshToken.findOne({ tokenHash: hash(raw) }).select('+tokenHash');
  if (!token || token.expiresAt <= new Date()) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
  if (token.revokedAt) {
    await RefreshToken.updateMany({ family: token.family, revokedAt: null }, { revokedAt: new Date() });
    throw new ApiError(401, 'TOKEN_REUSE', 'Authentication required');
  }
  const user = await User.findById(token.userId);
  if (!user || !user.isActive) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
  token.revokedAt = new Date();
  const next = await issueRefresh(user, req, token.remember, token.family);
  token.replacedBy = next.token._id; await token.save();
  return { user: publicUser(user), patient: publicPatient(await Patient.findOne({ userId: user._id })), accessToken: signAccessToken(user), refreshToken: next.raw, refreshRemember: token.remember };
}

export async function logout(raw) {
  if (raw) await RefreshToken.updateOne({ tokenHash: hash(raw), revokedAt: null }, { revokedAt: new Date() });
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;
  const raw = randomToken();
  await PasswordReset.deleteMany({ userId: user._id });
  await PasswordReset.create({ userId: user._id, tokenHash: hash(raw), expiresAt: new Date(Date.now() + env.RESET_TOKEN_MINUTES * 60000) });
  void sendPasswordResetEmail({ email: user.email, token: raw }).catch((error) => logger.error(`Password reset email failed: ${error.message}`));
}

export async function resetPassword(raw, password) {
  const record = raw && await PasswordReset.findOne({ tokenHash: hash(raw), expiresAt: { $gt: new Date() }, usedAt: null }).select('+tokenHash');
  if (!record) throw new ApiError(400, 'INVALID_TOKEN', 'This link has expired. Request a new one.');
  const user = await User.findById(record.userId);
  user.passwordHash = await bcrypt.hash(password, env.BCRYPT_COST); user.failedLogins = 0; user.lockedUntil = undefined; await user.save();
  record.usedAt = new Date(); await record.save();
  await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
}

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required');
  return { user: publicUser(user), patient: publicPatient(await Patient.findOne({ userId })) };
}
