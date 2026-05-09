const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'provider.approve', 'user.ban', 'ticket.override'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
