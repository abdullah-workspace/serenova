import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    name: { type: String, required: true },
    initials: { type: String, required: true },
    specialty: { type: String, required: true },
    qualifications: [String],
    languages: [String],
    bio: String,
    consultationFee: Number,
    slotMinutes: { type: Number, default: 30 },
    availableDays: [String],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

doctorSchema.index({ name: 'text', specialty: 'text' });
export const Doctor = mongoose.model('Doctor', doctorSchema);
