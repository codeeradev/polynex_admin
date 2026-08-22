const QRCode = require('qrcode');

// Requires: npm install qrcode
//
// Encodes the worker's ID as a scannable QR code, returned as a PNG
// data URL (safe to store directly in Mongo and render with an <img>
// tag on the frontend — no separate file storage needed).
async function generateWorkerQrCode(workerId) {
  return QRCode.toDataURL(workerId, { errorCorrectionLevel: 'M', margin: 1, width: 300 });
}

module.exports = { generateWorkerQrCode };
