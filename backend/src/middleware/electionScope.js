const mongoose = require('mongoose');
const Election = require('../models/Election');

// The frontend's top-nav switcher holds "which election is selected" in
// its own store (per ElectionsPage.jsx's comment: "Every dashboard, worker
// list, and survey scopes itself to whichever election is selected in the
// top-nav switcher"). That selection needs to travel with every API call.
//
// Convention used here: the frontend sends it as a request header,
// `x-election-id`, on every scoped request. Wire your API client
// (axios instance / fetch wrapper) to attach this header from the
// switcher's store value — that's the "auto-attach electionId" frontend
// task from the Phase 2 checklist.
//
// Usage in a scoped route:
//   router.get('/api/workers', protect, requireElectionScope, listWorkers);
//   // then inside listWorkers: Worker.find({ electionId: req.electionId, ... })
async function requireElectionScope(req, res, next) {
  try {
    const electionId = req.header('x-election-id') || req.query.electionId;

    if (!electionId) {
      return res.status(400).json({ error: 'No election selected. Send an x-election-id header.' });
    }
    if (!mongoose.isValidObjectId(electionId)) {
      return res.status(400).json({ error: 'Invalid election id' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Selected election not found' });
    }

    req.electionId = election._id;
    req.election = election; // handy if a route needs status/regionScope too
    next();
  } catch (err) {
    next(err);
  }
}

// Softer variant for endpoints that work with or without a selected
// election (e.g. a SuperAdmin cross-election summary view). Doesn't 400
// on absence, just leaves req.electionId undefined.
async function optionalElectionScope(req, res, next) {
  const electionId = req.header('x-election-id') || req.query.electionId;
  if (!electionId) return next();
  return requireElectionScope(req, res, next);
}

module.exports = { requireElectionScope, optionalElectionScope };
