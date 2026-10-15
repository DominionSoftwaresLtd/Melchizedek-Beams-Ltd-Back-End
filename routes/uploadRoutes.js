import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';

const router   = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR  = path.join(__dirname, '..', 'uploads');

// Ensure base upload directories exist at startup
['gallery', 'articles'].forEach((folder) => {
  fs.mkdirSync(path.join(BASE_DIR, folder), { recursive: true });
});

// ── Storage ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.type === 'gallery' ? 'gallery' : 'articles';
    cb(null, path.join(BASE_DIR, folder));
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept common image MIME types
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter,
});

// ── POST /api/upload?type=gallery|articles ────────────────────────
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received' });
  }

  const folder  = req.query.type === 'gallery' ? 'gallery' : 'articles';
  const fileUrl = `/uploads/${folder}/${req.file.filename}`;

  res.json({
    success:  true,
    url:      fileUrl,
    filename: req.file.filename,
    size:     req.file.size,
  });
});

// ── Multer error handler ──────────────────────────────────────────
router.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message || 'Upload error' });
});

export default router;
