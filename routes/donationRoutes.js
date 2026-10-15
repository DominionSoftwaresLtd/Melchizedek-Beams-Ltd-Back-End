import express from 'express';
import Donation from '../models/Donation.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendDonationReceipt } from '../utils/email.js';

const router = express.Router();

// GET /api/donations  — admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, data: donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/donations/initiate  — public: initiate M-Pesa STK push
router.post('/initiate', async (req, res) => {
  try {
    const { donorName, email, phone, amount, cause, anonymous } = req.body;

    // Normalise phone: 0712... → 254712...
    const normalised = phone.replace(/^0/, '254').replace(/^\+/, '');

    // ── Simulate M-Pesa STK push ──────────────────────────────────
    // In production replace this block with actual Daraja API call
    const isSandbox = process.env.NODE_ENV !== 'production';
    let checkoutRequestId, merchantRequestId;

    if (isSandbox) {
      // Simulate a successful prompt
      checkoutRequestId  = `ws_CO_${Date.now()}`;
      merchantRequestId  = `${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    } else {
      // TODO: integrate Safaricom Daraja STK Push here
      // const mpesaRes = await initiateStkPush({ phone: normalised, amount, ... });
      // checkoutRequestId = mpesaRes.CheckoutRequestID;
      throw new Error('M-Pesa production integration not yet configured');
    }

    // Save pending donation
    const donation = await Donation.create({
      donorName: anonymous ? 'Anonymous' : donorName,
      email: email?.toLowerCase(),
      phone: normalised,
      amount,
      cause: cause || 'General Ministry',
      method: 'M-Pesa',
      transactionRef: checkoutRequestId,
      status: 'Pending',
      anonymous: !!anonymous,
    });

    res.json({
      success: true,
      message: isSandbox
        ? 'STK push simulated. In production you would receive a prompt on your phone.'
        : 'STK push sent. Check your phone.',
      checkoutRequestId,
      merchantRequestId,
      donationId: donation._id,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/donations/confirm  — called after user confirms payment (or M-Pesa callback)
router.post('/confirm', async (req, res) => {
  try {
    const { donationId, transactionCode } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation)
      return res.status(404).json({ success: false, message: 'Donation not found' });

    donation.status = 'Completed';
    donation.transactionRef = transactionCode || donation.transactionRef;
    await donation.save();

    // Send thank-you receipt email
    if (donation.email) {
      try {
        await sendDonationReceipt({
          name:           donation.donorName,
          email:          donation.email,
          amount:         donation.amount,
          cause:          donation.cause,
          transactionRef: donation.transactionRef,
        });
      } catch (emailErr) {
        console.warn('Donation receipt email failed:', emailErr.message);
      }
    }

    res.json({ success: true, message: 'Donation confirmed. Thank you!', data: donation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// M-Pesa Daraja callback (registered at MPESA_CALLBACK_URL)
router.post('/mpesa-callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;

    if (stkCallback?.ResultCode === 0) {
      const items   = stkCallback.CallbackMetadata?.Item || [];
      const getVal  = (name) => items.find((i) => i.Name === name)?.Value;
      const mpesaRef = getVal('MpesaReceiptNumber');
      const checkoutId = stkCallback.CheckoutRequestID;

      await Donation.findOneAndUpdate(
        { transactionRef: checkoutId },
        { status: 'Completed', transactionRef: mpesaRef }
      );
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // always ACK Safaricom
  }
});

export default router;
