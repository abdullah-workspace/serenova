import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';
import { departments, doctors } from './data.js';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';

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
const passwordHash = await bcrypt.hash(env.SEED_DEMO_PASSWORD, env.BCRYPT_COST);
const demoUsers = [
  { email: 'admin@serenova.example', role: 'admin' },
  { email: 'reception@serenova.example', role: 'receptionist' },
  { email: 'patient@serenova.example', role: 'patient' }
];
const users = {};
for (const demo of demoUsers) {
  users[demo.role] = await User.findOneAndUpdate(
    { email: demo.email },
    { $set: { passwordHash, role: demo.role, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
const patient = await Patient.findOneAndUpdate(
  { userId: users.patient._id },
  { $setOnInsert: { patientCode: 'SC-000001', fullName: 'Demo Patient', phone: '+92 300 0000000', dateOfBirth: '1990-01-01' } },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
const demoDoctor = doctorDocs[0];
await Appointment.findOneAndUpdate(
  { reference: 'APT-DEMO-00001' },
  {
    $set: {
      patientId: patient._id,
      createdBy: 'patient',
      guest: { fullName: patient.fullName, phone: patient.phone, email: users.patient.email, dateOfBirth: patient.dateOfBirth },
      doctorId: demoDoctor._id,
      departmentId: demoDoctor.departmentId,
      startAt: new Date(Date.now() + 3 * 86400000),
      endAt: new Date(Date.now() + 3 * 86400000 + 30 * 60000),
      visitType: 'new',
      consentAt: new Date(),
      status: 'confirmed',
      cancelTokenHash: 'seed-demo-token-hash'
    }
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
console.info(`Inserted ${departmentDocs.length} departments, ${doctorDocs.length} doctors and ${doctorDocs.length} schedules.`);
console.warn(`Development demo accounts only. Password: ${env.SEED_DEMO_PASSWORD}. Patient ID: ${patient.patientCode}.`);
await mongoose.disconnect();
