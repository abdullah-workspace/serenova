import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, default: null, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: String,
  userAgent: String
}, { timestamps: true });

schema.index({ createdAt: -1 });
export const AuditLog = mongoose.model('AuditLog', schema);
