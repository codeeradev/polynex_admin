const express = require('express');
const router = express.Router();

const {
  listElections,
  getElection,
  createElection,
  updateElection,
  archiveElection,
  activateElection,
} = require('../controllers/electionController');

// ADJUST THIS IMPORT to match your actual auth middleware file/export names.
// Assumed shape based on Admin.role: `protect` verifies the JWT and loads
// req.admin; `restrictTo(...roles)` 403s if req.admin.role isn't included.
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All election management is SuperAdmin-only — matches the
// <ProtectedRoute roles={['SuperAdmin']}> gate on ElectionsPage.jsx.
// RegionalAdmins can still READ elections (e.g. to populate the top-nav
// switcher) but cannot create/archive/activate.
router.get('/', protect, listElections);
router.get('/:id', protect, getElection);

router.post('/', protect, restrictTo('SuperAdmin'), createElection);
router.patch('/:id', protect, restrictTo('SuperAdmin'), updateElection);
router.patch('/:id/archive', protect, restrictTo('SuperAdmin'), archiveElection);
router.patch('/:id/activate', protect, restrictTo('SuperAdmin'), activateElection);

module.exports = router;

// In your main app file (app.js / server.js), mount with:
//   app.use('/api/elections', require('./routes/electionRoutes'));
