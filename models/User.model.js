const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // ─── EXISTING FIELDS (touch nahi kiye) ───────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isVerifiedBadge: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 150,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      }
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    reportedPosts: [
      {
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    closeFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    notifications: [
      {
        type: { type: String },
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: {
      type: String,
      default: null,
    },
    otpExpire: {
      type: Date,
      default: null,
    },

    // ─── NAYI FIELDS (sirf ye add kiye hain) ─────────────────

    // Profile extras
    username: {
      type: String,
      unique: true,
      sparse: true,         // null values pe unique conflict nahi hoga
      lowercase: true,
      trim: true,
      maxlength: [30, 'Username 30 characters se zyada nahi ho sakta'],
      match: [/^[a-zA-Z0-9_.]+$/, 'Username mein sirf letters, numbers, _ aur . allowed hain'],
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer_not_to_say', null],
      default: null,
    },
    coverPhoto: {
      type: String,
      default: null,
    },
    link: {
      type: String,
      default: null,
      trim: true,
    },

    // Account control (admin use karta hai)
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'pending_verification'],
      default: 'active',
    },
    membershipPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    badge: {
      type: String,
      enum: ['none', 'verified', 'top_contributor', 'moderator'],
      default: 'none',
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },

    // Permissions — ek object mein sab control
    permissions: {
      canPost:             { type: Boolean, default: true },
      canMessage:          { type: Boolean, default: true },
      canComment:          { type: Boolean, default: true },
      isProfilePublic:     { type: Boolean, default: true },
      emailNotifications:  { type: Boolean, default: true },
      pushNotifications:   { type: Boolean, default: true },
      twoFactorAuth:       { type: Boolean, default: false },
      showOnlineStatus:    { type: Boolean, default: true },
    },

    // Activity tracking
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },

    // Admin-only internal note
    adminNote: {
      type: String,
      default: null,
      select: false,        // API response mein kabhi nahi aayega
    },
  },
  { timestamps: true }
);

// ─── INDEXES ──────────────────────────────────────────────────
userSchema.index({ location: '2dsphere' });   // existing — rakha
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

// ─── USERNAME AUTO-GENERATE ───────────────────────────────────
// Agar user ne username nahi diya toh name se auto banta hai
userSchema.pre('save', function (next) {
  if (!this.username && this.name) {
    this.username =
      this.name.toLowerCase().replace(/\s+/g, '_') +
      '_' +
      Math.floor(Math.random() * 9999);
  }
  next();
});

// ─── PASSWORD HASH (existing — touch nahi kiya) ───────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── EXISTING METHODS (touch nahi kiye) ──────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// ─── NAYA METHOD: Public profile (sensitive data remove) ──────
// Response mein ye sensitive fields kabhi nahi jayengi
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpire;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.adminNote;
  delete obj.blockedUsers;
  delete obj.reportedPosts;
  return obj;
};

module.exports = mongoose.model('User', userSchema);