import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/students/me  — student: own profile + progress
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('progress.programmeId', 'title beamType syllabus imageUrl');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students  — admin: list all students
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('progress.programmeId', 'title beamType')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/students/:id/progress  — admin: mark module complete
router.patch('/:id/progress', protect, authorize('admin'), async (req, res) => {
  try {
    const { programmeId, moduleLabel } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const prog = student.progress.find(
      (p) => p.programmeId?.toString() === programmeId
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Programme not in student progress' });

    if (!prog.completedModules.includes(moduleLabel)) {
      prog.completedModules.push(moduleLabel);
    }

    prog.percentComplete = Math.round((prog.completedModules.length / (prog.totalModules || 1)) * 100);

    if (prog.percentComplete >= 100 && !prog.completedAt) {
      prog.completedAt = new Date();
    }

    await student.save();
    res.json({ success: true, data: student.progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students/:id/certificate  — admin: issue certificate
router.post('/:id/certificate', protect, authorize('admin'), async (req, res) => {
  try {
    const { programmeId } = req.body;
    const student = await User.findById(req.params.id)
      .populate('progress.programmeId', 'title beamType');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const prog = student.progress.find(
      (p) => p.programmeId?._id?.toString() === programmeId
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Programme not found in progress' });
    if (prog.percentComplete < 100) return res.status(400).json({ success: false, message: 'Programme not yet complete' });

    prog.certificateIssued = true;
    prog.certificateIssuedAt = new Date();
    await student.save();

    // Return certificate data — frontend renders a printable certificate
    res.json({
      success: true,
      certificate: {
        studentName: student.name,
        programmeName: prog.programmeId?.title || prog.programmeName,
        beamType: prog.programmeId?.beamType,
        completedAt: prog.completedAt,
        issuedAt: prog.certificateIssuedAt,
        issuedBy: 'Melchizedek Beams Ltd',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/:id/certificate/:programmeId  — student: download own certificate
router.get('/:id/certificate/:programmeId', protect, async (req, res) => {
  try {
    // Students can only access their own certificate
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    const student = await User.findById(req.params.id)
      .populate('progress.programmeId', 'title beamType');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const prog = student.progress.find(
      (p) => p.programmeId?._id?.toString() === req.params.programmeId
    );
    if (!prog || !prog.certificateIssued)
      return res.status(404).json({ success: false, message: 'Certificate not yet issued' });

    res.json({
      success: true,
      certificate: {
        studentName: student.name,
        programmeName: prog.programmeId?.title || prog.programmeName,
        beamType: prog.programmeId?.beamType,
        completedAt: prog.completedAt,
        issuedAt: prog.certificateIssuedAt,
        issuedBy: 'Melchizedek Beams Ltd',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
