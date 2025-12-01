import express from 'express';
import { Provider } from '../models/Provider.js';

const router = express.Router();

// Seed a default provider + services (GET /api/providers/seed)
router.get('/seed', async (req, res) => {
  try {
    const existing = await Provider.findOne();
    if (existing) {
      return res.json({ message: 'Provider already seeded', existing });
    }

    const provider = await Provider.create({
      name: 'Hydro Expert - Central Farm',
      defaultWorkingHours: { start: '09:00', end: '17:00' },
      serviceTypes: [
        { name: 'Consultation', durationMinutes: 30 },
        { name: 'Site Visit', durationMinutes: 60 }
      ]
    });

    res.json({ message: 'Seeded provider', provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Seeding failed' });
  }
});

// Get all providers (GET /api/providers)
router.get('/', async (req, res) => {
  const providers = await Provider.find();
  res.json(providers);
});

export default router;
