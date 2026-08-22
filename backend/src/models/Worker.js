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

    // Human-facing unique ID, e.g. "WKR-000123". Auto-generated on
    // creation (see controllers/workerController.js) via Counter — never
    // set this directly in a request body.
    workerId: { type: String, required: true, unique: true, index: true },

    // PNG data URL encoding workerId, generated alongside it. Render
    // directly with <img src={worker.qrCode} />.
    qrCode: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: null },

    // Ward/constituency are the Phase 4 hierarchy for assignment and
    // filtering. `region` is kept as the flat field the Phase 3
    // dashboard aggregations already group by — it's auto-set to `ward`
    // in the pre-validate hook below so there's one source of truth
    // instead of two fields drifting apart.
    ward: { type: String, required: true, trim: true },
    constituency: { type: String, required: true, trim: true },
    region: { type: String, index: true }, // derived from `ward` — do not set directly

    boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', default: null },
    // Denormalized booth number for display/CSV without a populate —
    // kept in sync with boothId's Booth.boothNumber where possible, but
    // also settable directly for bulk import rows that don't reference
    // an existing Booth document.
    boothNo: { type: String, trim: true, default: null },

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

    lastActiveAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

workerSchema.pre('validate', function deriveRegion(next) {
  this.region = this.ward;
  next();
});

workerSchema.index({ electionId: 1, region: 1 });
workerSchema.index({ electionId: 1, constituency: 1 });
// Search support for the worker list page (name/phone/workerId lookup).
workerSchema.index({ name: 'text', phone: 'text', workerId: 'text' });

workerSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    workerId: this.workerId,
    qrCode: this.qrCode,
    name: this.name,
    phone: this.phone,
    email: this.email,
    ward: this.ward,
    constituency: this.constituency,
    region: this.region,
    boothId: this.boothId,
    boothNo: this.boothNo,
    approvalStatus: this.approvalStatus,
    status: this.status,
    lastActiveAt: this.lastActiveAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

workerSchema.statics.APPROVAL_STATUSES = APPROVAL_STATUSES;
workerSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Worker', workerSchema);
