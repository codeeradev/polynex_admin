const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['SuperAdmin', 'RegionalAdmin'];
const STATUSES = ['invited', 'active', 'disabled'];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Excluded from queries by default (`select: false`) so a stray
    // `Admin.find()` anywhere in the codebase can never leak hashes.
    passwordHash: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ROLES,
      required: true,
      default: 'RegionalAdmin',
    },

    // Constituency/ward scope for RegionalAdmin. SuperAdmin ignores this
    // (has access to all regions across all elections).
    assignedRegion: {
      type: String,
      default: null,
    },

    // 'invited' -> account created, waiting on set-password link.
    // 'active'  -> can log in.
    // 'disabled' -> access revoked, kept for audit history.
    status: {
      type: String,
      enum: STATUSES,
      default: 'invited',
    },

    passwordSetupToken: { type: String, select: false },
    passwordSetupExpires: { type: Date, select: false },

    lastLoginAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

adminSchema.pre('validate', function enforceRegionalScope(next) {
  if (this.role === 'RegionalAdmin' && !this.assignedRegion) {
    this.invalidate('assignedRegion', 'assignedRegion is required for RegionalAdmin accounts');
  }
  next();
});

adminSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

adminSchema.methods.setPassword = async function setPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

// Never spread `this` directly into an API response — always go through
// this, so a future field added to the schema doesn't silently leak.
adminSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    assignedRegion: this.assignedRegion,
    status: this.status,
    lastLoginAt: this.lastLoginAt,
  };
};

adminSchema.statics.ROLES = ROLES;
adminSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Admin', adminSchema);
