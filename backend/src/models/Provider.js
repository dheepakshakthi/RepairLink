const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
  lat: Number,
  lng: Number
}, { _id: false });

const operatingHoursSchema = new mongoose.Schema({
  open: String,
  close: String,
  isClosed: Boolean
}, { _id: false });

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true, trim: true },
  description: { type: String },
  logo: { type: String },
  photos: [{ type: String }],
  serviceCategories: [{ type: String, enum: ['mobile', 'laptop', 'pc', 'console'] }],
  brandSpecializations: [{ type: String }],
  address: addressSchema,
  serviceRadius: { type: Number, default: 10 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  approvalNote: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  operatingHours: {
    mon: operatingHoursSchema,
    tue: operatingHoursSchema,
    wed: operatingHoursSchema,
    thu: operatingHoursSchema,
    fri: operatingHoursSchema,
    sat: operatingHoursSchema,
    sun: operatingHoursSchema
  },
  documents: [{ type: String }],
  earnings: { type: Number, default: 0 }
}, { timestamps: true });

providerSchema.index({ approvalStatus: 1 });
providerSchema.index({ serviceCategories: 1 });

const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
