const mongoose = require('mongoose');

const SYNC_STATUSES = ['synced', 'pending', 'failed'];

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },

    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true, index: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', default: null },

    // Denormalized from the submitting worker at write time, same
    // rationale as Worker.region — avoids a $lookup on every dashboard query.
    region: { type: String, required: true, index: true },

    answers: { type: [answerSchema], default: [] },

    submittedAt: { type: Date, default: Date.now, index: true },

    // Mobile workers may submit offline; this tracks whether the
    // submission has synced to the server successfully. Drives the
    // "sync failure" alert.
    syncStatus: {
      type: String,
      enum: SYNC_STATUSES,
      default: 'synced',
    },
  },
  { timestamps: true }
);

responseSchema.index({ electionId: 1, region: 1 });
responseSchema.index({ electionId: 1, submittedAt: 1 });
// One submission per worker per survey — remove if multiple submissions
// per worker should be allowed for the same survey.
responseSchema.index({ surveyId: 1, workerId: 1 }, { unique: true });

responseSchema.statics.SYNC_STATUSES = SYNC_STATUSES;

module.exports = mongoose.model('Response', responseSchema);
