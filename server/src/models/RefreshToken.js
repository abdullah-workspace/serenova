import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, select: false },
  family: { type: String, required: true, index: true },
  remember: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'RefreshToken' },
  userAgent: String,
  ip: String
}, { timestamps: true });

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RefreshToken = mongoose.model('RefreshToken', schema);
