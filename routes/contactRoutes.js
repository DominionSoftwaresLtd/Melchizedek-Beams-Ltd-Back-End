import express from 'express';
import Contact from '../models/Contact.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendContactConfirmation } from '../utils/email.js';

const router = express.Router();

// GET /api/contact  — admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/contact  — public
router.post('/', async (req, res) => {
  try {
    const contact = await Contact.create({
      ...req.body,
      email: req.body.email?.toLowerCase(),
    });

    // Send confirmation to sender
    try {
      await sendContactConfirmation({ name: contact.fullName, email: contact.email });
    } catch (emailErr) {
      console.warn('Contact confirmation email failed:', emailErr.message);
    }

    res.status(201).json({ success: true, data: contact, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/contact/:id/read  — admin: mark as read
router.patch('/:id/read', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'Read' },
      { new: true }
    );
    if (!contact)
      return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/contact/:id  — admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
