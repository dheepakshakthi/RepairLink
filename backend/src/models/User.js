const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  label: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  lat: Number,
  lng: Number
}, { _id: false });

const notifPreferencesSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  inApp: { type: Boolean, default: true },
  sms: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  phone: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  savedAddresses: [addressSchema],
  notifPreferences: { type: notifPreferencesSchema, default: () => ({}) },
  refreshTokens: [{ type: String }]
}, { timestamps: true });

userSchema.virtual('isProvider').get(function() {
  return this.role === 'provider';
});

userSchema.methods.comparePassword = async function(plain) {
  return await bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
};

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
