const express = require('express');
const router = express.Router();

const {
  listWorkers,
  getWorker,
  createWorker,
  updateWorker,
  assignWorker,
  deactivateWorker,
  reactivateWorker,
  getWorkerPerformance,
  importWorkers,
} = require('../controllers/workerController');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const { requireElectionScope } = require('../middleware/electionScope');
const upload = require('../middleware/upload');

// All worker routes are election-scoped. Both roles can view; only
// SuperAdmin/RegionalAdmin with write access can create/edit — adjust
// the restrictTo(...) lists below if RegionalAdmins should be
// read-only instead (not specified in the Phase 4 checklist, so this
// assumes RegionalAdmins manage workers within their own scope).
router.get('/', protect, requireElectionScope, listWorkers);
router.get('/:id', protect, requireElectionScope, getWorker);
router.get('/:id/performance', protect, requireElectionScope, getWorkerPerformance);

router.post('/', protect, requireElectionScope, restrictTo('SuperAdmin', 'RegionalAdmin'), createWorker);
router.post(
  '/import',
  protect,
  requireElectionScope,
  restrictTo('SuperAdmin', 'RegionalAdmin'),
  upload.single('file'),
  importWorkers
);

router.patch('/:id', protect, requireElectionScope, restrictTo('SuperAdmin', 'RegionalAdmin'), updateWorker);
router.patch(
  '/:id/assign',
  protect,
  requireElectionScope,
  restrictTo('SuperAdmin', 'RegionalAdmin'),
  assignWorker
);
router.patch(
  '/:id/deactivate',
  protect,
  requireElectionScope,
  restrictTo('SuperAdmin', 'RegionalAdmin'),
  deactivateWorker
);
router.patch(
  '/:id/reactivate',
  protect,
  requireElectionScope,
  restrictTo('SuperAdmin', 'RegionalAdmin'),
  reactivateWorker
);

module.exports = router;
