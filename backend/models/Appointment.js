import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    serviceType: { type: String, required: true },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED'
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ provider: 1, date: 1, time: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
