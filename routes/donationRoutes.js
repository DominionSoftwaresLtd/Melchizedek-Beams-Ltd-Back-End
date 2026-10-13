import express from 'express';
import Donation from '../models/Donation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const donation = await Donation.create(req.body);
    res.status(201).json({ success: true, data: donation, message: 'Donation recorded successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
