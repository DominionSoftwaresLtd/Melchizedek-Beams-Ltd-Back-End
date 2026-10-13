import express from 'express';
import Programme from '../models/Programme.js';

const router = express.Router();

// @route   GET /api/programmes
// @desc    Get all programmes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { targetAudience, featured, status } = req.query;
    const filter = {};

    if (targetAudience) filter.targetAudience = targetAudience;
    if (featured) filter.featured = featured === 'true';
    if (status) filter.status = status;

    const programmes = await Programme.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: programmes.length, data: programmes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/programmes/:id
// @desc    Get single programme by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const programme = await Programme.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }]
    });

    if (!programme) {
      return res.status(404).json({ success: false, message: 'Programme not found' });
    }

    res.json({ success: true, data: programme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/programmes
// @desc    Create a new programme
// @access  Private (Admin)
router.post('/', async (req, res) => {
  try {
    const programme = await Programme.create(req.body);
    res.status(201).json({ success: true, data: programme });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/programmes/:id
// @desc    Update a programme
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!programme) {
      return res.status(404).json({ success: false, message: 'Programme not found' });
    }

    res.json({ success: true, data: programme });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/programmes/:id
// @desc    Delete a programme
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const programme = await Programme.findByIdAndDelete(req.params.id);

    if (!programme) {
      return res.status(404).json({ success: false, message: 'Programme not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
