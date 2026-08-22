const mongoose = require('mongoose');

const STATUSES = ['active', 'archived'];

const electionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    // Constituency/ward names this election is scoped to. Empty array
    // means "all regions" — mirrors the ElectionsPage.jsx UI, which
    // renders 'All regions' when this is empty.
    regionScope: {
      type: [String],
      default: [],
    },

    // 'active'   -> selectable in the top-nav switcher, appears in scoped queries.
    // 'archived' -> hidden from the switcher's default list, data preserved for history.
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

electionSchema.pre('validate', function enforceDateOrder(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'endDate must be on or after startDate');
  }
  next();
});

// Same pattern as Admin.toSafeJSON — go through this instead of spreading
// `this`, so future schema fields don't leak unreviewed into API responses.
electionSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    startDate: this.startDate,
    endDate: this.endDate,
    regionScope: this.regionScope,
    status: this.status,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

electionSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Election', electionSchema);
