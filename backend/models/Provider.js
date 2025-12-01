import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    defaultWorkingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    serviceTypes: [
      {
        name: { type: String, required: true },
        durationMinutes: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

export const Provider = mongoose.model('Provider', providerSchema);
