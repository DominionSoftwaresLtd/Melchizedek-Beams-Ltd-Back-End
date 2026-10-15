import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Use Gmail in production — swap for any SMTP in .env
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const FROM = `"Melchizedek Beams Ltd" <${process.env.EMAIL_FROM || 'info@melchizedekbeams.org'}>`;

// ── Generic send helper ───────────────────────────────────────────
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ── Welcome / account created email ──────────────────────────────
export const sendWelcomeEmail = async ({ name, email, tempPassword, programmeName }) => {
  await sendEmail({
    to: email,
    subject: 'Your Melchizedek Beams Account Has Been Created',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#0F383E;padding:24px 32px;text-align:center;">
          <h1 style="color:#fff;font-size:22px;margin:0;">Melchizedek Beams Ltd</h1>
          <p style="color:#D97706;font-size:13px;margin:4px 0 0;">Equipping Believers, Beam by Beam</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:15px;color:#374151;">Dear <strong>${name}</strong>,</p>
          <p style="color:#374151;">Your application for <strong>${programmeName}</strong> has been <span style="color:#16a34a;font-weight:bold;">approved</span>!</p>
          <p style="color:#374151;">Your student account has been created. Here are your login details:</p>
          <div style="background:#FAF9F5;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Please log in and change your password immediately.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin"
            style="display:inline-block;background:#D97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
            Sign In Now
          </a>
          <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;">If you have questions, reply to this email or call +254798398350.</p>
        </div>
      </div>`,
  });
};

// ── OTP email ─────────────────────────────────────────────────────
export const sendOtpEmail = async ({ name, email, otp }) => {
  await sendEmail({
    to: email,
    subject: 'Your Password Reset Code — Melchizedek Beams',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#0F383E;padding:20px 32px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:18px;">Password Reset</h2>
        </div>
        <div style="padding:28px;">
          <p style="color:#374151;">Hi <strong>${name || 'there'}</strong>,</p>
          <p style="color:#374151;">Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;background:#0F383E;color:#D97706;font-size:32px;font-weight:900;letter-spacing:10px;padding:16px 32px;border-radius:12px;">
              ${otp}
            </span>
          </div>
          <p style="color:#6b7280;font-size:13px;">If you did not request this reset, you can safely ignore this email.</p>
        </div>
      </div>`,
  });
};

// ── Donation thank-you ────────────────────────────────────────────
export const sendDonationReceipt = async ({ name, email, amount, cause, transactionRef }) => {
  await sendEmail({
    to: email,
    subject: 'Thank You for Your Generous Contribution — Melchizedek Beams',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:#0F383E;padding:24px 32px;text-align:center;">
          <h1 style="color:#fff;font-size:20px;margin:0;">Melchizedek Beams Ltd</h1>
          <p style="color:#D97706;font-size:13px;margin:4px 0 0;">Donation Receipt</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;">Dear <strong>${name || 'Supporter'}</strong>,</p>
          <p style="color:#374151;">Thank you for your generous contribution to Melchizedek Beams Ltd. Your giving directly supports the discipleship work we do.</p>
          <div style="background:#FAF9F5;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Cause:</strong> ${cause}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Reference:</strong> ${transactionRef || 'N/A'}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <p style="color:#374151;font-size:13px;">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7</p>
          <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;">Questions? Contact us at info@melchizedekbeams.org or +254798398350.</p>
        </div>
      </div>`,
  });
};

// ── Contact / message received confirmation ───────────────────────
export const sendContactConfirmation = async ({ name, email }) => {
  await sendEmail({
    to: email,
    subject: 'We received your message — Melchizedek Beams',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
        <div style="background:#0F383E;padding:20px 32px;border-radius:12px 12px 0 0;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:18px;">Melchizedek Beams Ltd</h2>
        </div>
        <div style="padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p style="color:#374151;">Dear <strong>${name}</strong>,</p>
          <p style="color:#374151;">Thank you for reaching out! We have received your message and will get back to you within 24–48 hours.</p>
          <p style="color:#6b7280;font-size:13px;">In the meantime, feel free to explore our programmes at <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/programmes" style="color:#D97706;">melchizedekbeams.org</a>.</p>
          <p style="color:#9ca3af;font-size:12px;">info@melchizedekbeams.org · +254798398350</p>
        </div>
      </div>`,
  });
};
