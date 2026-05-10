const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number,
  },
  { _id: false },
);

const repairLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "diagnosis",
        "parts_ordered",
        "repair_started",
        "issue_found",
        "completed",
        "note",
      ],
    },
    note: { type: String },
    visibility: {
      type: String,
      enum: ["internal", "shared"],
      default: "shared",
    },
    photos: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, unique: true, index: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },
    acceptedBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "laptop", "pc", "console"],
      required: true,
    },
    deviceBrand: { type: String, required: true },
    deviceModel: { type: String, required: true },
    deviceSerial: { type: String },
    issueTitle: { type: String, required: true, maxlength: 100 },
    issueDescription: { type: String, required: true },
    photos: [{ type: String }],
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    finalPrice: { type: Number },
    status: {
      type: String,
      enum: [
        "open",
        "bids_received",
        "assigned",
        "pickup_scheduled",
        "device_in_transit",
        "device_received",
        "in_repair",
        "repair_complete",
        "return_in_transit",
        "delivered",
        "closed",
        "cancelled",
        "disputed",
        "no_bids",
      ],
      default: "open",
    },
    pickupAddress: addressSchema,
    preferredHandover: {
      type: String,
      enum: ["pickup_delivery", "drop_off"],
      default: "pickup_delivery",
    },
    repairLog: [repairLogSchema],
    statusHistory: [statusHistorySchema],
    biddingExpiresAt: { type: Date },
    isBiddingOpen: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ticketSchema.index({ assignedProviderId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ deviceType: 1 });
ticketSchema.index({ createdAt: -1 });

ticketSchema.pre("save", function () {
  if (this.isNew && !this.biddingExpiresAt) {
    this.biddingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
