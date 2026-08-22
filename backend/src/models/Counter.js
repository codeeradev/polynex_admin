// const mongoose = require('mongoose');

// // Generic auto-increment counter, keyed by an arbitrary string
// // (e.g. `worker:<electionId>`). Using $inc via findOneAndUpdate makes
// // the increment atomic even under concurrent requests / bulk imports,
// // which a naive "count existing docs + 1" approach would not be.
// const counterSchema = new mongoose.Schema({
//   _id: { type: String, required: true },
//   seq: { type: Number, default: 0 },
// });

// counterSchema.statics.getNextSequence = async function getNextSequence(key) {
//   const doc = await this.findOneAndUpdate(
//     { _id: key },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );
//   return doc.seq;
// };

// module.exports = mongoose.model('Counter', counterSchema);

const mongoose = require('mongoose');

// Generic auto-increment counter, keyed by an arbitrary string
// (e.g. `worker:<electionId>`). Using $inc via findOneAndUpdate makes
// the increment atomic even under concurrent requests / bulk imports,
// which a naive "count existing docs + 1" approach would not be.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function getNextSequence(key) {
  const doc = await this.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
