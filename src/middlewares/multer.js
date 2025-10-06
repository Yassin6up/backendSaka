const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const profilesDir = path.join(process.cwd(), 'uploads', 'profiles');
ensureDir(profilesDir);
const profileUpload = multer({ dest: profilesDir });
const upload = multer({ storage: tempStorage });

module.exports = { upload, profileUpload };
