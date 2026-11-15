import * as service from '../services/admin.service.js';
import { audit } from '../utils/audit.js';

export async function list(req, res) { res.json({ data: await service.list(req.params.resource, req.query) }); }
export async function create(req, res) {
  const data = await service.create(req.params.resource, req.body);
  void audit(req, 'create', req.params.resource, data._id);
  res.status(201).json({ data });
}
export async function update(req, res) {
  const data = await service.update(req.params.resource, req.params.id, req.body);
  void audit(req, 'update', req.params.resource, req.params.id);
  res.json({ data });
}
export async function remove(req, res) {
  const data = await service.remove(req.params.resource, req.params.id);
  void audit(req, 'deactivate', req.params.resource, req.params.id);
  res.json({ data });
}
export async function report(req, res) { res.json({ data: await service.report(req.query.from, req.query.to) }); }
export async function getSettings(req, res) { res.json({ data: await service.getSettings() }); }
export async function updateSettings(req, res) {
  const data = await service.updateSettings(req.body, req.user._id);
  void audit(req, 'update', 'settings', null, req.body);
  res.json({ data });
}
