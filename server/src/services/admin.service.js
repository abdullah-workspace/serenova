import bcrypt from 'bcryptjs';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import { Patient } from '../models/Patient.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import * as settings from './settings.service.js';

const models = { departments: Department, doctors: Doctor, schedules: Schedule, users: User };
export async function list(resource, query = {}) {
  const Model = models[resource];
  const filter = {};
  if (query.q) filter.$or = [{ name: new RegExp(query.q, 'i') }, { email: new RegExp(query.q, 'i') }];
  if (query.active !== undefined) filter.isActive = query.active;
  return Model.find(filter).sort({ createdAt: -1 }).limit(200).lean();
}
export async function create(resource, data) {
  const Model = models[resource];
  if (resource === 'users' && data.password) {
    data = { ...data, passwordHash: await bcrypt.hash(data.password, env.BCRYPT_COST) };
    delete data.password;
  }
  const created = await Model.create(data);
  if (resource === 'users') {
    const result = created.toObject();
    delete result.passwordHash;
    return result;
  }
  return created;
}
export async function update(resource, id, data) {
  const Model = models[resource];
  if (resource === 'users' && data.password) {
    data = { ...data, passwordHash: await bcrypt.hash(data.password, env.BCRYPT_COST) };
    delete data.password;
  }
  const result = await Model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  if (!result) throw new ApiError(404, 'NOT_FOUND', `${resource} record not found`);
  return result;
}
export async function remove(resource, id) {
  const Model = models[resource];
  const result = await Model.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true }).lean();
  if (!result) throw new ApiError(404, 'NOT_FOUND', `${resource} record not found`);
  return result;
}
export async function report(from, to) {
  const filter = {};
  if (from || to) filter.startAt = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
  const [appointments, patients, audit] = await Promise.all([
    Appointment.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Patient.countDocuments({}),
    AuditLog.countDocuments({})
  ]);
  return { appointments, patients, auditEvents: audit };
}
export const getSettings = settings.getSettings;
export const updateSettings = settings.updateSettings;
