const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
  ratingQuality: { type: Number, min: 1, max: 5, required: true },
  ratingSpeed: { type: Number, min: 1, max: 5, required: true },
  ratingCommunication: { type: Number, min: 1, max: 5, required: true },
  overallRating: { type: Number },
  comment: { type: String, maxlength: 1000 },
  photos: [{ type: String }],
  providerReply: { type: String },
  providerRepliedAt: { type: Date },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String }
}, { timestamps: true });

reviewSchema.pre('save', function(next) {
  this.overallRating = (this.ratingQuality + this.ratingSpeed + this.ratingCommunication) / 3;
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
