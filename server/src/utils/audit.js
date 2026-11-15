import { AuditLog } from '../models/AuditLog.js';

export function audit(req, action, resource, resourceId = null, metadata = {}) {
  return AuditLog.create({
    actorId: req.user?._id || null,
    action, resource, resourceId: resourceId ? String(resourceId) : null,
    metadata, ip: req.ip, userAgent: req.get('user-agent')
  }).catch(() => undefined);
}
