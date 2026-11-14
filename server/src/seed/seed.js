import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';
import { departments, doctors } from './data.js';

const dayNumbers = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
await mongoose.connect(env.MONGODB_URI);
await Promise.all([Schedule.deleteMany({}), Doctor.deleteMany({}), Department.deleteMany({})]);
const departmentDocs = await Department.insertMany(departments);
const byName = new Map(departmentDocs.map((department) => [department.name, department]));
const doctorDocs = await Doctor.insertMany(
  doctors.map(({ department, ...doctor }) => ({ ...doctor, departmentId: byName.get(department)._id }))
);
await Schedule.insertMany(
  doctorDocs.map((doctor) => ({
    doctorId: doctor._id,
    weekly: doctor.availableDays
      .flatMap((value) => value === 'Mon to Sat' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : value.split(', '))
      .map((day) => ({ day: dayNumbers[day], start: '09:00', end: '17:00', breaks: [{ start: '13:00', end: '14:00' }] }))
  }))
);
console.info(`Inserted ${departmentDocs.length} departments, ${doctorDocs.length} doctors and ${doctorDocs.length} schedules.`);
await mongoose.disconnect();
