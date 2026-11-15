import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['patient', 'doctor', 'receptionist', 'admin'], default: 'patient', index: true },
  isActive: { type: Boolean, default: true },
  emailVerifiedAt: Date,
  consentAt: Date,
  failedLogins: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLoginAt: Date
}, { timestamps: true });

export const User = mongoose.model('User', schema);
