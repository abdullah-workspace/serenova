import { asyncHandler } from '../utils/asyncHandler.js';
import * as service from '../services/patient.service.js';

export const profile = asyncHandler(async (req, res) => res.json({ data: await service.profile(req.user._id) }));
export const updateProfile = asyncHandler(async (req, res) => res.json({ data: await service.updateProfile(req.user._id, req.body) }));
export const changePassword = asyncHandler(async (req, res) => { await service.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword); res.json({ data: { success: true } }); });
export const list = asyncHandler(async (req, res) => res.json({ data: await service.listAppointments(req.patient._id, req.query.scope, req.query.page, req.query.limit) }));
export const get = asyncHandler(async (req, res) => res.json({ data: await service.appointment(req.patient._id, req.params.id) }));
export const cancel = asyncHandler(async (req, res) => res.json({ data: await service.cancel(req.patient._id, req.params.id, req.body.reason) }));
export const reschedule = asyncHandler(async (req, res) => res.json({ data: await service.reschedule(req.patient._id, req.params.id, req.body.startAt) }));
export const claim = asyncHandler(async (req, res) => res.json({ data: await service.claim(req.user._id, req.body.reference, req.body.token) }));
