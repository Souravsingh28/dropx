import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads folder exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Keep file in memory; we will compress with sharp
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
});

// POST /api/upload/photo
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const mime = req.file.mimetype || '';
    // Many Windows builds of sharp can't decode HEIC/HEIF; fail clearly
    if (mime.includes('heic') || mime.includes('heif')) {
      return res.status(415).json({
        error:
          'HEIC/HEIF images are not supported on this server. Please switch your camera to JPEG/Most Compatible or upload a JPG/PNG.'
      });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const outPath = path.join(uploadDir, filename);

    // Convert to JPEG (quality 80) and auto-rotate (EXIF)
    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outPath);

    return res.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('Upload error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large (max 25 MB).' });
    }
    return res.status(500).json({ error: 'Upload failed. Try a JPG/PNG under 25 MB.' });
  }
});

export default router;
