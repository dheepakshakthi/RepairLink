const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  quotedPrice: { type: Number, required: true, min: 0 },
  estimatedDays: { type: Number, required: true, min: 1 },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'withdrawn', 'expired'], default: 'pending' },
  expiresAt: { type: Date }
}, { timestamps: true });

bidSchema.index({ ticketId: 1, providerId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
