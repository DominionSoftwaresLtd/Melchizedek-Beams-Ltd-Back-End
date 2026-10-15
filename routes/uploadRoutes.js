import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Storage: disk, organised by type ──────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.type === 'gallery' ? 'gallery' : 'articles';
    const dest   = path.join(__dirname, '..', 'uploads', folder);
    // Create directory if it doesn't exist
    import('fs').then(({ mkdirSync }) => {
      mkdirSync(dest, { recursive: true });
      cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) && allowed.test(file.mimetype.replace('image/', ''))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter,
});

// POST /api/upload?type=gallery|articles
// Returns the public URL of the uploaded file
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const folder   = req.query.type === 'gallery' ? 'gallery' : 'articles';
  const fileUrl  = `/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    url:     fileUrl,
    filename: req.file.filename,
    size:    req.file.size,
  });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
