import { ApiError } from '../utils/ApiError.js';
import * as service from '../services/departments.service.js';

export async function list(req, res) {
  res.json({ data: await service.listDepartments() });
}

export async function get(req, res) {
  const department = await service.getDepartment(req.params.slug);
  if (!department) throw new ApiError(404, 'DEPARTMENT_NOT_FOUND', 'Department not found');
  res.json({ data: department });
}
