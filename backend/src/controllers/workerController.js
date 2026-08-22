const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync'); // npm install csv-parse
const Worker = require('../models/Worker');
const Counter = require('../models/Counter');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const { generateWorkerQrCode } = require('../utils/qrCode');

// Shared by createWorker and the bulk import path so both generate IDs
// the same way and can't drift apart.
async function buildWorkerDoc(electionId, fields, createdBy) {
  const seq = await Counter.getNextSequence(`worker:${electionId}`);
  const workerId = `WKR-${String(seq).padStart(6, '0')}`;
  const qrCode = await generateWorkerQrCode(workerId);

  return {
    electionId,
    workerId,
    qrCode,
    name: fields.name,
    phone: fields.phone,
    email: fields.email || null,
    ward: fields.ward,
    constituency: fields.constituency,
    boothId: fields.boothId || null,
    boothNo: fields.boothNo || null,
    createdBy,
  };
}

// GET /api/v1/workers?search=&status=&ward=&constituency=&page=&limit=
exports.listWorkers = async (req, res, next) => {
  try {
    const { electionId } = req;
    const { search, status, ward, constituency, page = 1, limit = 25 } = req.query;

    const filter = { electionId };
    if (status) filter.status = status;
    if (ward) filter.ward = ward;
    if (constituency) filter.constituency = constituency;
    if (search) filter.$text = { $search: search };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(parseInt(limit, 10) || 25, 100);

    const [workers, total] = await Promise.all([
      Worker.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Worker.countDocuments(filter),
    ]);

    res.json({
      workers: workers.map((w) => w.toSafeJSON()),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/workers/:id
exports.getWorker = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }
    // Scope by electionId too — a valid ID from a different election
    // must not resolve here.
    const worker = await Worker.findOne({ _id: req.params.id, electionId: req.electionId });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    res.json(worker.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/workers
// Body: { name, phone, email?, ward, constituency, boothId?, boothNo? }
exports.createWorker = async (req, res, next) => {
  try {
    const doc = await buildWorkerDoc(req.electionId, req.body, req.admin?._id);
    const worker = await Worker.create(doc);
    res.status(201).json(worker.toSafeJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/v1/workers/:id
// Body: any subset of { name, phone, email, ward, constituency, boothId, boothNo }
// Deliberately excludes workerId, qrCode (immutable) and status/approvalStatus
// (those get their own explicit actions below, same pattern as Election).
exports.updateWorker = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }

    const { name, phone, email, ward, constituency, boothId, boothNo } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (ward !== undefined) updates.ward = ward;
    if (constituency !== undefined) updates.constituency = constituency;
    if (boothId !== undefined) updates.boothId = boothId;
    if (boothNo !== undefined) updates.boothNo = boothNo;

    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, electionId: req.electionId },
      updates,
      { new: true, runValidators: true }
    );
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    res.json(worker.toSafeJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/v1/workers/:id/assign
// Body: { ward?, constituency?, boothId?, boothNo? } — at least one required.
// Separate endpoint (rather than folding into updateWorker) because
// reassignment is its own auditable action per the Phase 4 spec.
exports.assignWorker = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }

    const { ward, constituency, boothId, boothNo } = req.body;
    if (!ward && !constituency && !boothId && !boothNo) {
      return res.status(400).json({ error: 'Provide at least one of ward, constituency, boothId, boothNo' });
    }

    const updates = {};
    if (ward !== undefined) updates.ward = ward;
    if (constituency !== undefined) updates.constituency = constituency;
    if (boothId !== undefined) updates.boothId = boothId;
    if (boothNo !== undefined) updates.boothNo = boothNo;

    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, electionId: req.electionId },
      updates,
      { new: true, runValidators: true }
    );
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    res.json(worker.toSafeJSON());
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// PATCH /api/v1/workers/:id/deactivate
exports.deactivateWorker = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, electionId: req.electionId },
      { status: 'inactive' },
      { new: true }
    );
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    res.json(worker.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/workers/:id/reactivate
exports.reactivateWorker = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, electionId: req.electionId },
      { status: 'active' },
      { new: true }
    );
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    res.json(worker.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/workers/:id/performance
// "Assigned" = active surveys whose regionScope covers this worker's
// ward (or is empty, meaning all regions). No dedicated Assignment
// model exists, so this is inferred from Survey + Response rather than
// tracked directly — flagged as an assumption worth revisiting if a
// worker can be assigned a survey outside their own ward/region.
exports.getWorkerPerformance = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid worker id' });
    }
    const worker = await Worker.findOne({ _id: req.params.id, electionId: req.electionId });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const [assignedSurveys, completedResponses, trendRaw] = await Promise.all([
      Survey.countDocuments({
        electionId: req.electionId,
        status: 'active',
        $or: [{ regionScope: { $size: 0 } }, { regionScope: worker.region }],
      }),
      Response.countDocuments({ electionId: req.electionId, workerId: worker._id }),
      Response.aggregate([
        {
          $match: {
            electionId: req.electionId,
            workerId: worker._id,
            submittedAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const pending = Math.max(assignedSurveys - completedResponses, 0);
    const trend = trendRaw.map((t) => ({ date: t._id, count: t.count }));

    res.json({
      assigned: assignedSurveys,
      completed: completedResponses,
      pending,
      trend,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/workers/import  (multipart/form-data, field name "file")
// Validates every row before inserting anything from a valid batch —
// partial success is reported back so the admin can fix just the bad
// rows and re-upload, rather than guessing which ones landed.
const REQUIRED_COLUMNS = ['name', 'phone', 'ward', 'constituency'];
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

exports.importWorkers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded (expected field name "file")' });
    }

    let records;
    try {
      records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    } catch (parseErr) {
      return res.status(400).json({ error: `Could not parse CSV: ${parseErr.message}` });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV has no data rows' });
    }

    const errors = [];
    const validRows = [];

    records.forEach((row, i) => {
      const rowNum = i + 2; // +1 for 0-index, +1 for header row
      const missing = REQUIRED_COLUMNS.filter((col) => !row[col] || !row[col].trim());
      if (missing.length > 0) {
        errors.push({ row: rowNum, reason: `Missing required field(s): ${missing.join(', ')}` });
        return;
      }
      if (!PHONE_REGEX.test(row.phone.trim())) {
        errors.push({ row: rowNum, reason: `Invalid phone number: "${row.phone}"` });
        return;
      }
      validRows.push({ row: rowNum, data: row });
    });

    // Sequential, not Promise.all — Counter.getNextSequence must not
    // race with itself across rows of the same import (findOneAndUpdate
    // is atomic per call, but interleaving many at once is unnecessary
    // load for what's normally an infrequent admin action).
    const created = [];
    for (const { row, data } of validRows) {
      try {
        const doc = await buildWorkerDoc(req.electionId, data, req.admin?._id);
        const worker = await Worker.create(doc);
        created.push(worker.toSafeJSON());
      } catch (err) {
        errors.push({ row, reason: err.message });
      }
    }

    res.status(errors.length > 0 && created.length === 0 ? 400 : 201).json({
      insertedCount: created.length,
      errorCount: errors.length,
      errors,
      workers: created,
    });
  } catch (err) {
    next(err);
  }
};
