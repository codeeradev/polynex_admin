const multer = require('multer');

// Requires: npm install multer
//
// Memory storage — CSV is parsed immediately and never needs to touch
// disk. Rejects non-CSV mimetypes and caps size to keep bulk imports
// from being used to upload arbitrary large files.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) return cb(new Error('Only .csv files are accepted'));
    cb(null, true);
  },
});

module.exports = upload;
