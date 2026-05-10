/**
 * Seed script — creates demo accounts for development/testing.
 * Run with: node src/seed.js
 *
 * Accounts created:
 *   customer@demo.com  / Demo@1234  (role: customer)
 *   provider@demo.com  / Demo@1234  (role: provider)
 *   admin@demo.com     / Demo@1234  (role: admin)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");
};

// Inline minimal schemas so the seed script is self-contained and
// doesn't pull in modules that require Redis/Cloudinary at import time.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    phone: String,
    isVerified: { type: Boolean, default: true }, // skip email-verify flow for demo
    isActive: { type: Boolean, default: true },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true },
);

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: { type: String, default: "Demo Repair Shop" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Provider =
  mongoose.models.Provider || mongoose.model("Provider", providerSchema);

const DEMO_PASSWORD = "Demo@1234";

const DEMO_USERS = [
  { name: "Demo Customer", email: "customer@demo.com", role: "customer" },
  { name: "Demo Provider", email: "provider@demo.com", role: "provider" },
  { name: "Demo Admin", email: "admin@demo.com", role: "admin" },
];

async function seed() {
  await connectDB();

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

  for (const demo of DEMO_USERS) {
    const existing = await User.findOne({ email: demo.email });

    if (existing) {
      // Update password hash in case it changed, and ensure isVerified/isActive
      await User.updateOne(
        { _id: existing._id },
        { $set: { passwordHash, isVerified: true, isActive: true } },
      );
      console.log(`✔  Updated : ${demo.email}`);

      if (demo.role === "provider") {
        await Provider.findOneAndUpdate(
          { userId: existing._id },
          {
            $set: { approvalStatus: "approved", shopName: "Demo Repair Shop" },
          },
          { upsert: true, returnDocument: "after" },
        );
      }
    } else {
      const user = await User.create({
        ...demo,
        passwordHash,
        isVerified: true,
        isActive: true,
      });
      console.log(`✔  Created : ${demo.email}  (${demo.role})`);

      if (demo.role === "provider") {
        await Provider.create({
          userId: user._id,
          shopName: "Demo Repair Shop",
          approvalStatus: "approved",
        });
      }
    }
  }

  console.log("\nSeed complete!");
  console.log("─────────────────────────────────────");
  console.log("  customer@demo.com  /  Demo@1234");
  console.log("  provider@demo.com  /  Demo@1234");
  console.log("  admin@demo.com     /  Demo@1234");
  console.log("─────────────────────────────────────\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
