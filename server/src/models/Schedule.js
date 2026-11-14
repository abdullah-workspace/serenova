import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, unique: true },
    weekly: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        start: { type: String, required: true },
        end: { type: String, required: true },
        breaks: [{ start: String, end: String }]
      }
    ],
    daysOff: [{ date: String, reason: String }]
  },
  { timestamps: true }
);

export const Schedule = mongoose.model('Schedule', scheduleSchema);
