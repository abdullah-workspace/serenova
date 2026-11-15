import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
    guest: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      dateOfBirth: { type: String, required: true }
    },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    visitType: { type: String, enum: ['new', 'returning'], required: true },
    reason: { type: String, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending'
    },
    consentAt: { type: Date, required: true },
    cancelReason: String,
    cancelTokenHash: { type: String, required: true, select: false },
    createdBy: { type: String, enum: ['guest', 'patient'], default: 'guest' },
    notes: String
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctorId: 1, startAt: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);
appointmentSchema.index({ status: 1, startAt: 1 });
appointmentSchema.index({ patientId: 1, startAt: 1 });
appointmentSchema.index({ 'guest.email': 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
