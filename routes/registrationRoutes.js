import express from 'express';
import crypto from 'crypto';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import Programme from '../models/Programme.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/registrations  — admin sees all, student sees own
router.get('/', protect, async (req, res) => {
  try {
    let registrations;
    if (req.user.role === 'admin') {
      registrations = await Registration.find()
        .populate('programme', 'title beamType')
        .sort({ createdAt: -1 });
    } else {
      registrations = await Registration.find({ email: req.user.email })
        .populate('programme', 'title beamType')
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registrations  — public: submit enrollment application
router.post('/', async (req, res) => {
  try {
    const { fullName, email, phone, programmeId, programmeName, statementOfIntent } = req.body;

    // Prevent duplicate pending applications for same programme
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
      fullName,
      email: email.toLowerCase(),
      phone,
      programme: programmeId,
      programmeName,
      statementOfIntent,
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Application submitted! The admin will review and contact you shortly.',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/registrations/:id/approve  — admin: approve + create student account
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('programme');
    if (!registration)
      return res.status(404).json({ success: false, message: 'Registration not found' });

    if (registration.status === 'Approved')
      return res.status(400).json({ success: false, message: 'Already approved' });

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(5).toString('hex'); // e.g. "a3f9c2b4e1"

    // Create or find student user account
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

    // Add programme to student's progress tracker
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

    // Update registration status
    registration.status = 'Approved';
    await registration.save();

    res.json({
      success: true,
      message: `Approved. Student account ready.`,
      tempPassword, // in production, email this to the student
      studentId: studentUser._id,
      data: registration,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/registrations/:id/reject  — admin
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
