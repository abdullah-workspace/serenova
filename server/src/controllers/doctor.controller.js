import * as service from '../services/doctor.service.js';
import { audit } from '../utils/audit.js';
export async function profile(req, res) { res.json({ data: await service.profile(req.user._id) }); }
export async function appointments(req, res) { res.json({ data: await service.appointments(req.user._id, req.query) }); }
export async function appointment(req, res) { res.json({ data: await service.appointment(req.user._id, req.params.id) }); }
export async function schedule(req, res) { res.json({ data: await service.schedule(req.user._id) }); }
export async function updateAppointment(req, res) {
  const data = await service.updateAppointment(req.user._id, req.params.id, req.body);
  void audit(req, 'update', 'appointment', req.params.id, req.body);
  res.json({ data });
}
