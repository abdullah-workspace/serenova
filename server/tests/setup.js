import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Department } from '../src/models/Department.js';
import { Doctor } from '../src/models/Doctor.js';
import { Schedule } from '../src/models/Schedule.js';
import { Appointment } from '../src/models/Appointment.js';
import { ContactMessage } from '../src/models/ContactMessage.js';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([Department, Doctor, Schedule, Appointment, ContactMessage].map((model) => model.syncIndexes()));
});

beforeEach(async () => {
  await Promise.all([Department.deleteMany({}), Doctor.deleteMany({}), Schedule.deleteMany({}), Appointment.deleteMany({}), ContactMessage.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
