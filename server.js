// Load env vars FIRST — before any other imports that might need them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Routes
import programmeRoutes   from './routes/programmeRoutes.js';
import articleRoutes     from './routes/articleRoutes.js';
import galleryRoutes     from './routes/galleryRoutes.js';
import teamRoutes        from './routes/teamRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import contactRoutes     from './routes/contactRoutes.js';
import donationRoutes    from './routes/donationRoutes.js';
import resourceRoutes    from './routes/resourceRoutes.js';
import authRoutes        from './routes/authRoutes.js';
import studentRoutes     from './routes/studentRoutes.js';

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/programmes',    programmeRoutes);
app.use('/api/articles',      articleRoutes);
app.use('/api/gallery',       galleryRoutes);
app.use('/api/team',          teamRoutes);
app.use('/api/testimonials',  testimonialRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/contact',       contactRoutes);
app.use('/api/donations',     donationRoutes);
app.use('/api/resources',     resourceRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Melchizedek Beams API is running',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown — releases port on restart so EADDRINUSE never happens
process.on('SIGTERM', () => server.close());
process.on('SIGINT',  () => { server.close(); process.exit(0); });
