const mongoose = require('mongoose');

const STATUSES = ['active', 'inactive'];

const boothSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    boothNumber: { type: String, required: true, trim: true },
    region: { type: String, required: true, index: true },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

boothSchema.index({ electionId: 1, region: 1 });
// A booth number should be unique within a given election, not globally
// (two different elections can both have a "Booth 12").
boothSchema.index({ electionId: 1, boothNumber: 1 }, { unique: true });

boothSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Booth', boothSchema);
