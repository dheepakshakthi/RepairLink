const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { type: String },
  at: { type: Date }
}, { _id: false });

const deliverySchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  leg: { type: String, enum: ['outbound', 'return'], required: true },
  status: { type: String, enum: ['scheduled', 'picked_up', 'in_transit', 'delivered_to_provider', 'picked_up_from_provider', 'return_in_transit', 'delivered_to_customer', 'failed'], default: 'scheduled' },
  fromAddress: addressSchema,
  toAddress: addressSchema,
  agentName: { type: String },
  agentPhone: { type: String },
  vehicleNo: { type: String },
  otpHash: { type: String, select: false },
  otpExpiresAt: { type: Date },
  otpVerified: { type: Boolean, default: false },
  scheduledTime: { type: Date },
  estimatedArrival: { type: Date },
  deliveredAt: { type: Date },
  statusHistory: [statusHistorySchema],
  notes: { type: String }
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
