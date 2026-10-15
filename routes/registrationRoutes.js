import express from 'express';
import crypto from 'crypto';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/email.js';

const router = express.Router();

// ── GET /api/registrations ────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { email: req.user.email };
    const registrations = await Registration.find(filter)
      .populate('programme', 'title beamType')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/registrations  (public — anyone can apply) ──────────
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, programmeId, programmeName, statementOfIntent } = req.body;
    const existing = await Registration.findOne({
      email: email.toLowerCase(),
      programme: programmeId,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === 'Approved'
          ? 'You are already enrolled in this programme.'
          : 'You already have a pending application for this programme.',
      });
    }

    const registration = await Registration.create({
      fullName, email: email.toLowerCase(), phone,
      programme: programmeId, programmeName, statementOfIntent,
    });
    res.status(201).json({
      success: true, data: registration,
      message: 'Application submitted! The admin will review and contact you shortly.',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/registrations/:id/approve  (admin) ────────────────
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('programme');
    if (!registration)
      return res.status(404).json({ success: false, message: 'Registration not found' });
    if (registration.status === 'Approved')
      return res.status(400).json({ success: false, message: 'Already approved' });

    // Generate a friendly temp password: first part of email + sequential number
    const emailPrefix = registration.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const seq = Math.floor(100 + Math.random() * 900); // 3 digits
    const tempPassword = `${emailPrefix}@${seq}`;

    let studentUser = await User.findOne({ email: registration.email });
    if (!studentUser) {
      studentUser = await User.create({
        name: registration.fullName,
        email: registration.email,
        phone: registration.phone,
        password: tempPassword,
        role: 'student',
        mustChangePassword: true,
        registrationId: registration._id,
      });
    }

    const alreadyEnrolled = studentUser.progress.some(
      (p) => p.programmeId?.toString() === registration.programme?._id?.toString()
    );
    if (!alreadyEnrolled) {
      studentUser.progress.push({
        programmeId: registration.programme._id,
        programmeName: registration.programmeName,
        totalModules: registration.programme.syllabus?.length || 4,
      });
      await studentUser.save();
    }

    registration.status = 'Approved';
    await registration.save();

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail({
        name: registration.fullName,
        email: registration.email,
        tempPassword,
        programmeName: registration.programmeName,
      });
    } catch (emailErr) {
      console.warn('Email send failed (credentials still created):', emailErr.message);
    }

    res.json({
      success: true,
      message: `Approved. Student account created. Temp password: ${tempPassword}`,
      tempPassword,
      studentId: studentUser._id,
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/registrations/:id/reject  (admin) ─────────────────
router.patch('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration)
      return res.status(404).json({ success: false, message: 'Registration not found' });
    registration.status = 'Rejected';
    await registration.save();
    res.json({ success: true, message: 'Registration rejected.', data: registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
