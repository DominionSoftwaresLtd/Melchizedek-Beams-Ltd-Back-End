import express from 'express';
import Registration from '../models/Registration.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find().populate('programme').sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const registration = await Registration.create(req.body);
    res.status(201).json({ success: true, data: registration, message: 'Registration submitted successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
