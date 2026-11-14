import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import * as service from '../services/doctors.service.js';

export async function list(req, res) {
  res.json({ data: await service.listDoctors({ department: req.query.department, q: req.query.q }) });
}

export async function get(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'INVALID_ID', 'Invalid doctor id');
  }
  const doctor = await service.getDoctor(req.params.id);
  if (!doctor) throw new ApiError(404, 'DOCTOR_NOT_FOUND', 'Doctor not found');
  res.json({ data: doctor });
}
