const mongoose = require('mongoose');

const STATUSES = ['draft', 'active', 'closed'];
const QUESTION_TYPES = ['text', 'number', 'single_choice', 'multi_choice', 'boolean'];

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    options: { type: [String], default: [] }, // used by single/multi_choice
    required: { type: Boolean, default: true },
  },
  { _id: true }
);

const surveySchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },

    questions: { type: [questionSchema], default: [] },

    // Which regions this survey is assigned to. Empty = all regions,
    // same convention as Election.regionScope.
    regionScope: { type: [String], default: [] },

    status: {
      type: String,
      enum: STATUSES,
      default: 'draft',
    },

    // Drives the "overdue survey" alert — a survey past dueDate that
    // still has workers who haven't submitted a Response is overdue.
    dueDate: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

surveySchema.index({ electionId: 1, status: 1 });

surveySchema.statics.STATUSES = STATUSES;
surveySchema.statics.QUESTION_TYPES = QUESTION_TYPES;

module.exports = mongoose.model('Survey', surveySchema);
