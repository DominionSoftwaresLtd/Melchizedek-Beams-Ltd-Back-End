import express from 'express';
import Team from '../models/Team.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1 });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
