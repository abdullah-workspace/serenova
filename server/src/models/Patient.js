import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  patientCode: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  address: { type: String, default: '' },
  emergencyContact: { name: { type: String, default: '' }, phone: { type: String, default: '' } },
  insurance: { provider: { type: String, default: '' }, memberId: { type: String, default: '' } }
}, { timestamps: true });

export const Patient = mongoose.model('Patient', schema);
