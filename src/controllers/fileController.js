const path = require('path');
const fs = require('fs');

function serveUploadFile(req, res) {
  const { folderName, imageName } = req.params;
  const filePath = path.join(process.cwd(), 'uploads', folderName, imageName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).json({ message: 'File not found' });
}

module.exports = { serveUploadFile };
