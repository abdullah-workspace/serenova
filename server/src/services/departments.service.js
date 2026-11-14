import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';

export const listDepartments = () => Department.find({ isActive: true }).sort({ name: 1 }).lean();

export async function getDepartment(slug) {
  const department = await Department.findOne({ slug, isActive: true }).lean();
  if (!department) return null;
  const doctors = await Doctor.find({ departmentId: department._id, isActive: true }).lean();
  return { ...department, doctors };
}
