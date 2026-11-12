const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folders exist
const uploadBase = path.join(__dirname, '../../uploads');
const audioDir = path.join(uploadBase, 'audio');
const imageDir = path.join(uploadBase, 'images');

[uploadBase, audioDir, imageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, audioDir);
    } else {
      cb(null, imageDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'];
  const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedAudio.includes(file.mimetype) || allowedImages.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

module.exports = upload;
