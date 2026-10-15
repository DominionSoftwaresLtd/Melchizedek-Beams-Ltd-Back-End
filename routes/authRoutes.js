import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { protect } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/email.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mustChangePassword: user.mustChangePassword,
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({ success: true, token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/register (admin/seed use) ──────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ success: false, message: 'User already exists' });

    const user = await User.create({ name, email, password, role: role || 'student' });
    res.status(201).json({ success: true, token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('progress.programmeId', 'title beamType');
  res.json({ success: true, user });
});

// ── PATCH /api/auth/change-password ──────────────────────────────
router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────
// Generates a 6-digit OTP and emails it
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always respond success so we don't expose whether email exists
    if (!user) return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Invalidate old OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

    try {
      await sendOtpEmail({ name: user.name, email: user.email, otp });
    } catch (emailErr) {
      // Don't fail the request if email is not configured — return OTP in dev
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ success: true, message: 'OTP generated (email not configured in dev).', devOtp: otp });
      }
    }

    res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email: email?.toLowerCase(), otp, used: false });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    // Issue a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    record.used = true;
    await record.save();

    // Store hashed reset token on user (expires 10 min)
    const user = await User.findOne({ email: email.toLowerCase() });
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
