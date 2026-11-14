import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';

export async function listDoctors({ department, q }) {
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (department) {
    const record = await Department.findOne({ slug: department, isActive: true }).select('_id').lean();
    if (!record) return [];
    filter.departmentId = record._id;
  }
  return Doctor.find(filter).populate('departmentId', 'name slug').sort({ name: 1 }).lean();
}

export function getDoctor(id) {
  return Doctor.findOne({ _id: id, isActive: true })
    .populate('departmentId', 'name slug')
    .lean()
    .then(async (doctor) => (doctor ? { ...doctor, schedule: await Schedule.findOne({ doctorId: id }).lean() } : null));
}
