const mongoose = require('mongoose');
const Election = require('../models/Election');

// GET /api/elections
// Returns every election (active + archived) — the frontend table shows
// both and uses the Badge/Reactivate button to distinguish them.
exports.listElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections.map((e) => e.toSafeJSON()));
  } catch (err) {
    next(err);
  }
};

// GET /api/elections/:id
exports.getElection = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election id' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    res.json(election.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// POST /api/elections
// Body: { name, startDate?, endDate?, regionScope? }
exports.createElection = async (req, res, next) => {
  try {
    const { name, startDate, endDate, regionScope } = req.body;

    const election = new Election({
      name,
      startDate: startDate || null,
      endDate: endDate || null,
      regionScope: Array.isArray(regionScope) ? regionScope : [],
      createdBy: req.admin?._id, // set by the `protect` auth middleware
    });

    await election.save();
    res.status(201).json(election.toSafeJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/elections/:id
// Body: any subset of { name, startDate, endDate, regionScope }
// Deliberately does NOT accept `status` here — that's archive/activate's job,
// so status transitions stay auditable as their own explicit action.
exports.updateElection = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election id' });
    }

    const { name, startDate, endDate, regionScope } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (regionScope !== undefined) updates.regionScope = regionScope;

    const election = await Election.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    res.json(election.toSafeJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/elections/:id/archive
exports.archiveElection = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election id' });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );
    if (!election) return res.status(404).json({ error: 'Election not found' });

    res.json(election.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// PATCH /api/elections/:id/activate
exports.activateElection = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid election id' });
    }

    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!election) return res.status(404).json({ error: 'Election not found' });

    res.json(election.toSafeJSON());
  } catch (err) {
    next(err);
  }
};
