const multer = require('multer');
const path = require('path');
const fs = require('fs');

// General upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Profile picture upload storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  },
});

// Places upload storage
const placesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/places');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  },
});

// Slides upload storage
const slidesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/slides');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  },
});

// Icons upload storage
const iconsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/icons');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const uploadProfile = multer({ storage: profileStorage });
const uploadPlaces = multer({ storage: placesStorage });
const uploadSlides = multer({ storage: slidesStorage });
const uploadIcons = multer({ storage: iconsStorage });

module.exports = {
  upload,
  uploadProfile,
  uploadPlaces,
  uploadSlides,
  uploadIcons
};