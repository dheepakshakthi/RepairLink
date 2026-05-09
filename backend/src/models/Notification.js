const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['bid', 'status', 'delivery', 'system', 'review', 'chat'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
