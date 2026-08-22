const mongoose = require('mongoose');

const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];
const STATUSES = ['active', 'inactive'];

const workerSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: null },

    // Denormalized onto the worker (rather than only via boothId) so
    // region-wise dashboard aggregations don't need a $lookup per query.
    region: { type: String, required: true, index: true },

    boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', default: null },

    // A RegionalAdmin adds workers; a SuperAdmin (or a RegionalAdmin with
    // sufficient scope) approves them. Drives the "pending approvals" KPI.
    approvalStatus: {
      type: String,
      enum: APPROVAL_STATUSES,
      default: 'pending',
    },

    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },

    // Updated whenever the worker logs in / submits something. Drives
    // the "inactive worker" alert (e.g. no activity in N days).
    lastActiveAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

workerSchema.index({ electionId: 1, region: 1 });

workerSchema.statics.APPROVAL_STATUSES = APPROVAL_STATUSES;
workerSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Worker', workerSchema);
