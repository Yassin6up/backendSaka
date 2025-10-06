const fs = require('fs');
const path = require('path');
const multer = require('multer');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createDiskStorage(subfolder) {
  const destinationRoot = path.join(process.cwd(), 'uploads', subfolder);
  ensureDir(destinationRoot);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destinationRoot),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });
}

const uploadTemp = multer({ storage: createDiskStorage('temp') });
const uploadProfiles = multer({ storage: createDiskStorage('profiles') });
const uploadSliders = multer({ storage: createDiskStorage('sliders') });
const uploadServices = multer({ storage: createDiskStorage('services') });
const uploadIcons = multer({ storage: createDiskStorage('icons') });

module.exports = { uploadTemp, uploadProfiles, uploadSliders, uploadServices, uploadIcons };
