import express from 'express';
import { Provider } from '../models/Provider.js';
import { Appointment } from '../models/Appointment.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: generate time slots
const generateSlots = (start, end, durationMinutes) => {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  let current = new Date();
  current.setHours(sh, sm, 0, 0);
  const endDate = new Date();
  endDate.setHours(eh, em, 0, 0);

  while (current < endDate) {
    slots.push(current.toTimeString().slice(0, 5)); // HH:mm
    current.setMinutes(current.getMinutes() + durationMinutes);
  }
  return slots;
};

// GET /api/appointments/availability?providerId=&date=&serviceType=
router.get('/availability', async (req, res) => {
  const { providerId, date, serviceType } = req.query;
  if (!providerId || !date || !serviceType) {
    return res.status(400).json({ message: 'providerId, date, serviceType required' });
  }

  const provider = await Provider.findById(providerId);
  if (!provider) {
    return res.status(404).json({ message: 'Provider not found' });
  }

  const service = provider.serviceTypes.find((s) => s.name === serviceType);
  if (!service) {
    return res.status(400).json({ message: 'Service type not found for this provider' });
  }

  const slots = generateSlots(
    provider.defaultWorkingHours.start,
    provider.defaultWorkingHours.end,
    service.durationMinutes
  );

  const booked = await Appointment.find({
    provider: providerId,
    date,
    status: 'CONFIRMED'
  }).lean();

  const bookedSet = new Set(booked.map((b) => b.time));
  const availableSlots = slots.filter((s) => !bookedSet.has(s));

  res.json({ availableSlots });
});

// POST /api/appointments/book
router.post('/book', protect, async (req, res) => {
  const { providerId, date, time, serviceType } = req.body;
  if (!providerId || !date || !time || !serviceType) {
    return res.status(400).json({ message: 'providerId, date, time, serviceType required' });
  }

  const existing = await Appointment.findOne({
    provider: providerId,
    date,
    time,
    status: 'CONFIRMED'
  });

  if (existing) {
    return res.status(409).json({ message: 'Slot already booked' });
  }

  const appt = await Appointment.create({
    provider: providerId,
    user: req.user._id,
    date,
    time,
    serviceType
  });

  res.status(201).json(appt);
});

// GET /api/appointments/my (user's own)
router.get('/my', protect, async (req, res) => {
  const appts = await Appointment.find({ user: req.user._id })
    .populate('provider', 'name')
    .sort({ date: 1, time: 1 });

  res.json(appts);
});

// GET /api/appointments/admin/list?providerId=&date=
router.get('/admin/list', protect, adminOnly, async (req, res) => {
  const { providerId, date } = req.query;
  const query = {};
  if (providerId) query.provider = providerId;
  if (date) query.date = date;

  const appts = await Appointment.find(query)
    .populate('provider', 'name')
    .populate('user', 'name email')
    .sort({ date: 1, time: 1 });

  res.json(appts);
});

// PATCH /api/appointments/cancel/:id
router.patch('/cancel/:id', protect, async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });

  const isOwner = String(appt.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Not allowed to cancel this appointment' });
  }

  appt.status = 'CANCELLED';
  await appt.save();
  res.json(appt);
});

export default router;
