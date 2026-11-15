import * as service from '../services/staff.service.js';
import { audit } from '../utils/audit.js';
export async function list(req, res) { res.json({ data: await service.listAppointments(req.query) }); }
export async function update(req, res) {
  const data = await service.updateAppointment(req.params.id, req.body);
  void audit(req, 'update', 'appointment', req.params.id, req.body);
  res.json({ data });
}
export async function messages(req, res) { res.json({ data: { messages: await service.listMessages(req.query) } }); }
export async function patients(req, res) { res.json({ data: { patients: await service.listPatients(req.query) } }); }
export async function summary(req, res) { res.json({ data: await service.summary() }); }
