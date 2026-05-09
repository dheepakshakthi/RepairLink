const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  platformFeePercent: { type: Number, default: 10 },
  biddingWindowHours: { type: Number, default: 24 },
  deliverySimulationMinutes: { type: Number, default: 30 },
  deviceCategories: [{ type: String, default: ['mobile', 'laptop', 'pc', 'console'] }],
  serviceCities: [{ type: String, default: [] }],
  maintenanceMode: { type: Boolean, default: false },
  featureFlags: {
    deliverySystemEnabled: { type: Boolean, default: true },
    chatEnabled: { type: Boolean, default: true },
    reviewsEnabled: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('Setting', settingSchema);
