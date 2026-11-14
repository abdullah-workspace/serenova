import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { Department } from '../models/Department.js';
import { Doctor } from '../models/Doctor.js';
import { Schedule } from '../models/Schedule.js';
import { Appointment } from '../models/Appointment.js';
import { ContactMessage } from '../models/ContactMessage.js';

export async function connectDb() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    if (env.NODE_ENV !== 'production') {
      await Promise.all([Department, Doctor, Schedule, Appointment, ContactMessage].map((model) => model.syncIndexes()));
    }
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

export function dbStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
